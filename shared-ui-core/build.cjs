const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

console.log('[*] Compiling Bartholomew Shared UI Core with Vite + Svelte...');
try {
  execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });
} catch (err) {
  console.error('[!] Vite build failed:', err.message);
  process.exit(1);
}

// Ensure both index.css and main.css exist for all extension webviews
const mainCss = path.join(assetsDir, 'main.css');
const indexCss = path.join(assetsDir, 'index.css');

if (fs.existsSync(mainCss) && !fs.existsSync(indexCss)) {
  fs.copyFileSync(mainCss, indexCss);
} else if (fs.existsSync(indexCss) && !fs.existsSync(mainCss)) {
  fs.copyFileSync(indexCss, mainCss);
}

console.log('[PASS] Shared UI Core distribution ready in dist/assets/ (index.js, index.css, main.css)');
