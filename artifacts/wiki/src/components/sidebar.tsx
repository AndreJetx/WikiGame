import { Link } from "wouter";
import { Book, Swords, Dog, Skull, Crosshair, Map, History, Home, CalendarDays, Ghost } from "lucide-react";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import equipmentIcon from "@assets/equipment-icon.png";
import spiritsIcon from "@assets/spirits-icon.png";
import classesIcon from "@assets/classes-icon.png";
import cultivationIcon from "@assets/cultivation-icon.png";
import homeIcon from "@assets/home-icon.png";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: React.ElementType;
  iconSrc?: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  { id: "cultivation", name: "Caminho da Ascensão", slug: "cultivation", iconSrc: cultivationIcon, description: "Reinos, evolução e tribulações" },
  { id: "classes", name: "Classes e Caminhos", slug: "classes", iconSrc: classesIcon, description: "Especializações, elementos e habilidades" },
  { id: "equipment", name: "Equipamentos", slug: "equipment", iconSrc: equipmentIcon, description: "Armas, artefatos e refinamento" },
  { id: "spirits", name: "Espíritos", slug: "spirits", iconSrc: spiritsIcon, description: "Espíritos elementais e aliados sobrenaturais" },
  { id: "pets", name: "Pets e Companheiros", slug: "pets", icon: Dog, description: "Bestas espirituais e montarias" },
  { id: "home", name: "Lar", slug: "home", iconSrc: homeIcon, description: "Página principal da wiki" },
  { id: "dungeons", name: "Dungeons e Bosses", slug: "dungeons", icon: Skull, description: "Bosses mundiais e instâncias" },
  { id: "pvp", name: "PvP e Guildas", slug: "pvp", icon: Crosshair, description: "Arena, clãs e rankings" },
  { id: "guides", name: "Guias", slug: "guides", icon: Map, description: "Guias para iniciantes e progressão" },
  { id: "events", name: "Eventos", slug: "events", icon: CalendarDays, description: "Eventos sazonais e missões especiais" },
  { id: "updates", name: "Atualizações", slug: "updates", icon: History, description: "Notas de atualização e roadmap" },
];

export function Sidebar() {
  const { data: serverCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  return (
    <aside className="w-64 shrink-0 p-4 border-r border-border hidden md:block bg-card/30 backdrop-blur-sm">
      <div className="sticky top-20">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-2">Categorias</h3>
        <nav className="space-y-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const serverCat = serverCategories?.find(c => c.slug === cat.slug);
            const count = serverCat?.articleCount || 0;
            return (
              <Link
                key={cat.id}
                href={`/wiki/${cat.slug}`}
                className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {cat.iconSrc ? (
                    <img
                      src={cat.iconSrc}
                      alt={cat.name}
                      className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : Icon ? (
                    <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  ) : null}
                  {cat.name}
                </div>
                {count > 0 && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  );
}
