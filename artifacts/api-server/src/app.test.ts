import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "./app";

describe("agent-facing API", () => {
  it("keeps the public health endpoint", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
  it("returns structured JSON errors for unknown API paths", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toBeTruthy();
    expect(res.body.error.hint).toMatch(/openapi/i);
  });

  it("publishes parseable OpenAPI JSON", async () => {
    const res = await request(app).get("/api/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    const operationIds = new Set<string>();
    const methods = ["get", "put", "post", "delete", "patch", "options", "head", "trace"];
    for (const [pathKey, pathItem] of Object.entries(res.body.paths ?? {})) {
      expect(pathKey).toBeTruthy();
      for (const method of methods) {
        const operation = (pathItem as Record<string, { description?: string; operationId?: string }>)[method];
        if (!operation) continue;
        expect(operation.description, `${method.toUpperCase()} ${pathKey} missing description`).toBeTruthy();
        expect(operation.operationId).toBeTruthy();
        expect(operationIds.has(operation.operationId!)).toBe(false);
        operationIds.add(operation.operationId!);
      }
    }
    expect(operationIds.size).toBeGreaterThan(5);
    expect(res.body.components.schemas.Problem).toBeTruthy();
  });

  it("publishes OpenAPI YAML", async () => {
    const res = await request(app).get("/api/openapi.yaml");
    expect(res.status).toBe(200);
    expect(res.text).toContain("openapi:");
    expect(res.text).toContain("operationId: healthCheck");
  });

  it("serves homepage markdown with Vary: Accept", async () => {
    const res = await request(app).get("/api/markdown").set("Accept", "text/markdown");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/markdown/);
    expect(res.headers.vary).toMatch(/Accept/i);
    expect(res.text).toContain("# Legend of Elements Wiki");
    expect(res.text.length).toBeGreaterThan(500);
  });

  it("returns markdown 404 for unknown pages", async () => {
    const res = await request(app)
      .get("/api/markdown/some-path-that-does-not-exist")
      .set("Accept", "text/markdown");
    expect(res.status).toBe(404);
    expect(res.text).toContain("/sitemap.xml");
    expect(res.text).toContain("/llms.txt");
    expect(res.text).toContain("/docs");
  });

  it("exposes MCP discovery and tools/list", async () => {
    const discovery = await request(app).get("/api/well-known/mcp");
    expect(discovery.status).toBe(200);
    expect(discovery.body.endpoints.streamable_http).toContain("/mcp");
    expect(discovery.body.capabilities.tools).toBe(true);

    const listed = await request(app)
      .post("/api/mcp")
      .set("Accept", "application/json, text/event-stream")
      .send({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    expect(listed.status).toBe(200);
    const names = listed.body.result.tools.map((tool: { name: string }) => tool.name);
    expect(names).toContain("search_articles");
    expect(names).toContain("get_article");

    const get = await request(app).get("/api/mcp");
    expect(get.status).toBe(405);
  });
});
