import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    env: {
      DATABASE_URL: "postgres://127.0.0.1:1/agent_test",
      LOG_LEVEL: "silent",
      NODE_ENV: "production",
    },
  },
});
