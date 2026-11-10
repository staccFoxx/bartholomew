/**
 * Bartholomew Guard VS Code Extension - Bundler
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findEsbuildBinary() {
  if (process.platform === 'win32') {
    const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
    if (fs.existsSync(npxCache)) {
      try {
        const dirs = fs.readdirSync(npxCache);
        for (const d of dirs) {
          const directExe = path.join(npxCache, d, 'node_modules', '@esbuild', 'win32-x64', 'esbuild.exe');
          if (fs.existsSync(directExe)) {
            return { cmd: directExe, argsPrefix: [] };
          }
        }
      } catch {}
    }
  }
  return { cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx', argsPrefix: ['--yes', 'esbuild'] };
}

function main() {
  const { cmd, argsPrefix } = findEsbuildBinary();
  const extArgs = [
    ...argsPrefix,
    'src/extension.ts',
    '--bundle',
    '--outfile=dist/extension.js',
    '--external:vscode',
    '--format=cjs',
    '--platform=node',
    '--target=node18',
    '--minify'
  ];
  console.log(`[*] Bundling Bartholomew Guard with ${cmd}...`);
  execFileSync(cmd, extArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  console.log('[PASS] Successfully built dist/extension.js');
}

main();
