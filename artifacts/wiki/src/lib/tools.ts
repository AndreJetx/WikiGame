export const GAME_URL = "https://elementsh5.joynetgame.com/";
export const MAGITE_PATH = "/ferramentas/controle-de-magites";
export const OPPONENT_PATH = "/ferramentas/painel-de-oponentes";

export function presentTool<T extends { href: string; external: boolean }>(tool: T): T {
  if (!/magite\.vercel\.app/i.test(tool.href)) return tool;
  return { ...tool, href: MAGITE_PATH, external: false };
}

const OPPONENT_TOOL = {
  id: -2,
  name: "Painel de Oponentes",
  description: "Registre oponentes que você derrotou, ficou por pouco ou foi derrotado, com poder e status.",
  href: OPPONENT_PATH,
  external: false,
};

export function listToolCards<T extends { href: string; external: boolean }>(tools: T[] | undefined): Array<T | typeof OPPONENT_TOOL> {
  const presented = (tools ?? []).map(presentTool);
  if (presented.some((tool) => tool.href === OPPONENT_PATH)) return presented;
  return [...presented, OPPONENT_TOOL];
}
export const GITHUB_URL = "https://github.com/AndreJetx/WikiGame";
export const SITE_ORIGIN = "https://wiki.legendsofelements.com";

