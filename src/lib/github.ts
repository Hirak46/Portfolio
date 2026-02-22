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
 * Build standard headers for GitHub API.
 * Detects token type and uses the correct Authorization prefix:
 * - Classic PATs (ghp_*): uses 'token' prefix
 * - Fine-grained PATs (github_pat_*): uses 'Bearer' prefix
 * - Unknown format: tries 'Bearer' first (works for both modern token types)
 */
function getHeaders(token: string): Record<string, string> {
  // Fine-grained PATs start with 'github_pat_', classic PATs with 'ghp_'
  // 'Bearer' works for fine-grained PATs and GitHub Apps
  // 'token' works for classic PATs
  const prefix = token.startsWith("ghp_") ? "token" : "Bearer";
  return {
    Authorization: `${prefix} ${token}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
  };
}

/**
 * URL-encode a file path for use in GitHub API URLs.
 * Encodes each path segment individually to preserve slashes.
 */
function encodeFilePath(filePath: string): string {
  return filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/**
 * Sanitize a filename by removing problematic characters.
 */
export function sanitizeFileName(filename: string): string {
  // Replace spaces, parentheses, and other problematic chars
  return filename
    .replace(/[()]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");
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
  const encodedPath = encodeFilePath(filePath);

  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}`,
    {
      headers: getHeaders(token),
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
 * Commit multiple files to GitHub in a single atomic commit.
 * Uses the Git Trees API (creates blobs → tree → commit → updates ref).
 * Falls back to Contents API if Trees API fails.
 */
export async function commitToGitHub(
  files: Array<{ path: string; content: string }>,
  message: string,
): Promise<void> {
  const { token, owner, repo } = getConfig();
  const headers = getHeaders(token);
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;

  // First, verify the token can access the repo at all
  const verifyRes = await fetch(baseUrl, { headers, cache: "no-store" });
  if (!verifyRes.ok) {
    const status = verifyRes.status;
    if (status === 401 || status === 403) {
      throw new Error(
        `GitHub authentication failed (HTTP ${status}). Your GITHUB_TOKEN may be invalid, expired, or missing required scopes. ` +
          `Go to https://github.com/settings/tokens and create a new token with 'repo' scope (classic) or 'Contents: Read and write' permission (fine-grained).`,
      );
    }
    if (status === 404) {
      throw new Error(
        `GitHub repo '${owner}/${repo}' not found (HTTP 404). This can mean: ` +
          `1) The repo doesn't exist, 2) GITHUB_OWNER or GITHUB_REPO env vars are wrong, or ` +
          `3) Your GITHUB_TOKEN doesn't have access to this repo. ` +
          `Current config: owner='${owner}', repo='${repo}'. ` +
          `If using a fine-grained PAT, ensure the token has 'Repository access' set to this specific repo.`,
      );
    }
    throw new Error(`Cannot access GitHub repo: HTTP ${status}`);
  }

  // Check push permissions
  const repoInfo = await verifyRes.json();
  const permissions = repoInfo.permissions || {};
  if (!permissions.push && !permissions.admin) {
    throw new Error(
      `Your GITHUB_TOKEN does not have write/push permissions to '${owner}/${repo}'. ` +
        `Current permissions: ${JSON.stringify(permissions)}. ` +
        `For classic PATs: enable the 'repo' scope. ` +
        `For fine-grained PATs: grant 'Contents: Read and write' permission.`,
    );
  }

  // Try Trees API first (atomic), then Contents API (one at a time)
  let treesErrorMsg = "";
  try {
    await commitViaTreesAPI(files, message, headers, baseUrl);
    return;
  } catch (treesError) {
    treesErrorMsg =
      treesError instanceof Error ? treesError.message : String(treesError);
    console.warn("[github] Trees API failed:", treesErrorMsg);
  }

  try {
    await commitViaContentsAPI(files, message, headers, baseUrl);
    return;
  } catch (contentsError) {
    const contentsMsg =
      contentsError instanceof Error
        ? contentsError.message
        : String(contentsError);
    console.error("[github] Contents API also failed:", contentsMsg);
    throw new Error(
      `GitHub save failed via both methods. ` +
        `Trees API: ${treesErrorMsg}. ` +
        `Contents API: ${contentsMsg}`,
    );
  }
}

/**
 * Commit via Git Trees API (atomic multi-file commit).
 */
async function commitViaTreesAPI(
  files: Array<{ path: string; content: string }>,
  message: string,
  headers: Record<string, string>,
  baseUrl: string,
): Promise<void> {
  // 1. Get the default branch
  const repoRes = await fetch(baseUrl, { headers });
  if (!repoRes.ok) {
    throw new Error(`Cannot access repo: HTTP ${repoRes.status}`);
  }
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || "main";

  // 2. Get latest commit SHA
  const refRes = await fetch(`${baseUrl}/git/ref/heads/${defaultBranch}`, {
    headers,
  });
  if (!refRes.ok) {
    const errMsg = await getErrorDetails(
      refRes,
      `Failed to get ref for branch '${defaultBranch}'`,
    );
    throw new Error(errMsg);
  }
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // 3. Get the tree SHA of the latest commit
  const commitRes = await fetch(`${baseUrl}/git/commits/${latestCommitSha}`, {
    headers,
  });
  if (!commitRes.ok) {
    throw new Error(`Failed to get commit: HTTP ${commitRes.status}`);
  }
  const commitData = await commitRes.json();

  // 4. Create blobs for each file
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

  // 5. Create a new tree
  const treeRes = await fetch(`${baseUrl}/git/trees`, {
    method: "POST",
    headers,
    body: JSON.stringify({ base_tree: commitData.tree.sha, tree: treeEntries }),
  });
  if (!treeRes.ok) {
    throw new Error(`Failed to create tree: HTTP ${treeRes.status}`);
  }
  const treeData = await treeRes.json();

  // 6. Create a new commit
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
    throw new Error(`Failed to create commit: HTTP ${newCommitRes.status}`);
  }
  const newCommitData = await newCommitRes.json();

  // 7. Update the branch reference
  const updateRefRes = await fetch(
    `${baseUrl}/git/refs/heads/${defaultBranch}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ sha: newCommitData.sha }),
    },
  );
  if (!updateRefRes.ok) {
    throw new Error(`Failed to update ref: HTTP ${updateRefRes.status}`);
  }
}

/**
 * Fallback: Commit via Contents API (one file at a time).
 */
async function commitViaContentsAPI(
  files: Array<{ path: string; content: string }>,
  message: string,
  headers: Record<string, string>,
  baseUrl: string,
): Promise<void> {
  for (const file of files) {
    const encodedPath = encodeFilePath(file.path);
    // Get the current file SHA (needed for updates)
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(`${baseUrl}/contents/${encodedPath}`, {
        headers,
      });
      if (getRes.ok) {
        const existing = await getRes.json();
        existingSha = existing.sha;
      }
    } catch {
      // File doesn't exist yet
    }

    const base64Content = Buffer.from(file.content, "utf-8").toString("base64");

    const body: Record<string, string> = {
      message: `${message} [${file.path}]`,
      content: base64Content,
    };
    if (existingSha) {
      body.sha = existingSha;
    }

    const putRes = await fetch(`${baseUrl}/contents/${encodedPath}`, {
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
    const headers = getHeaders(token);

    // Detect token type for diagnostics
    const tokenType = token.startsWith("ghp_")
      ? "classic"
      : token.startsWith("github_pat_")
        ? "fine-grained"
        : "unknown";
    const authPrefix = token.startsWith("ghp_") ? "token" : "Bearer";

    // Test 1: Check if token is valid
    const userRes = await fetch(`${GITHUB_API}/user`, { headers });
    if (!userRes.ok) {
      // If using unknown token format, try the other auth prefix
      if (tokenType === "unknown") {
        const altPrefix = authPrefix === "Bearer" ? "token" : "Bearer";
        const altHeaders = {
          ...headers,
          Authorization: `${altPrefix} ${token}`,
        };
        const altRes = await fetch(`${GITHUB_API}/user`, {
          headers: altHeaders,
        });
        if (altRes.ok) {
          return {
            success: false,
            message: `Token works with '${altPrefix}' prefix but not '${authPrefix}'. Token format not auto-detected. Please use a standard GitHub PAT (starts with 'ghp_' or 'github_pat_').`,
          };
        }
      }
      return {
        success: false,
        message: `GitHub token is invalid or expired (HTTP ${userRes.status}). Token type detected: ${tokenType}. Auth prefix used: '${authPrefix}'. Go to https://github.com/settings/tokens to create a new token.`,
      };
    }
    const userData = await userRes.json();

    // Test 2: Check repo access
    const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers,
    });
    if (!repoRes.ok) {
      return {
        success: false,
        message: `Cannot access repo ${owner}/${repo} (HTTP ${repoRes.status}). Token type: ${tokenType}. Check GITHUB_OWNER and GITHUB_REPO env vars. If using a fine-grained PAT, ensure this repo is in the token's 'Repository access' list.`,
      };
    }
    const repoData = await repoRes.json();

    // Test 3: Check push permissions
    const permissions = repoData.permissions || {};
    if (!permissions.push) {
      return {
        success: false,
        message:
          `Token does not have push permission to ${owner}/${repo}. Token type: ${tokenType}. ` +
          (tokenType === "fine-grained"
            ? `For fine-grained PATs: grant 'Contents: Read and write' permission.`
            : `For classic PATs: enable the 'repo' scope.`),
      };
    }

    // Test 4: Try to read a file to verify contents access
    let canRead = false;
    try {
      const testRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`,
        { headers },
      );
      canRead = testRes.ok;
    } catch {
      canRead = false;
    }

    // Test 5: Try to access git refs to verify git API access
    let canAccessGit = false;
    try {
      const gitRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${repoData.default_branch}`,
        { headers },
      );
      canAccessGit = gitRes.ok;
    } catch {
      canAccessGit = false;
    }

    return {
      success: true,
      message: `Connected as ${userData.login} to ${owner}/${repo} (push: ✓, read: ${canRead ? "✓" : "✗"}, git: ${canAccessGit ? "✓" : "✗"}, token: ${tokenType})`,
      details: {
        user: userData.login,
        repo: `${owner}/${repo}`,
        defaultBranch: repoData.default_branch,
        permissions,
        canRead,
        canAccessGit,
        tokenType,
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
  const headers = getHeaders(token);
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;
  const encodedPath = encodeFilePath(filePath);

  // Check if file already exists (need SHA for update)
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(`${baseUrl}/contents/${encodedPath}`, {
      headers,
    });
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

  const putRes = await fetch(`${baseUrl}/contents/${encodedPath}`, {
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
  const headers = getHeaders(token);
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;
  const encodedPath = encodeFilePath(filePath);

  // Get the file SHA (required for deletion)
  const getRes = await fetch(`${baseUrl}/contents/${encodedPath}`, {
    headers,
  });
  if (!getRes.ok) {
    if (getRes.status === 404) {
      return; // File doesn't exist
    }
    const errMsg = await getErrorDetails(
      getRes,
      `Failed to find ${filePath} for deletion`,
    );
    throw new Error(errMsg);
  }
  const fileData = await getRes.json();

  const delRes = await fetch(`${baseUrl}/contents/${encodedPath}`, {
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
  const headers = getHeaders(token);
  const encodedPath = encodeFilePath(dirPath);

  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodedPath}`,
    { headers, cache: "no-store" },
  );

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    const errMsg = await getErrorDetails(
      response,
      `Failed to list files in ${dirPath}`,
    );
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
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
