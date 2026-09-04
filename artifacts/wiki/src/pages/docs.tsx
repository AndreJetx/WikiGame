import { StaticPage } from "@/components/static-page";
import { GITHUB_URL, SITE_ORIGIN } from "@/lib/tools";

const examples = `curl ${SITE_ORIGIN}/api/healthz
curl "${SITE_ORIGIN}/api/search?q=cultivation"
curl ${SITE_ORIGIN}/api/articles/featured
curl ${SITE_ORIGIN}/openapi.json`;

export function Docs() {
  return (
    <StaticPage title="Legend of Elements Wiki API">
      <p>
        The Legend of Elements Wiki API is a public REST interface for encyclopedia data. Agents and
        apps should use it (or the MCP tools) instead of scraping the website. Base path:{" "}
        <a href="/api/healthz" className="text-primary underline">
          /api
        </a>
        . OpenAPI 3.1:{" "}
        <a href="/openapi.json" className="text-primary underline">
          /openapi.json
        </a>{" "}
        and{" "}
        <a href="/api/openapi.yaml" className="text-primary underline">
          /api/openapi.yaml
        </a>
        .
      </p>
      <h2 className="text-xl font-serif font-semibold text-primary pt-2">Authentication</h2>
      <p>
        Read endpoints are unauthenticated: health, articles, featured and recent lists,
        article-by-slug, categories, search, stats, and tools. Create, update, and delete require a
        signed admin cookie (<code>wiki_admin_session</code>) obtained via{" "}
        <code>POST /api/admin/login</code>. If you are an agent integrating player-facing features,
        you only need the public GET methods.
      </p>
      <h2 className="text-xl font-serif font-semibold text-primary pt-2">Example requests</h2>
      <pre className="overflow-x-auto rounded-lg border border-border bg-card/50 p-4 text-sm">
        {examples}
      </pre>
      <p>
        Errors are JSON objects with <code>error.code</code>, <code>error.message</code>, and{" "}
        <code>error.hint</code>. MCP Streamable HTTP lives at{" "}
        <a href="/mcp" className="text-primary underline">
          /mcp
        </a>{" "}
        with discovery at{" "}
        <a href="/.well-known/mcp" className="text-primary underline">
          /.well-known/mcp
        </a>
        . Agent index:{" "}
        <a href="/llms.txt" className="text-primary underline">
          /llms.txt
        </a>
        . Source:{" "}
        <a href={GITHUB_URL} className="text-primary underline" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
    </StaticPage>
  );
}
