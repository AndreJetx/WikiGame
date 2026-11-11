import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { MagiteTool } from "@/magite/app";
import { syncDocument } from "@/magite/lib/i18n";
import "@/magite/magite.css";

export function MagitePage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const previous = {
      title: document.title,
      lang: document.documentElement.lang,
      description: meta?.getAttribute("content") ?? null,
    };
    syncDocument();
    return () => {
      document.title = previous.title;
      document.documentElement.lang = previous.lang;
      if (!meta) return;
      if (previous.description === null) meta.removeAttribute("content");
      else meta.setAttribute("content", previous.description);
    };
  }, []);

  return (
    <Layout hideFooter fullWidth>
      <div className="magite-root">
        <MagiteTool />
      </div>
    </Layout>
  );
}
