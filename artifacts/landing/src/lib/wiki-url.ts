const wikiBase = (import.meta.env.VITE_WIKI_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:22172";

export function wikiUrl(path = "/"): string {
  if (!path || path === "/") return wikiBase;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${wikiBase}${normalized}`;
}
