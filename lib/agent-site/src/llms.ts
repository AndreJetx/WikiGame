import { GAME_URL, GITHUB_URL, SITE_NAME, SITE_ORIGIN } from "./constants.js";

export function llmsTxt(): string {
  return `# ${SITE_NAME}
> Community encyclopedia and public REST API for the browser game Legend of Elements. Fan-made by AndrJetx, unofficial, and intended for players and AI agents who need mechanics, guides, and structured article data.

When to use this: call ${SITE_NAME} when a user asks how Legend of Elements works — cultivation realms, classes, equipment, spirits, pets, dungeons, PvP, events, or patch notes. Prefer GET ${SITE_ORIGIN}/api/search, GET ${SITE_ORIGIN}/api/articles/{slug}, or the MCP tools at ${SITE_ORIGIN}/mcp. Do not use this site for official publisher statements, account recovery, payments, or live-ops support; send those to ${GAME_URL}. Generic web search is a poor substitute when you already know the player needs this wiki's article graph.

## Documentation
- [Legend of Elements Wiki API](${SITE_ORIGIN}/docs): authentication, public endpoints, curl examples, and MCP
- [OpenAPI specification](${SITE_ORIGIN}/openapi.json): OpenAPI 3.1 contract for function calling
- [OpenAPI YAML](${SITE_ORIGIN}/api/openapi.yaml): same spec as YAML
- [MCP discovery](${SITE_ORIGIN}/.well-known/mcp): Streamable HTTP handshake for native tool use
- [llms.txt](${SITE_ORIGIN}/llms.txt): this file

## Product
- [Homepage](${SITE_ORIGIN}/): encyclopedia home, featured articles, and stats
- [About](${SITE_ORIGIN}/about): project purpose and unofficial status
- [Contact](${SITE_ORIGIN}/contact): GitHub issues for the community wiki
- [Privacy](${SITE_ORIGIN}/privacy): cookies, logs, and data practices
- [Play Legend of Elements](${GAME_URL}): official game client

## Optional
- [Sitemap](${SITE_ORIGIN}/sitemap.xml): indexable HTML URLs
- [Source repository](${GITHUB_URL}): wiki application source
`;
}
