import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ABOUT_MARKDOWN,
  CONTACT_MARKDOWN,
  HOME_MARKDOWN,
  PRIVACY_MARKDOWN,
  apiError,
  buildSitemapXml,
  isKnownSpaPath,
  llmsTxt,
  negotiateAccept,
  notFoundMarkdown,
  staticMarkdownForPath,
} from "./index.js";

describe("negotiateAccept", () => {
  it("prefers markdown when it ranks first", () => {
    expect(negotiateAccept("text/markdown")).toBe("markdown");
    expect(negotiateAccept("text/markdown, text/html;q=0.8")).toBe("markdown");
  });

  it("prefers html for browsers", () => {
    expect(negotiateAccept("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")).toBe(
      "html",
    );
    expect(negotiateAccept(undefined)).toBe("html");
  });

  it("returns 406 when no supported type is offered", () => {
    expect(negotiateAccept("application/xml")).toBe("not_acceptable");
  });
});

describe("known spa paths", () => {
  it("allows wiki and docs routes", () => {
    expect(isKnownSpaPath("/")).toBe(true);
    expect(isKnownSpaPath("/docs")).toBe(true);
    expect(isKnownSpaPath("/wiki/cultivation/foo")).toBe(true);
    expect(isKnownSpaPath("/some-path-that-does-not-exist")).toBe(false);
  });
});

describe("markdown pages", () => {
  it("serves homepage markdown with product name", () => {
    expect(staticMarkdownForPath("/")?.startsWith("# Legend of Elements Wiki")).toBe(true);
    expect(HOME_MARKDOWN.length).toBeGreaterThan(500);
  });

  it("404 markdown points at sitemap, llms.txt, and docs", () => {
    const body = notFoundMarkdown();
    expect(body).toContain("/sitemap.xml");
    expect(body).toContain("/llms.txt");
    expect(body).toContain("/docs");
  });

  it("trust pages have substantial copy", () => {
    expect(ABOUT_MARKDOWN.length).toBeGreaterThan(500);
    expect(CONTACT_MARKDOWN.length).toBeGreaterThan(500);
    expect(PRIVACY_MARKDOWN.length).toBeGreaterThan(500);
  });
});

describe("llms.txt", () => {
  it("matches llmstxt.org v2", () => {
    const text = llmsTxt();
    expect(text.startsWith("# Legend of Elements Wiki\n")).toBe(true);
    expect(text).toContain("When to use this");
    expect(text).toContain("https://wiki-legendsofelements.vercel.app/docs");
    expect(text).toContain("https://wiki-legendsofelements.vercel.app/openapi.json");
  });

  it("matches the published public file", () => {
    const published = readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../artifacts/wiki/public/llms.txt"),
      "utf8",
    ).replace(/\r\n/g, "\n");
    expect(published.trim()).toBe(llmsTxt().trim());
  });
});

describe("errors and sitemap", () => {
  it("builds structured API errors", () => {
    expect(apiError("NOT_FOUND", "missing", "see /openapi.json")).toEqual({
      error: { code: "NOT_FOUND", message: "missing", hint: "see /openapi.json" },
    });
  });

  it("emits valid sitemap xml", () => {
    const xml = buildSitemapXml([
      { loc: "https://wiki-legendsofelements.vercel.app/", lastmod: "2026-09-04" },
    ]);
    expect(xml).toContain("<urlset");
    expect(xml).toContain("<lastmod>2026-09-04</lastmod>");
  });
});
