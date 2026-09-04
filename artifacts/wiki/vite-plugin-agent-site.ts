import type { Connect, Plugin, PreviewServer, ViteDevServer } from "vite";

const DEDICATED_HTML: Record<string, string> = {
  "/about": "/about.html",
  "/contact": "/contact.html",
  "/privacy": "/privacy.html",
  "/docs": "/docs.html",
};

const EXACT_SPA = new Set([
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

function normalizePathname(pathname: string): string {
  const trimmed = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (trimmed.length > 1 && trimmed.endsWith("/")) return trimmed.slice(0, -1);
  return trimmed || "/";
}

function isKnownSpaPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return EXACT_SPA.has(path) || path === "/wiki" || path.startsWith("/wiki/");
}

function isPassthrough(pathname: string): boolean {
  const path = normalizePathname(pathname);
  const lastSegment = path.split("/").pop() ?? "";
  if (lastSegment.includes(".")) return true;
  return (
    path === "/api" ||
    path.startsWith("/api/") ||
    path.startsWith("/assets/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/@") ||
    path.startsWith("/src/") ||
    path.startsWith("/node_modules/")
  );
}

function applyAgentMiddleware(middlewares: Connect.Server) {
  middlewares.use((req, res, next) => {
    const pathname = normalizePathname(req.url ?? "/");
    if (isPassthrough(pathname)) {
      next();
      return;
    }

    const dedicated = DEDICATED_HTML[pathname];
    if (dedicated) {
      req.url = dedicated;
      next();
      return;
    }

    if (isKnownSpaPath(pathname)) {
      req.url = "/index.html";
      next();
      return;
    }

    res.statusCode = 404;
    req.url = "/404.html";
    next();
  });
}

export function agentSitePlugin(): Plugin {
  return {
    name: "legend-of-elements-agent-site",
    configureServer(server: ViteDevServer) {
      applyAgentMiddleware(server.middlewares);
    },
    configurePreviewServer(server: PreviewServer) {
      applyAgentMiddleware(server.middlewares);
    },
  };
}
