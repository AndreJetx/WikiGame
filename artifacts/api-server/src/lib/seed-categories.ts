import { db, categoriesTable } from "@workspace/db";

export const DEFAULT_CATEGORIES = [
  { name: "Caminho da Ascensão", slug: "cultivation", description: "Reinos, evolução e tribulações", icon: "cultivation" },
  { name: "Classes e Caminhos", slug: "classes", description: "Especializações, elementos e habilidades", icon: "classes" },
  { name: "Equipamentos", slug: "equipment", description: "Armas, artefatos e refinamento", icon: "equipment" },
  { name: "Espíritos", slug: "spirits", description: "Espíritos elementais e aliados sobrenaturais", icon: "spirits" },
  { name: "Pets e Companheiros", slug: "pets", description: "Bestas espirituais e montarias", icon: "pets" },
  { name: "Lar", slug: "home", description: "Página principal da wiki", icon: "home" },
  { name: "Dungeons e Bosses", slug: "dungeons", description: "Bosses mundiais e instâncias", icon: "dungeons" },
  { name: "PvP e Guildas", slug: "pvp", description: "Arena, clãs e rankings", icon: "pvp" },
  { name: "Guias", slug: "guides", description: "Guias para iniciantes e progressão", icon: "guides" },
  { name: "Eventos", slug: "events", description: "Eventos sazonais e missões especiais", icon: "events" },
  { name: "Atualizações", slug: "updates", description: "Notas de atualização e roadmap", icon: "updates" },
] as const;

let seeded = false;

export async function ensureDefaultCategories() {
  if (seeded) return;
  await db
    .insert(categoriesTable)
    .values([...DEFAULT_CATEGORIES])
    .onConflictDoNothing({ target: categoriesTable.slug });
  seeded = true;
}
