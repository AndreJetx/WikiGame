import { Layout } from "@/components/layout";
import { Sidebar } from "@/components/sidebar";
import { useListTools, getListToolsQueryKey } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CardClickHint } from "@/components/card-click-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, ExternalLink } from "lucide-react";

export function Tools() {
  const { data: tools, isLoading } = useListTools({ query: { queryKey: getListToolsQueryKey() } });

  return (
    <Layout withSidebar>
      <Sidebar />
      <div className="flex-1 min-w-0 p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <Wrench className="w-8 h-8" /> Ferramentas
          </h1>
          <p className="text-muted-foreground mt-1">Sites e recursos úteis para jogadores de Legend of Elements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : tools?.length ? (
            tools.map(tool => {
              const card = (
                <Card className="relative h-full hover:border-primary/50 transition-colors bg-card/50 cursor-pointer overflow-hidden group pb-8">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                        <Wrench className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="line-clamp-1 text-primary group-hover:text-primary/80 transition-colors flex items-center gap-2">
                        {tool.name}
                        {tool.external ? <ExternalLink className="w-4 h-4 text-muted-foreground" /> : null}
                      </CardTitle>
                    </div>
                    {tool.description ? (
                      <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardClickHint />
                </Card>
              );

              return tool.external ? (
                <a key={tool.id} href={tool.href} target="_blank" rel="noopener noreferrer">
                  {card}
                </a>
              ) : (
                <a key={tool.id} href={tool.href}>
                  {card}
                </a>
              );
            })
          ) : (
            <p className="text-muted-foreground">Nenhuma ferramenta cadastrada.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
