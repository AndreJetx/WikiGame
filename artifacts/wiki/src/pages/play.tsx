import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAME_URL } from "@/lib/tools";

export function Play() {
  return (
    <Layout hideFooter fullWidth>
      <div className="flex-1 flex flex-col min-h-0 w-full">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur sticky top-16 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 shrink-0">
                <ArrowLeft className="w-4 h-4" />
                Voltar à Wiki
              </Button>
            </Link>
            <h1 className="font-serif text-lg text-primary truncate hidden sm:block">
              Iniciar Jornada
            </h1>
          </div>
          <a href={GAME_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              Abrir em nova aba
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>

        <div className="flex-1 w-full bg-black" style={{ minHeight: "calc(100vh - 8.5rem)" }}>
          <iframe
            title="Legend of Elements"
            src={GAME_URL}
            className="w-full h-full border-0"
            style={{ minHeight: "calc(100vh - 8.5rem)" }}
            allow="fullscreen; autoplay; clipboard-write; payment; encrypted-media"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </Layout>
  );
}
