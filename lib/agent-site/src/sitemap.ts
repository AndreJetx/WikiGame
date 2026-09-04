import { SITE_ORIGIN } from "./constants.js";
import { SITEMAP_STATIC_PATHS } from "./routes.js";

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

export function absoluteUrl(pathname: string): string {
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) return pathname;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${path}`;
}

export function staticSitemapUrls(lastmod?: string): SitemapUrl[] {
  return SITEMAP_STATIC_PATHS.map((path) => ({
    loc: absoluteUrl(path),
    lastmod,
  }));
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((url) => {
      const lastmod = url.lastmod
        ? `\n    <lastmod>${xmlEscape(url.lastmod.slice(0, 10))}</lastmod>`
        : "";
      return `  <url>\n    <loc>${xmlEscape(url.loc)}</loc>${lastmod}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}
