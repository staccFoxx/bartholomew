const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = __dirname;
const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist, { recursive: true });
}

const esbuildPath = 'C:\\Users\\User\\AppData\\Local\\npm-cache\\_npx\\69f9afb961c37556\\node_modules\\@esbuild\\win32-x64\\esbuild.exe';

console.log('[*] Bundling Bartholomew Vault with esbuild...');
execSync(`"${esbuildPath}" "${path.join(root, 'src', 'extension.ts')}" --bundle --platform=node --target=node20 --external:vscode --outfile="${path.join(dist, 'extension.js')}"`, { stdio: 'inherit' });
console.log('[PASS] Successfully built dist/extension.js');
