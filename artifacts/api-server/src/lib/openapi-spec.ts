import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

function loadOpenApiYaml(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.join(here, "openapi.yaml"),
    path.join(here, "../../../lib/api-spec/openapi.yaml"),
    path.resolve(process.cwd(), "lib/api-spec/openapi.yaml"),
    path.resolve(process.cwd(), "../../lib/api-spec/openapi.yaml"),
  ];
  for (const candidate of candidates) {
    try {
      return readFileSync(candidate, "utf8");
    } catch {
      // try next
    }
  }
  throw new Error("openapi.yaml not found");
}

let yamlCache: string | undefined;
let jsonCache: unknown;

export function getOpenApiYaml(): string {
  yamlCache ??= loadOpenApiYaml();
  return yamlCache;
}

export function getOpenApiJson(): unknown {
  jsonCache ??= parseYaml(getOpenApiYaml());
  return jsonCache;
}
