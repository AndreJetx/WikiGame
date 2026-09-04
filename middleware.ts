/// <reference lib="dom" />
/// <reference lib="es2022" />

export const config = {
  matcher: ["/((?!api/|assets/|fonts/).*)"],
};

const VARY_ACCEPT = "Accept, Accept-Encoding";
const HTML_CONTENT_TYPE = "text/html; charset=utf-8";

const SPA_PATHS = new Set([
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
]);

function continueRequest(headers: Headers): Response {
  headers.set("x-middleware-next", "1");
  return new Response(null, { headers });
}

function rewriteRequest(destination: URL, headers: Headers): Response {
  headers.set("x-middleware-rewrite", destination.toString());
  return new Response(null, { headers });
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (trimmed.length > 1 && trimmed.endsWith("/")) return trimmed.slice(0, -1);
  return trimmed || "/";
}

function isKnownPath(pathname: string): boolean {
  if (SPA_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/wiki/")) return true;
  if (STATIC_FILES.has(pathname)) return true;
  if (pathname.startsWith("/.well-known/")) return true;
  if (pathname.startsWith("/assets/") || pathname.startsWith("/fonts/")) return true;
  return false;
}

function negotiateAccept(header: string | null): "markdown" | "html" | "not_acceptable" {
  const raw = header?.trim();
  if (!raw) return "html";

  const offers: { type: string; subtype: string; q: number; specificity: number; index: number }[] = [];
  const parts = raw.split(",");
  for (let i = 0; i < parts.length; i++) {
    const token = parts[i]?.trim();
    if (!token) continue;
    const [media, ...params] = token.split(";").map((item) => item.trim());
    const [type, subtype] = (media ?? "*/*").toLowerCase().split("/");
    if (!type || !subtype) continue;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=").map((item) => item.trim());
      if (key === "q" && value) {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    if (q <= 0) continue;
    offers.push({
      type,
      subtype,
      q,
      specificity: (type === "*" ? 0 : 2) + (subtype === "*" ? 0 : 1),
      index: i,
    });
  }
  offers.sort((a, b) => b.q - a.q || b.specificity - a.specificity || a.index - b.index);

  const matches = (
    offer: { type: string; subtype: string },
    type: string,
    subtype: string,
  ) =>
    (offer.type === "*" && offer.subtype === "*") ||
    (offer.type === type && offer.subtype === "*") ||
    (offer.type === type && offer.subtype === subtype);

  for (const offer of offers) {
    if (matches(offer, "text", "markdown")) return "markdown";
    if (matches(offer, "text", "html")) return "html";
    if (matches(offer, "application", "xhtml+xml")) return "html";
  }
  return "not_acceptable";
}

function notFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Not found — Legend of Elements Wiki</title>
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <h1>Not found</h1>
    <p>This path does not exist on Legend of Elements Wiki.</p>
    <ul>
      <li><a href="/sitemap.xml">Sitemap</a></li>
      <li><a href="/llms.txt">llms.txt</a></li>
      <li><a href="/docs">API docs</a></li>
    </ul>
  </body>
</html>`;
}

function handle(request: Request): Response {
  const pathname = normalizePathname(new URL(request.url).pathname);
  const lastSegment = pathname.split("/").pop() ?? "";
  const looksLikeFile = lastSegment.includes(".");
  const negotiation = negotiateAccept(request.headers.get("accept"));
  const vary = new Headers({ Vary: VARY_ACCEPT });

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return continueRequest(vary);
  }

  if (negotiation === "not_acceptable") {
    vary.set("Content-Type", "text/plain; charset=utf-8");
    return new Response("Not Acceptable", { status: 406, headers: vary });
  }

  if (negotiation === "markdown") {
    const destination = new URL(request.url);
    destination.pathname = pathname === "/" ? "/api/markdown" : `/api/markdown${pathname}`;
    return rewriteRequest(destination, vary);
  }

  if (!looksLikeFile && !isKnownPath(pathname)) {
    vary.set("Content-Type", HTML_CONTENT_TYPE);
    return new Response(notFoundHtml(), { status: 404, headers: vary });
  }

  return continueRequest(vary);
}

export default function middleware(request: Request): Response {
  try {
    return handle(request);
  } catch {
    const headers = new Headers();
    headers.set("x-middleware-next", "1");
    return new Response(null, { headers });
  }
}
