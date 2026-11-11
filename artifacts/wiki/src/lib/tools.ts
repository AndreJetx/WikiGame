export const GAME_URL = "https://elementsh5.joynetgame.com/";
export const MAGITE_PATH = "/ferramentas/controle-de-magites";

export function presentTool<T extends { href: string; external: boolean }>(tool: T): T {
  if (!/magite\.vercel\.app/i.test(tool.href)) return tool;
  return { ...tool, href: MAGITE_PATH, external: false };
}
export const GITHUB_URL = "https://github.com/AndreJetx/WikiGame";
export const SITE_ORIGIN = "https://wiki.legendsofelements.com";

