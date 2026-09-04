import { Layout } from "@/components/layout";
import type { ReactNode } from "react";

export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Layout>
      <article className="flex-1 max-w-3xl mx-auto p-4 md:p-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">{title}</h1>
        <div className="space-y-4 text-foreground/90 leading-relaxed">{children}</div>
      </article>
    </Layout>
  );
}
