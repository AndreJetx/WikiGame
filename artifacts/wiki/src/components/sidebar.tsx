import type { ElementType } from "react";
import { Link } from "wouter";
import { Wrench } from "lucide-react";
import { useListCategories, getListCategoriesQueryKey, useListTools, getListToolsQueryKey } from "@workspace/api-client-react";
import equipmentIcon from "@assets/equipment-icon.png";
import spiritsIcon from "@assets/spirits-icon.png";
import classesIcon from "@assets/classes-icon.png";
import cultivationIcon from "@assets/cultivation-icon.png";
import homeIcon from "@assets/home-icon.png";
import petsIcon from "@assets/pets-icon.png";
import dungeonsIcon from "@assets/dungeons-icon.png";
import pvpIcon from "@assets/pvp-icon.png";
import eventsIcon from "@assets/events-icon.png";
import guidesIcon from "@assets/guides-icon.png";
import updatesIcon from "@assets/updates-icon.png";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: ElementType;
  iconSrc?: string;
  description: string;
};

export const CATEGORIES: Category[] = [
  { id: "cultivation", name: "Caminho da Ascensão", slug: "cultivation", iconSrc: cultivationIcon, description: "Reinos, evolução e tribulações" },
  { id: "classes", name: "Classes e Caminhos", slug: "classes", iconSrc: classesIcon, description: "Especializações, elementos e habilidades" },
  { id: "equipment", name: "Equipamentos", slug: "equipment", iconSrc: equipmentIcon, description: "Armas, artefatos e refinamento" },
  { id: "spirits", name: "Espíritos", slug: "spirits", iconSrc: spiritsIcon, description: "Espíritos elementais e aliados sobrenaturais" },
  { id: "pets", name: "Pets e Companheiros", slug: "pets", iconSrc: petsIcon, description: "Bestas espirituais e montarias" },
  { id: "home", name: "Lar", slug: "home", iconSrc: homeIcon, description: "Página principal da wiki" },
  { id: "dungeons", name: "Dungeons e Bosses", slug: "dungeons", iconSrc: dungeonsIcon, description: "Bosses mundiais e instâncias" },
  { id: "pvp", name: "PvP e Guildas", slug: "pvp", iconSrc: pvpIcon, description: "Arena, clãs e rankings" },
  { id: "guides", name: "Guias", slug: "guides", iconSrc: guidesIcon, description: "Guias para iniciantes e progressão" },
  { id: "events", name: "Eventos", slug: "events", iconSrc: eventsIcon, description: "Eventos sazonais e missões especiais" },
  { id: "updates", name: "Atualizações", slug: "updates", iconSrc: updatesIcon, description: "Notas de atualização e roadmap" },
];

export function CategoryIcon({
  category,
  className = "w-8 h-8",
  lucideClassName = "w-4 h-4 text-primary",
}: {
  category: Category;
  className?: string;
  lucideClassName?: string;
}) {
  if (category.iconSrc) {
    return (
      <img
        src={category.iconSrc}
        alt={category.name}
        className={`object-contain ${className}`}
      />
    );
  }
  if (category.icon) {
    const Icon = category.icon;
    return <Icon className={lucideClassName} />;
  }
  return null;
}

export function SidebarNav() {
  const { data: serverCategories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });
  const { data: tools } = useListTools({
    query: { queryKey: getListToolsQueryKey() }
  });

  return (
    <>
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 px-2">Categorias</h3>
      <nav className="space-y-1">
        {CATEGORIES.map((cat) => {
          const serverCat = serverCategories?.find(c => c.slug === cat.slug);
          const count = serverCat?.articleCount || 0;
          return (
            <Link
              key={cat.id}
              href={`/wiki/${cat.slug}`}
              className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="group-hover:scale-110 transition-transform inline-flex">
                  <CategoryIcon
                    category={cat}
                    className="w-8 h-8"
                    lucideClassName="w-4 h-4 text-primary"
                  />
                </span>
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
        {tools && tools.length > 0 && (
          <Link
            href="/ferramentas"
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="group-hover:scale-110 transition-transform inline-flex w-8 h-8 items-center justify-center">
                <Wrench className="w-4 h-4 text-primary" />
              </span>
              Ferramentas
            </div>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full group-hover:bg-primary/20 group-hover:text-primary transition-colors">
              {tools.length}
            </span>
          </Link>
        )}
      </nav>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 p-4 border-r border-border hidden md:block bg-card/30 backdrop-blur-sm">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  );
}
