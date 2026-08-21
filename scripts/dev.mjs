import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) {
    console.error("Missing .env — copy .env.example to .env and try again.");
    process.exit(1);
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      cwd: root,
      env: process.env,
    });
    child.on("exit", (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code ?? signal}`));
    });
  });
}

loadEnv();

console.log("Pushing database schema to Supabase...");
await run("pnpm", ["--filter", "@workspace/db", "push"]);

console.log("Starting apps...");
await run("pnpm", [
  "-r",
  "--parallel",
  "--filter",
  "./artifacts/**",
  "--if-present",
  "run",
  "dev",
]);
