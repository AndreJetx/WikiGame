import { Layout } from "@/components/layout";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <AlertCircle className="w-32 h-32 text-primary relative z-10 animate-pulse" />
        </div>
        <h1 className="text-5xl font-serif font-bold mb-4 text-foreground">Domínio do Vazio</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          O caminho que você busca foi fragmentado pelas tribulações celestiais. Este pergaminho não existe mais neste plano.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <Home className="w-5 h-5" /> Retornar ao Santuário
        </Link>
      </div>
    </Layout>
  );
}
