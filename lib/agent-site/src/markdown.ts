import { GAME_URL, GITHUB_URL, SITE_NAME, SITE_ORIGIN } from "./constants.js";
import { normalizePathname, parseWikiArticlePath } from "./routes.js";

export function notFoundMarkdown(): string {
  return `# Not found

This path does not exist on ${SITE_NAME}.

- Sitemap: ${SITE_ORIGIN}/sitemap.xml
- Agent index: ${SITE_ORIGIN}/llms.txt
- API docs: ${SITE_ORIGIN}/docs
- OpenAPI: ${SITE_ORIGIN}/openapi.json
`;
}

export function notFoundHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Not found — ${SITE_NAME}</title>
    <meta name="robots" content="noindex" />
  </head>
  <body>
    <h1>Not found</h1>
    <p>This path does not exist on ${SITE_NAME}.</p>
    <ul>
      <li><a href="/sitemap.xml">Sitemap</a></li>
      <li><a href="/llms.txt">llms.txt</a></li>
      <li><a href="/docs">API docs</a></li>
    </ul>
  </body>
</html>
`;
}

export const HOME_MARKDOWN = `# ${SITE_NAME}

Legend of Elements Wiki is a community encyclopedia for the browser game Legend of Elements. Use it to look up cultivation realms, classes and elemental paths, equipment and refinement, spirits, pets, dungeons and bosses, PvP and guilds, event calendars, beginner guides, and patch notes. The project is fan-made by AndrJetx, unofficial, and not affiliated with the game publisher or JoyNet. Explore. Descubra. Evolua.

When to use this wiki: reach for it when a player asks how a mechanic works, which class or spirit to pick, where a boss drops, or what changed in an update. Agents should search articles, follow category pages, or call the public REST API and MCP tools instead of scraping the JavaScript UI. Do not treat these pages as official publisher documentation.

## Browse

- [Search](${SITE_ORIGIN}/search): find articles by title or body text
- [Tools](${SITE_ORIGIN}/ferramentas): adjacent calculators and community sites
- [Play Legend of Elements](${GAME_URL}): official game client
- [API documentation](${SITE_ORIGIN}/docs): public endpoints, auth, and examples
- [OpenAPI](${SITE_ORIGIN}/openapi.json): machine-readable API contract
- [llms.txt](${SITE_ORIGIN}/llms.txt): agent index
- [About](${SITE_ORIGIN}/about) · [Contact](${SITE_ORIGIN}/contact) · [Privacy](${SITE_ORIGIN}/privacy)
`;

export const ABOUT_MARKDOWN = `# About ${SITE_NAME}

${SITE_NAME} is an unofficial community encyclopedia for the game Legend of Elements. AndrJetx built it for players who need a durable, searchable record of cultivation paths, classes, gear, spirits, pets, dungeons, PvP, events, and update notes. Nothing here is an official statement from the publisher. Entries are written and edited by the community, can be incomplete, and may lag behind live-server changes.

The wiki exists so that both humans and software agents can answer “how does this work in Legend of Elements?” without relying on disappearing social-media threads. Public read APIs, an OpenAPI description, a sitemap, and an llms.txt file are part of that same goal: make the knowledge reusable.

If you want to play, use the official client at ${GAME_URL}. If you want to inspect or contribute to the software that runs this wiki, the source is ${GITHUB_URL}. There is no company headquarters, phone switchboard, or paid support desk behind this project — it is a free fan site.

## Related

- [Contact](${SITE_ORIGIN}/contact)
- [Privacy](${SITE_ORIGIN}/privacy)
- [API docs](${SITE_ORIGIN}/docs)
`;

export const CONTACT_MARKDOWN = `# Contact ${SITE_NAME}

${SITE_NAME} is a community-run fan wiki. There is no official publisher helpdesk, telephone number, or mailing address for this site. For questions about articles, missing pages, or the public API, open a GitHub issue on the project repository: ${GITHUB_URL}.

Use GitHub when you want to report a factual error, request a category, flag broken API behavior, or discuss the agent-facing files (OpenAPI, llms.txt, MCP). Do not send account recovery, payment, or in-game support requests here — those belong with the game operator at ${GAME_URL}.

This contact page exists so players and agents can verify that the wiki is a real, maintained community project and know where to write. We do not collect inbound email on this domain and we do not operate a CRM. Response times depend on volunteer availability.

Preferred public channel: GitHub issues at ${GITHUB_URL}. Homepage: ${SITE_ORIGIN}/. API documentation: ${SITE_ORIGIN}/docs.
`;

export const PRIVACY_MARKDOWN = `# Privacy — ${SITE_NAME}

${SITE_NAME} is a free unofficial encyclopedia. This page explains what little data the site handles. Browsing articles does not require an account. The public API is readable without authentication. Administrative editing uses a password cookie on this domain only and is limited to trusted maintainers.

Server logs and the hosting provider (Vercel) may record standard request metadata such as IP address, user agent, and requested path, for operations and abuse prevention. Article view counts increment when an article is fetched from the API. We do not sell personal data, run advertising pixels, or build marketing profiles.

Cookies: a signed admin session cookie named wiki_admin_session is set only after a successful maintainer login. Theme preference may be stored in localStorage in your browser. You can clear both at any time.

If you believe personal data was posted inside an article, open an issue at ${GITHUB_URL} and we will edit or remove it. This policy applies to ${SITE_ORIGIN} and its public API. The official game at ${GAME_URL} has its own terms.
`;

export const DOCS_MARKDOWN = `# ${SITE_NAME} API

The Legend of Elements Wiki API is a public REST interface for encyclopedia data. Agents and apps should use it (or the MCP tools) instead of scraping the website. Base path: ${SITE_ORIGIN}/api. OpenAPI 3.1: ${SITE_ORIGIN}/openapi.json and ${SITE_ORIGIN}/api/openapi.yaml.

## Authentication

Read endpoints are unauthenticated: health, articles, featured and recent lists, article-by-slug, categories, search, stats, and tools. Create, update, and delete require a signed admin cookie (\`wiki_admin_session\`) obtained via \`POST /api/admin/login\`. If you are an agent integrating player-facing features, you only need the public GET methods.

## Example requests

\`\`\`bash
curl ${SITE_ORIGIN}/api/healthz
curl "${SITE_ORIGIN}/api/search?q=cultivation"
curl ${SITE_ORIGIN}/api/articles/featured
curl ${SITE_ORIGIN}/openapi.json
\`\`\`

Errors are JSON objects with \`error.code\`, \`error.message\`, and \`error.hint\`. Rate or auth failures include a hint pointing back at this page or the OpenAPI file.

MCP Streamable HTTP lives at ${SITE_ORIGIN}/mcp with discovery at ${SITE_ORIGIN}/.well-known/mcp. Use it when a model should call search, get article, list categories, or read wiki stats as tools.

## Related

- [llms.txt](${SITE_ORIGIN}/llms.txt)
- [Sitemap](${SITE_ORIGIN}/sitemap.xml)
- [Source](${GITHUB_URL})
`;

const STATIC_MARKDOWN: Record<string, string> = {
  "/": HOME_MARKDOWN,
  "/about": ABOUT_MARKDOWN,
  "/contact": CONTACT_MARKDOWN,
  "/privacy": PRIVACY_MARKDOWN,
  "/docs": DOCS_MARKDOWN,
  "/search": `# Search ${SITE_NAME}

Use the search page or \`GET ${SITE_ORIGIN}/api/search?q=\` to find encyclopedia articles by title or body. This UI is a client-side form; agents should call the search API or the MCP \`search_articles\` tool.

- [API docs](${SITE_ORIGIN}/docs)
- [OpenAPI](${SITE_ORIGIN}/openapi.json)
`,
  "/ferramentas": `# Ferramentas — ${SITE_NAME}

Community tools and adjacent sites linked from the wiki. List them programmatically with \`GET ${SITE_ORIGIN}/api/tools\` or the MCP \`list_tools\` tool.

- [API docs](${SITE_ORIGIN}/docs)
`,
  "/iniciar-jornada": `# Iniciar Jornada — ${SITE_NAME}

Play Legend of Elements in the official client: ${GAME_URL}. This wiki page embeds the game for convenience and is not an API.

- [Home](${SITE_ORIGIN}/)
`,
};

export function staticMarkdownForPath(pathname: string): string | null {
  const path = normalizePathname(pathname);
  return STATIC_MARKDOWN[path] ?? null;
}

export function articleMarkdown(input: {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  slug: string;
}): string {
  const body = htmlToMarkdown(input.content).trim() || input.excerpt;
  return `# ${input.title}

Category: ${input.category}
Slug: ${input.slug}
Source: ${SITE_ORIGIN}/wiki/${input.category}/${input.slug}

${input.excerpt}

${body}
`;
}

export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(ul|ol)>/gi, "\n")
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function markdownPathFromRequest(pathname: string): string {
  const path = normalizePathname(pathname);
  const stripped = path.replace(/^\/api\/markdown\/?/, "/") || "/";
  return normalizePathname(stripped);
}

export function wikiLookupFromMarkdownPath(pathname: string) {
  return parseWikiArticlePath(markdownPathFromRequest(pathname));
}
