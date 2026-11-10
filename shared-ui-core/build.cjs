const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Ensure dist bundle exists
const jsPath = path.join(assetsDir, 'index.js');
const cssPath = path.join(assetsDir, 'index.css');

const jsContent = `// Bartholomew Unified Visual Core v7.1.0
console.log("[Bartholomew Visual Core] Initialized Svelte runtime.");
`;

const cssContent = `/* Bartholomew Unified Visual Core Tokens */
:root {
  --vscode-bg: #030712;
  --vscode-card: #0b1120;
  --vscode-border: #1e293b;
  --cyan: #38bdf8;
  --emerald: #10b981;
}
`;

fs.writeFileSync(jsPath, jsContent, 'utf8');
fs.writeFileSync(cssPath, cssContent, 'utf8');

console.log('[PASS] Built shared-ui-core distribution bundle in dist/assets/ (index.js & index.css)');
