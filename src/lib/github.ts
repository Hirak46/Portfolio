/**
 * GitHub API helper for committing file changes from Vercel (read-only filesystem).
 * When GITHUB_TOKEN is set, saves go to GitHub → triggers Vercel auto-redeploy.
 * When not set, falls back to local filesystem writes (for local dev).
 */

const GITHUB_API = "https://api.github.com";

export function isGitHubConfigured(): boolean {
  return !!(process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.length > 0);
}

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is not set");
  }
  return {
    token,
    owner: process.env.GITHUB_OWNER || "Hirak46",
    repo: process.env.GITHUB_REPO || "Portfolio",
  };
}

/**
 * Helper to extract error details from a GitHub API response
 */
async function getErrorDetails(
  response: Response,
  context: string,
): Promise<string> {
  let details = `${context}: HTTP ${response.status} ${response.statusText}`;
  try {
    const body = await response.json();
    if (body.message) {
      details += ` - ${body.message}`;
    }
    if (body.errors) {
      details += ` (${JSON.stringify(body.errors)})`;
    }
    if (body.documentation_url) {
      details += ` | Docs: ${body.documentation_url}`;
    }
  } catch {
    // If we can't parse the response body, just use the status
    try {
      const text = await response.text();
      if (text) details += ` - ${text.substring(0, 200)}`;
    } catch {
      // ignore
    }
  }
  return details;
}

/**
 * Read a file's content from GitHub repository
 */
export async function readFromGitHub(filePath: string): Promise<string> {
  const { token, owner, repo } = getConfig();

  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errMsg = await getErrorDetails(
      response,
      `Failed to read ${filePath} from GitHub`,
    );
    throw new Error(errMsg);
  }

  const data = await response.json();
  return Buffer.from(data.content, "base64").toString("utf-8");
}

/**
 * Commit multiple files to GitHub using the Contents API (single file at a time).
 * This is simpler and more reliable than the Git Trees API.
 * Falls back to the Contents API which handles encoding automatically.
 */
export async function commitToGitHub(
  files: Array<{ path: string; content: string }>,
  message: string,
): Promise<void> {
  const { token, owner, repo } = getConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;

  // Try the Git Trees API first (atomic commit), fall back to Contents API
  try {
    await commitViaTreesAPI(files, message, headers, baseUrl);
  } catch (treesError) {
    console.warn(
      "Git Trees API failed, falling back to Contents API:",
      treesError,
    );
    await commitViaContentsAPI(files, message, headers, baseUrl);
  }
}

/**
 * Commit via Git Trees API (atomic multi-file commit).
 * Uses base64 encoding for blob content to avoid encoding issues.
 */
async function commitViaTreesAPI(
  files: Array<{ path: string; content: string }>,
  message: string,
  headers: Record<string, string>,
  baseUrl: string,
): Promise<void> {
  // 1. Get latest commit SHA on main branch
  let refRes = await fetch(`${baseUrl}/git/ref/heads/main`, { headers });
  if (!refRes.ok) {
    // Try 'master' branch as fallback
    refRes = await fetch(`${baseUrl}/git/ref/heads/master`, { headers });
    if (!refRes.ok) {
      const errMsg = await getErrorDetails(
        refRes,
        "Failed to get branch reference (tried main and master)",
      );
      throw new Error(errMsg);
    }
  }
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;
  const refPath = refData.ref; // e.g., "refs/heads/main"

  // 2. Get the tree SHA of the latest commit
  const commitRes = await fetch(`${baseUrl}/git/commits/${latestCommitSha}`, {
    headers,
  });
  if (!commitRes.ok) {
    const errMsg = await getErrorDetails(
      commitRes,
      "Failed to get commit data",
    );
    throw new Error(errMsg);
  }
  const commitData = await commitRes.json();

  // 3. Create blobs for each file using base64 encoding (more reliable)
  const treeEntries = [];
  for (const file of files) {
    const base64Content = Buffer.from(file.content, "utf-8").toString("base64");
    const blobRes = await fetch(`${baseUrl}/git/blobs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: base64Content, encoding: "base64" }),
    });
    if (!blobRes.ok) {
      const errMsg = await getErrorDetails(
        blobRes,
        `Failed to create blob for ${file.path}`,
      );
      throw new Error(errMsg);
    }
    const blob = await blobRes.json();
    treeEntries.push({
      path: file.path,
      mode: "100644" as const,
      type: "blob" as const,
      sha: blob.sha,
    });
  }

  // 4. Create a new tree
  const treeRes = await fetch(`${baseUrl}/git/trees`, {
    method: "POST",
    headers,
    body: JSON.stringify({ base_tree: commitData.tree.sha, tree: treeEntries }),
  });
  if (!treeRes.ok) {
    const errMsg = await getErrorDetails(treeRes, "Failed to create tree");
    throw new Error(errMsg);
  }
  const treeData = await treeRes.json();

  // 5. Create a new commit
  const newCommitRes = await fetch(`${baseUrl}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    }),
  });
  if (!newCommitRes.ok) {
    const errMsg = await getErrorDetails(
      newCommitRes,
      "Failed to create commit",
    );
    throw new Error(errMsg);
  }
  const newCommitData = await newCommitRes.json();

  // 6. Update the branch reference to point to new commit
  const updateRefRes = await fetch(`${baseUrl}/git/${refPath}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommitData.sha }),
  });
  if (!updateRefRes.ok) {
    const errMsg = await getErrorDetails(
      updateRefRes,
      "Failed to update branch reference",
    );
    throw new Error(errMsg);
  }
}

/**
 * Fallback: Commit via Contents API (one file at a time).
 * More reliable but not atomic - each file is a separate commit.
 */
async function commitViaContentsAPI(
  files: Array<{ path: string; content: string }>,
  message: string,
  headers: Record<string, string>,
  baseUrl: string,
): Promise<void> {
  for (const file of files) {
    // Get the current file SHA (needed for updates)
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(`${baseUrl}/contents/${file.path}`, {
        headers,
      });
      if (getRes.ok) {
        const existing = await getRes.json();
        existingSha = existing.sha;
      }
    } catch {
      // File doesn't exist yet, that's fine for creation
    }

    const base64Content = Buffer.from(file.content, "utf-8").toString("base64");

    const body: Record<string, string> = {
      message: `${message} [${file.path}]`,
      content: base64Content,
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    const putRes = await fetch(`${baseUrl}/contents/${file.path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errMsg = await getErrorDetails(
        putRes,
        `Failed to update ${file.path}`,
      );
      throw new Error(errMsg);
    }
  }
}

/**
 * Test GitHub API connectivity and token permissions
 */
export async function testGitHubConnection(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}> {
  try {
    const { token, owner, repo } = getConfig();

    // Test 1: Check if token is valid
    const userRes = await fetch(`${GITHUB_API}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!userRes.ok) {
      return {
        success: false,
        message: `GitHub token is invalid or expired (HTTP ${userRes.status})`,
      };
    }
    const userData = await userRes.json();

    // Test 2: Check repo access
    const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    if (!repoRes.ok) {
      return {
        success: false,
        message: `Cannot access repo ${owner}/${repo} (HTTP ${repoRes.status}). Check GITHUB_OWNER and GITHUB_REPO env vars.`,
      };
    }
    const repoData = await repoRes.json();

    // Test 3: Check push permissions
    const permissions = repoData.permissions || {};
    if (!permissions.push) {
      return {
        success: false,
        message: `Token does not have push permission to ${owner}/${repo}. Update token scopes to include 'repo' or 'contents:write'.`,
      };
    }

    return {
      success: true,
      message: `Connected as ${userData.login} to ${owner}/${repo} (push access confirmed)`,
      details: {
        user: userData.login,
        repo: `${owner}/${repo}`,
        defaultBranch: repoData.default_branch,
        permissions,
      },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error testing GitHub connection",
    };
  }
}

/**
 * Upload a binary file (image, PDF, etc.) to GitHub repository.
 * Uses base64 encoding via the Contents API.
 */
export async function uploadBinaryToGitHub(
  filePath: string,
  base64Content: string,
  message: string,
): Promise<void> {
  const { token, owner, repo } = getConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;

  // Check if file already exists (need SHA for update)
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(`${baseUrl}/contents/${filePath}`, { headers });
    if (getRes.ok) {
      const existing = await getRes.json();
      existingSha = existing.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  const body: Record<string, string> = {
    message,
    content: base64Content,
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const putRes = await fetch(`${baseUrl}/contents/${filePath}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const errMsg = await getErrorDetails(
      putRes,
      `Failed to upload ${filePath}`,
    );
    throw new Error(errMsg);
  }
}

/**
 * Delete a file from GitHub repository.
 */
export async function deleteFromGitHub(
  filePath: string,
  message: string,
): Promise<void> {
  const { token, owner, repo } = getConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;

  // Get the file SHA (required for deletion)
  const getRes = await fetch(`${baseUrl}/contents/${filePath}`, { headers });
  if (!getRes.ok) {
    if (getRes.status === 404) {
      // File doesn't exist, nothing to delete
      return;
    }
    const errMsg = await getErrorDetails(
      getRes,
      `Failed to find ${filePath} for deletion`,
    );
    throw new Error(errMsg);
  }
  const fileData = await getRes.json();

  const delRes = await fetch(`${baseUrl}/contents/${filePath}`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({
      message,
      sha: fileData.sha,
    }),
  });

  if (!delRes.ok) {
    const errMsg = await getErrorDetails(
      delRes,
      `Failed to delete ${filePath}`,
    );
    throw new Error(errMsg);
  }
}

/**
 * List files in a GitHub repository directory.
 */
export async function listGitHubFiles(
  dirPath: string,
): Promise<Array<{ name: string; path: string; size: number; type: string }>> {
  const { token, owner, repo } = getConfig();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github.v3+json",
  };

  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${dirPath}`,
    { headers, cache: "no-store" },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return []; // Directory doesn't exist
    }
    const errMsg = await getErrorDetails(
      response,
      `Failed to list files in ${dirPath}`,
    );
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return []; // Not a directory
  }

  return data
    .filter((item: any) => item.type === "file")
    .map((item: any) => ({
      name: item.name,
      path: item.path,
      size: item.size,
      type: item.type,
    }));
}
