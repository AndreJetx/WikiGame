const DEDICATED_HTML_PAGES = new Set(["/about", "/contact", "/privacy", "/docs"]);

const EXACT_SPA_PATHS = new Set([
  "/",
  "/search",
  "/iniciar-jornada",
  "/ferramentas",
  "/gerenciamentoartigos",
  "/admin",
  "/wiki",
  "/about",
  "/contact",
  "/privacy",
  "/docs",
]);

const STATIC_FILE_PREFIXES = [
  "/assets/",
  "/fonts/",
  "/src/",
  "/node_modules/",
  "/@",
];

const STATIC_FILES = new Set([
  "/favicon.png",
  "/favicon.svg",
  "/robots.txt",
  "/llms.txt",
  "/opengraph.jpg",
  "/openapi.json",
  "/openapi.yaml",
  "/sitemap.xml",
  "/mcp",
  "/.well-known/mcp",
]);

export function normalizePathname(pathname: string): string {
  if (!pathname) return "/";
  const trimmed = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }
  return trimmed || "/";
}

export function isWikiPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/wiki" || path.startsWith("/wiki/");
}

export function isKnownSpaPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (EXACT_SPA_PATHS.has(path)) return true;
  return isWikiPath(path);
}

export function isDedicatedHtmlPath(pathname: string): boolean {
  return DEDICATED_HTML_PAGES.has(normalizePathname(pathname));
}

export function dedicatedHtmlFile(pathname: string): string | null {
  const path = normalizePathname(pathname);
  if (!DEDICATED_HTML_PAGES.has(path)) return null;
  return `${path.slice(1)}.html`;
}

export function isStaticAssetPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (STATIC_FILES.has(path)) return true;
  if (path.startsWith("/.well-known/")) return true;
  return STATIC_FILE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function isApiPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/api" || path.startsWith("/api/");
}

export function parseWikiArticlePath(
  pathname: string,
): { category: string; slug: string } | null {
  const path = normalizePathname(pathname);
  const match = path.match(/^\/wiki\/([^/]+)\/([^/]+)$/);
  if (!match?.[1] || !match[2]) return null;
  return { category: decodeURIComponent(match[1]), slug: decodeURIComponent(match[2]) };
}

export const SITEMAP_STATIC_PATHS = [
  "/",
  "/search",
  "/iniciar-jornada",
  "/ferramentas",
  "/about",
  "/contact",
  "/privacy",
  "/docs",
] as const;
