import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const wikiRoot = path.dirname(fileURLToPath(import.meta.url));

function textContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function read(relative: string): string {
  return readFileSync(path.join(wikiRoot, relative), "utf8");
}

describe("crawlable HTML", () => {
  it("homepage has metadata and 500+ characters", () => {
    const html = read("index.html");
    expect(html).toContain('lang="pt-BR"');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:type"');
    expect(html).toContain("application/ld+json");
    expect(html).toContain("SoftwareApplication");
    expect(html).toContain("Organization");
    expect(html).toMatch(/<h1[^>]*>Legend of Elements Wiki<\/h1>/);
    expect(textContent(html).length).toBeGreaterThan(500);
    expect(html).toMatch(/#root > article \{/);
    expect(html).not.toMatch(/#root \{[^}]*max-width/);
    expect(html).toMatch(/#root > article/);
    expect(html).not.toMatch(/#root \{[^}]*max-width/);
  });

  it("trust and docs pages have 500+ characters and an h1", () => {
    for (const file of ["about.html", "contact.html", "privacy.html", "docs.html"]) {
      const html = read(file);
      expect(html).toMatch(/<h1[^>]*>/);
      expect(textContent(html).length).toBeGreaterThan(500);
    }
  });

  it("llms.txt follows the spec", () => {
    const text = read("public/llms.txt").replace(/\r\n/g, "\n");
    expect(text.startsWith("# Legend of Elements Wiki\n")).toBe(true);
    expect(text).toContain("When to use this");
    expect(text).toContain("https://wiki-legendsofelements.vercel.app/docs");
  });

  it("docs page is named for search", () => {
    const html = read("docs.html");
    expect(html).toContain("<title>Legend of Elements Wiki API</title>");
    expect(html).toMatch(/<h1[^>]*>Legend of Elements Wiki API<\/h1>/);
  });
});
