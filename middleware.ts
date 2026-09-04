/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="es2022" />

import { next, rewrite } from "@vercel/functions";
import {
  HTML_CONTENT_TYPE,
  VARY_ACCEPT,
  isApiPath,
  isKnownSpaPath,
  isStaticAssetPath,
  negotiateAccept,
  normalizePathname,
  notFoundHtml,
} from "@workspace/agent-site";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api/|assets/|fonts/).*)"],
};

export default function middleware(request: Request) {
  const pathname = normalizePathname(new URL(request.url).pathname);
  const lastSegment = pathname.split("/").pop() ?? "";
  const looksLikeFile = lastSegment.includes(".");
  const negotiation = negotiateAccept(request.headers.get("accept"));
  const varyHeaders = { Vary: VARY_ACCEPT };

  if (isApiPath(pathname)) {
    return next({ headers: varyHeaders });
  }

  if (negotiation === "not_acceptable") {
    return new Response("Not Acceptable", {
      status: 406,
      headers: { ...varyHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (negotiation === "markdown") {
    const destination = new URL(request.url);
    destination.pathname = pathname === "/" ? "/api/markdown" : `/api/markdown${pathname}`;
    return rewrite(destination);
  }

  if (!looksLikeFile && !isStaticAssetPath(pathname) && !isKnownSpaPath(pathname)) {
    return new Response(notFoundHtml(), {
      status: 404,
      headers: { ...varyHeaders, "Content-Type": HTML_CONTENT_TYPE },
    });
  }

  return next({ headers: varyHeaders });
}
