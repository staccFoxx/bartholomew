/**
 * PromptSmith - Bulletproof Standalone Bundler
 * Automatically discovers local or cached esbuild binary, bundles TypeScript into CJS,
 * and supports production minification and --watch mode with zero configuration.
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function findEsbuildBinary() {
  // 1. Check local node_modules
  const localBin = path.join(__dirname, "node_modules", ".bin", process.platform === "win32" ? "esbuild.cmd" : "esbuild");
  if (fs.existsSync(localBin)) return { cmd: localBin, argsPrefix: [] };

  // 2. Fast-path: Check npm cache binaries on Windows
  if (process.platform === "win32") {
    const npxCache = path.join(process.env.LOCALAPPDATA || "", "npm-cache", "_npx");
    if (fs.existsSync(npxCache)) {
      try {
        const dirs = fs.readdirSync(npxCache);
        for (const d of dirs) {
          const directExe = path.join(npxCache, d, "node_modules", "@esbuild", "win32-x64", "esbuild.exe");
          if (fs.existsSync(directExe)) {
            return { cmd: directExe, argsPrefix: [] };
          }
        }
      } catch {}
    }
  }

  // 3. Fallback: npx runner
  return { cmd: "npx", argsPrefix: ["--yes", "esbuild"] };
}

async function main() {
  const isWatch = process.argv.includes("--watch");
  const { cmd, argsPrefix } = findEsbuildBinary();

  const buildArgs = [
    ...argsPrefix,
    "src/extension.ts",
    "--bundle",
    "--outfile=dist/extension.js",
    "--external:vscode",
    "--format=cjs",
    "--platform=node",
    "--target=node18",
    "--minify"
  ];

  if (isWatch) {
    buildArgs.push("--watch");
    console.log("Watching src/ for changes...");
  }

  const startTime = Date.now();
  execFileSync(cmd, buildArgs, {
    cwd: __dirname,
    stdio: "inherit",
    shell: cmd === "npx"
  });

  const duration = Date.now() - startTime;
  console.log(`Successfully built dist/extension.js in ${duration}ms.`);
}

main().catch((err) => {
  console.error("Build failed:", err.message);
  process.exit(1);
});
