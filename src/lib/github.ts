/**
 * GitHub API helper for committing file changes from Vercel (read-only filesystem).
 * When GITHUB_TOKEN is set, saves go to GitHub → triggers Vercel auto-redeploy.
 * When not set, falls back to local filesystem writes (for local dev).
 */

const GITHUB_API = 'https://api.github.com';

export function isGitHubConfigured(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

function getConfig() {
  return {
    token: process.env.GITHUB_TOKEN!,
    owner: process.env.GITHUB_OWNER || 'Hirak46',
    repo: process.env.GITHUB_REPO || 'Portfolio',
  };
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
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to read ${filePath} from GitHub: ${response.status}`);
  }

  const data = await response.json();
  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * Commit multiple files to GitHub in a single commit.
 * Uses the Git Trees API for atomic multi-file commits.
 */
export async function commitToGitHub(
  files: Array<{ path: string; content: string }>,
  message: string
): Promise<void> {
  const { token, owner, repo } = getConfig();
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };
  const baseUrl = `${GITHUB_API}/repos/${owner}/${repo}`;

  // 1. Get latest commit SHA on main branch
  const refRes = await fetch(`${baseUrl}/git/ref/heads/main`, { headers });
  if (!refRes.ok) throw new Error('Failed to get branch reference');
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // 2. Get the tree SHA of the latest commit
  const commitRes = await fetch(`${baseUrl}/git/commits/${latestCommitSha}`, { headers });
  if (!commitRes.ok) throw new Error('Failed to get commit data');
  const commitData = await commitRes.json();

  // 3. Create blobs for each file and build tree entries
  const treeEntries = await Promise.all(
    files.map(async (file) => {
      const blobRes = await fetch(`${baseUrl}/git/blobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: file.content, encoding: 'utf-8' }),
      });
      if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}`);
      const blob = await blobRes.json();
      return {
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      };
    })
  );

  // 4. Create a new tree
  const treeRes = await fetch(`${baseUrl}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ base_tree: commitData.tree.sha, tree: treeEntries }),
  });
  if (!treeRes.ok) throw new Error('Failed to create tree');
  const treeData = await treeRes.json();

  // 5. Create a new commit
  const newCommitRes = await fetch(`${baseUrl}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    }),
  });
  if (!newCommitRes.ok) throw new Error('Failed to create commit');
  const newCommitData = await newCommitRes.json();

  // 6. Update the main branch reference to point to new commit
  const updateRefRes = await fetch(`${baseUrl}/git/refs/heads/main`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ sha: newCommitData.sha }),
  });
  if (!updateRefRes.ok) throw new Error('Failed to update branch reference');
}
