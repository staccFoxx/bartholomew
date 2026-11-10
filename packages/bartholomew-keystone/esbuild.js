/**
 * Bartholomew Keystone VS Code Extension - Bundler
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

  // 1. Bundle Extension
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
  console.log(`[*] Bundling Bartholomew Keystone extension with ${cmd}...`);
  execFileSync(cmd, extArgs, { stdio: 'inherit', shell: process.platform === 'win32' });

  // 2. Bundle Keystone Passkey Engine Library (for test_keystone.js & external runtime)
  const libArgs = [
    ...argsPrefix,
    'src/keystone_passkey.ts',
    '--bundle',
    '--outfile=dist/keystone_passkey.js',
    '--format=cjs',
    '--platform=node',
    '--target=node18'
  ];
  console.log(`[*] Bundling keystone_passkey library with ${cmd}...`);
  execFileSync(cmd, libArgs, { stdio: 'inherit', shell: process.platform === 'win32' });

  console.log('[PASS] Successfully built dist/extension.js and dist/keystone_passkey.js');
}

main();
