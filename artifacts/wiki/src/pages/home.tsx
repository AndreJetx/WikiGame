import { Layout } from "@/components/layout";
import { Sidebar, CATEGORIES, CategoryIcon } from "@/components/sidebar";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { Link } from "wouter";
import coverImage from "@assets/legend-of-elements-wiki-hero.jpg";
import { useListRecentArticles, useListFeaturedArticles, useGetWikiStats, getGetWikiStatsQueryKey, useListTools, getListToolsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CardClickHint } from "@/components/card-click-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, BookOpen, Layers, Activity, Eye, Wrench, ExternalLink, ArrowRight } from "lucide-react";

export function Home() {
  const { data: recentArticles, isLoading: isLoadingRecent } = useListRecentArticles({ limit: 4 });
  const { data: featuredArticles, isLoading: isLoadingFeatured } = useListFeaturedArticles();
  const { data: stats } = useGetWikiStats({ query: { queryKey: getGetWikiStatsQueryKey() }});
  const { data: tools, isLoading: isLoadingTools } = useListTools({ query: { queryKey: getListToolsQueryKey() }});

  return (
    <Layout withSidebar>
      <Sidebar />
      <div className="flex-1 min-w-0 p-4 md:p-8 space-y-12">
        <section className="relative w-full rounded-2xl overflow-hidden shadow-2xl group border border-primary/20">
          <img
            src={coverImage}
            alt="Legend of Elements Wiki — Explore. Descubra. Evolua."
            className="w-full h-auto object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10">
            <a
              href="https://elementsh5.joynetgame.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium shadow-lg hover:bg-primary/90 transition-colors"
            >
              Jogar agora <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        {stats && (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/40 backdrop-blur border-primary/10">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <p className="text-3xl font-serif font-bold">{stats.totalArticles}</p>
                <p className="text-sm text-muted-foreground">Pergaminhos</p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur border-primary/10">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Layers className="w-8 h-8 text-primary mb-2" />
                <p className="text-3xl font-serif font-bold">{stats.totalCategories}</p>
                <p className="text-sm text-muted-foreground">Reinos</p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur border-primary/10">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Eye className="w-8 h-8 text-primary mb-2" />
                <p className="text-3xl font-serif font-bold">{stats.totalViews}</p>
                <p className="text-sm text-muted-foreground">Visitantes</p>
              </CardContent>
            </Card>
            <Card className="bg-card/40 backdrop-blur border-primary/10">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <Activity className="w-8 h-8 text-primary mb-2" />
                <p className="text-3xl font-serif font-bold">{stats.recentEdits}</p>
                <p className="text-sm text-muted-foreground">Edições Recentes</p>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2">
            <Star className="text-primary w-6 h-6" /> Artigos em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingFeatured ? (
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))
            ) : featuredArticles?.length ? (
              featuredArticles.map(article => (
                <Link key={article.id} href={`/wiki/${article.category}/${article.slug}`}>
                  <Card className="relative h-full hover:border-primary/50 transition-colors bg-card/50 cursor-pointer overflow-hidden group pb-8">
                    {article.imageUrl && (
                      <div className="h-24 w-full overflow-hidden">
                        <CloudinaryImage
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          width={640}
                          height={192}
                          crop="fill"
                        />
                      </div>
                    )}
                    <CardHeader className={article.imageUrl ? 'pt-4' : ''}>
                      <CardTitle className="line-clamp-2 text-primary group-hover:text-primary/80 transition-colors">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardClickHint />
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhum artigo em destaque encontrado.</p>
            )}
          </div>
        </section>

        {(isLoadingTools || (tools && tools.length > 0)) && (
          <section>
            <h2 className="text-2xl font-serif font-semibold mb-6 flex items-center gap-2">
              <Wrench className="text-primary w-6 h-6" /> Ferramentas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingTools ? (
                Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))
              ) : (
                tools!.map(tool => {
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
                    <Link key={tool.id} href={tool.href}>
                      {card}
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-serif font-semibold mb-6">Atualizações Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingRecent ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))
            ) : recentArticles?.length ? (
              recentArticles.map(article => (
                <Link key={article.id} href={`/wiki/${article.category}/${article.slug}`}>
                  <div className="relative flex items-center gap-4 p-4 pr-10 rounded-xl border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer group bg-card/30">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                      {(() => {
                        const cat = CATEGORIES.find(c => c.slug === article.category);
                        return cat ? (
                          <CategoryIcon
                            category={cat}
                            className="w-7 h-7"
                            lucideClassName="w-6 h-6 text-primary"
                          />
                        ) : null;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{article.title}</h4>
                      <p className="text-sm text-muted-foreground">Atualizado em {new Date(article.updatedAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <CardClickHint />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground">Nenhuma atualização recente.</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
