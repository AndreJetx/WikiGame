import { Layout } from "@/components/layout";
import { Sidebar, CATEGORIES } from "@/components/sidebar";
import { useRoute, Link } from "wouter";
import { useListArticles, getListArticlesQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export function Category() {
  const [match, params] = useRoute("/wiki/:category");
  const categorySlug = params?.category || "";
  const categoryInfo = CATEGORIES.find(c => c.slug === categorySlug);

  const { data: articles, isLoading } = useListArticles(
    { category: categorySlug },
    { query: { enabled: !!categorySlug, queryKey: getListArticlesQueryKey({ category: categorySlug }) } }
  );

  if (!categoryInfo) {
    return (
      <Layout withSidebar>
        <Sidebar />
        <div className="flex-1 p-8">Categoria não encontrada.</div>
      </Layout>
    );
  }

  const Icon = categoryInfo.icon;

  return (
    <Layout withSidebar>
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 min-w-0">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 border-b border-border/50 pb-6"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Wiki</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{categoryInfo.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">{categoryInfo.name}</h1>
              <p className="text-muted-foreground mt-1">{categoryInfo.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))
          ) : articles?.length ? (
            articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/wiki/${article.category}/${article.slug}`}>
                  <Card className="h-full hover:border-primary/50 transition-colors bg-card/50 cursor-pointer overflow-hidden group">
                    {article.imageUrl && (
                      <div className="h-32 w-full overflow-hidden border-b border-border">
                        <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <CardHeader className={article.imageUrl ? 'pt-4' : ''}>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">{article.excerpt}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">Nenhum artigo encontrado nesta categoria ainda.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
