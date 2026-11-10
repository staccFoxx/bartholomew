const { execSync } = require('child_process');
const esbuildPath = 'C:\\Users\\User\\AppData\\Local\\npm-cache\\_npx\\69f9afb961c37556\\node_modules\\@esbuild\\win32-x64\\esbuild.exe';

console.log('[esbuild] Bundling Bartholomew Trinity extension with standalone binary...');
execSync(`"${esbuildPath}" src/extension.ts --bundle --platform=node --external:vscode --outfile=dist/extension.js`, {
  stdio: 'inherit'
});
console.log('[esbuild] Bartholomew Trinity bundle complete.');
