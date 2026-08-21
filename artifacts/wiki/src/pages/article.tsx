import { Layout } from "@/components/layout";
import { Sidebar, CATEGORIES } from "@/components/sidebar";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { useRoute, Link } from "wouter";
import { useGetArticle, getGetArticleQueryKey } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Eye, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Article() {
  const [match, params] = useRoute("/wiki/:category/:slug");
  const slug = params?.slug || "";
  const categorySlug = params?.category || "";
  const categoryInfo = CATEGORIES.find(c => c.slug === categorySlug);

  const { data: article, isLoading } = useGetArticle(
    slug,
    { query: { enabled: !!slug, queryKey: getGetArticleQueryKey(slug) } }
  );

  return (
    <Layout withSidebar>
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 min-w-0 max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Wiki</Link>
          <ChevronRight className="w-4 h-4" />
          {categoryInfo ? (
            <>
              <Link href={`/wiki/${categoryInfo.slug}`} className="hover:text-primary transition-colors">{categoryInfo.name}</Link>
              <ChevronRight className="w-4 h-4" />
            </>
          ) : null}
          <span className="text-foreground line-clamp-1">{article?.title || 'Carregando...'}</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-1/4 rounded-md" />
            <div className="h-8" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        ) : article ? (
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-stone dark:prose-invert prose-headings:font-serif prose-h1:text-4xl prose-h1:text-primary prose-a:text-primary prose-table:w-full prose-th:bg-muted/50 prose-td:border prose-td:border-border prose-th:border prose-th:border-border max-w-none"
          >
            <h1 className="mb-4">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 not-prose">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.createdAt).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.viewCount} visualizações
              </div>
              {article.featured && (
                <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                  Destaque
                </Badge>
              )}
            </div>

            {article.imageUrl && (
              <div className="mb-10 rounded-2xl overflow-hidden border border-border/50 shadow-lg not-prose">
                <CloudinaryImage
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full max-h-[500px] object-cover"
                  width={1400}
                  height={500}
                  crop="fill"
                />
              </div>
            )}

            <div
              className="tiptap-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2 not-prose">
                {article.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </motion.article>
        ) : (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-serif mb-2">Artigo Não Encontrado</h2>
            <p className="text-muted-foreground">O conhecimento que você busca está oculto aos olhos mortais.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
