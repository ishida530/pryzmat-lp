// GitHub REST API — publikacja artykułów jako PR (SEO-agent) + zatwierdzanie/odrzucanie przez
// bota Telegram. Ported z code94's lib/github.ts (ten sam właściciel, sprawdzony wzorzec) i
// rozszerzony o createBranch/createOrUpdateFile/createPullRequest — code94 nie potrzebował tych
// trzech, bo tam PR-y powstają ręcznie (git/gh CLI); tu SEO-agent działa bez interakcji człowieka
// w GitHub Actions, więc całość (branch → plik → PR) musi przejść przez samo REST API.
const API_BASE = "https://api.github.com";

function owner(): string {
  const v = process.env.GITHUB_REPO_OWNER;
  if (!v) throw new Error("Brak zmiennej środowiskowej GITHUB_REPO_OWNER");
  return v;
}

function repo(): string {
  const v = process.env.GITHUB_REPO_NAME;
  if (!v) throw new Error("Brak zmiennej środowiskowej GITHUB_REPO_NAME");
  return v;
}

function token(): string {
  const v = process.env.GITHUB_TOKEN;
  if (!v) throw new Error("Brak zmiennej środowiskowej GITHUB_TOKEN");
  return v;
}

export class GitHubApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

async function githubFetch(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new GitHubApiError(res.status, body?.message ?? `GitHub API error ${res.status}`);
  }

  return body;
}

export type PullRequest = {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  merged: boolean;
  head: { ref: string; sha: string };
  base: { ref: string };
};

export async function getPullRequest(prNumber: number): Promise<PullRequest> {
  return githubFetch(`/repos/${owner()}/${repo()}/pulls/${prNumber}`);
}

export async function listPullRequestFiles(prNumber: number): Promise<{ filename: string }[]> {
  return githubFetch(`/repos/${owner()}/${repo()}/pulls/${prNumber}/files?per_page=100`);
}

export async function getFileContent(filePath: string, ref: string): Promise<string> {
  const data = await githubFetch(`/repos/${owner()}/${repo()}/contents/${filePath}?ref=${encodeURIComponent(ref)}`);
  return Buffer.from(data.content, "base64").toString("utf8");
}

export async function mergePullRequest(prNumber: number): Promise<void> {
  await githubFetch(`/repos/${owner()}/${repo()}/pulls/${prNumber}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "squash" }),
  });
}

export async function closePullRequest(prNumber: number): Promise<void> {
  await githubFetch(`/repos/${owner()}/${repo()}/pulls/${prNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
}

export async function deleteBranch(ref: string): Promise<void> {
  try {
    await githubFetch(`/repos/${owner()}/${repo()}/git/refs/heads/${ref}`, { method: "DELETE" });
  } catch {
    // best-effort — branch może już nie istnieć (np. auto-delete po merge)
  }
}

export async function findPreviewUrl(sha: string): Promise<string | null> {
  try {
    const deployments = await githubFetch(`/repos/${owner()}/${repo()}/deployments?sha=${sha}&per_page=5`);
    for (const deployment of deployments) {
      const statuses = await githubFetch(`/repos/${owner()}/${repo()}/deployments/${deployment.id}/statuses?per_page=1`);
      const url = statuses[0]?.environment_url || statuses[0]?.target_url;
      if (url) return url;
    }
  } catch {
    // spróbuj kolejnej metody
  }

  try {
    const status = await githubFetch(`/repos/${owner()}/${repo()}/commits/${sha}/status`);
    const vercelStatus = status.statuses?.find((s: any) => /vercel/i.test(s.context));
    if (vercelStatus?.target_url) return vercelStatus.target_url;
  } catch {
    // spróbuj kolejnej metody
  }

  try {
    const checkRuns = await githubFetch(`/repos/${owner()}/${repo()}/commits/${sha}/check-runs`);
    const vercelCheck = checkRuns.check_runs?.find((c: any) => /vercel/i.test(c.name) || /vercel/i.test(c.app?.slug ?? ""));
    if (vercelCheck?.details_url) return vercelCheck.details_url;
  } catch {
    // brak podglądu — pomijamy
  }

  return null;
}

// --- Poniżej: potrzebne wyłącznie przez scripts/seo-agent (tworzenie PR bez człowieka) ---

export async function getBranchSha(branch: string): Promise<string> {
  const data = await githubFetch(`/repos/${owner()}/${repo()}/git/ref/heads/${branch}`);
  return data.object.sha as string;
}

export async function createBranch(newBranch: string, fromSha: string): Promise<void> {
  await githubFetch(`/repos/${owner()}/${repo()}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: fromSha }),
  });
}

export async function createFile(filePath: string, branch: string, content: string, message: string): Promise<void> {
  await githubFetch(`/repos/${owner()}/${repo()}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
    }),
  });
}

export async function createPullRequest(params: {
  title: string;
  head: string;
  base: string;
  body: string;
}): Promise<PullRequest> {
  return githubFetch(`/repos/${owner()}/${repo()}/pulls`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}
