import { spawn } from "node:child_process";

process.env.NODE_ENV ??= "development";
process.env.PORT ??= "8080";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

await run("pnpm", ["run", "build"]);
await run("pnpm", ["run", "start"]);
