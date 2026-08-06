import "server-only";

import type { Repo } from "@/types";

const USERNAME = "hemantwasthere";
const MAX = 6;

// Refresh at most once an hour. Keeps us well inside GitHub's unauthenticated
// rate limit (60 req/hr per IP) no matter how much traffic the site gets.
const REVALIDATE = 3600;

/**
 * Linguist colours for the languages used across the pinned repos, inlined on
 * purpose: the previous implementation depended on a third-party service
 * (gh-pinned-repos on Deno Deploy Classic) that was sunset and took the whole
 * section down with it. A hardcoded map cannot 404.
 */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Swift: "#F05138",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Shell: "#89e051",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Solidity: "#AA6746",
  Cairo: "#ff4a00",
  MDX: "#fcb32c",
};

const FALLBACK_COLOR = "#8b949e";

/** The component hides the star/fork chip when the string is empty. */
const asCount = (n: number) => (n > 0 ? String(n) : "");

const colorFor = (language: string | null) =>
  LANGUAGE_COLORS[language ?? ""] ?? FALLBACK_COLOR;

type RestRepo = {
  name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  owner: { login: string };
};

const toRepo = (r: RestRepo): Repo => ({
  owner: r.owner.login,
  repo: r.name,
  link: r.html_url,
  description: r.description ?? "",
  website: r.homepage ?? "",
  language: r.language ?? "",
  languageColor: colorFor(r.language),
  stars: asCount(r.stargazers_count),
  forks: asCount(r.forks_count),
});

/**
 * Pinned repositories, read off the public profile page.
 *
 * GitHub only exposes pins through the GraphQL API, which always requires a
 * token — so with no credentials the rendered profile is the only source. We
 * scrape nothing but the `owner/repo` slugs (pins are frequently repos owned by
 * *other* people, which is why "my most-starred repos" is not a substitute) and
 * then hydrate each one through the REST API, keeping HTML parsing to the
 * smallest possible surface.
 */
async function fetchPinnedSlugs(): Promise<string[]> {
  const res = await fetch(`https://github.com/${USERNAME}`, {
    headers: {
      // GitHub serves a trimmed page to unrecognised clients.
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Accept: "text/html",
    },
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`GitHub profile responded ${res.status}`);

  const html = await res.text();

  // Bound the search to the pinned <ol> itself. A fixed-size window would run
  // past the closing tag into "Popular repositories", where an unpinned repo
  // would be picked up as if it were a pin.
  const start = html.indexOf("js-pinned-items-reorder-list");
  if (start === -1) throw new Error("no pinned-items list on profile");

  const end = html.indexOf("</ol>", start);
  const region = html.slice(start, end === -1 ? undefined : end);

  const slugs: string[] = [];
  const anchor = /href="\/([\w.-]+\/[\w.-]+)"[^>]*class="[^"]*\bwb-break-word\b/g;

  let match: RegExpExecArray | null;
  while ((match = anchor.exec(region)) !== null) {
    const slug = match[1];
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }

  if (!slugs.length) throw new Error("pinned list matched no repositories");

  return slugs.slice(0, MAX);
}

/** GITHUB_TOKEN is optional; when present it lifts the rate limit to 5000/hr. */
function githubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Never throws: one unreachable repository shouldn't discard the pins that did
 * resolve, so failures come back as null and get filtered out by the caller.
 */
async function fetchRepo(slug: string): Promise<Repo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${slug}`, {
      headers: githubHeaders(),
      next: { revalidate: REVALIDATE },
    });

    if (!res.ok) return null;
    return toRepo(await res.json());
  } catch {
    return null;
  }
}

async function fetchPinned(): Promise<Repo[]> {
  const slugs = await fetchPinnedSlugs();
  const settled = await Promise.all(slugs.map(fetchRepo));
  const repos = settled.filter((r): r is Repo => r !== null);

  if (!repos.length) throw new Error("could not hydrate any pinned repository");

  return repos;
}

/**
 * Last-ditch fallback if the profile page is unreachable or its markup shifts:
 * the most-starred original repositories. Note this only ever covers repos the
 * user owns, so it is an approximation, not an equivalent.
 */
async function fetchTopRepos(): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`,
    { headers: githubHeaders(), next: { revalidate: REVALIDATE } }
  );

  if (!res.ok) throw new Error(`GitHub REST responded ${res.status}`);

  const all: RestRepo[] = await res.json();

  return all
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX)
    .map(toRepo);
}

/**
 * Pinned repositories for the code:work section.
 *
 * Resolves to an empty array rather than throwing, so a GitHub outage degrades
 * the section instead of taking down the page that renders it.
 */
export async function getPinnedRepos(): Promise<Repo[]> {
  try {
    return await fetchPinned();
  } catch (error) {
    console.error("[github] pinned lookup failed, falling back:", error);
  }

  try {
    return await fetchTopRepos();
  } catch (error) {
    console.error("[github] failed to load repositories:", error);
    return [];
  }
}
