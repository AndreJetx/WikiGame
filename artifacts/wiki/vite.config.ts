import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { agentSitePlugin } from "./vite-plugin-agent-site";

const rawPort = process.env.PORT ?? "22172";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  envDir: path.resolve(import.meta.dirname, "../.."),
  plugins: [agentSitePlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  appType: "mpa",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        about: path.resolve(import.meta.dirname, "about.html"),
        contact: path.resolve(import.meta.dirname, "contact.html"),
        privacy: path.resolve(import.meta.dirname, "privacy.html"),
        docs: path.resolve(import.meta.dirname, "docs.html"),
        notFound: path.resolve(import.meta.dirname, "404.html"),
      },
    },
  },
  server: {
    port,
    strictPort: true,
    // Listen on IPv4+IPv6 so Chrome's `localhost` (::1) works, not only 127.0.0.1
    host: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
      },
      "/openapi.json": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: () => "/api/openapi.json",
      },
      "/openapi.yaml": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: () => "/api/openapi.yaml",
      },
      "/sitemap.xml": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: () => "/api/sitemap.xml",
      },
      "/mcp": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: () => "/api/mcp",
      },
      "/.well-known/mcp": {
        target: "http://127.0.0.1:8080",
        changeOrigin: true,
        rewrite: () => "/api/well-known/mcp",
      },
    },
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: true,
    allowedHosts: true,
  },
});
