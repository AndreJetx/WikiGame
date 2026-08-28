import { Layout } from "@/components/layout";
import { Sidebar } from "@/components/sidebar";
import { useState, useEffect } from "react";
import { useSearchArticles, getSearchArticlesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CardClickHint } from "@/components/card-click-hint";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading, isFetching } = useSearchArticles(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 1, queryKey: getSearchArticlesQueryKey({ q: debouncedQuery }) } }
  );

  return (
    <Layout withSidebar>
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 min-w-0 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-6 text-primary">Pesquisar na Wiki</h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Pesquise por título, conteúdo ou categoria..."
              className="pl-12 h-14 text-lg bg-card/50 border-primary/20 focus-visible:ring-primary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isFetching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary animate-spin" />
            )}
          </div>
        </div>

        <div className="space-y-4">
          {!debouncedQuery || debouncedQuery.length <= 1 ? (
            <div className="py-12 text-center text-muted-foreground">
              Digite pelo menos 2 caracteres para iniciar a pesquisa.
            </div>
          ) : isLoading ? (
            <div className="py-12 text-center text-muted-foreground flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : results?.length ? (
            results.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/wiki/${article.category}/${article.slug}`}>
                  <Card className="relative hover:border-primary/50 transition-colors bg-card/50 cursor-pointer group pb-8">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-xl text-primary mb-2">{article.title}</CardTitle>
                          <CardDescription className="text-foreground/80">{article.excerpt}</CardDescription>
                        </div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                          {article.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardClickHint />
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Nenhum resultado encontrado para sua busca.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
