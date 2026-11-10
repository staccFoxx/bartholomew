/**
 * Universal Extension UI Synchronization Pipeline
 * =================================================
 * Automatically synchronizes compiled modern UI core assets (Svelte components,
 * compiled CSS/JS bundles, SVG canvases) across the entire Bartholomew toolchain.
 *
 * Targets:
 *   - Bartholomew Guard (packages/vscode-extension)
 *   - Bartholomew Keystone (packages/bartholomew-keystone)
 *   - PromptSmith (packages/promptsmith-vscode)
 *   - Bartholomew Trinity (packages/bartholomew-trinity)
 *   - Bartholomew Vault (packages/bartholomew-vault)
 *   - Tortuga Markets (../prediction-exchange-core/axiom-vscode)
 *   - Kyro / CypherVoice (../acoustic-cloak/extensions/vscode)
 */

const fs = require('fs');
const path = require('path');

// Target extension directories relative to repository root
const targetExtensions = [
  'packages/vscode-extension',
  'packages/bartholomew-keystone',
  'packages/promptsmith-vscode',
  'packages/bartholomew-trinity',
  'packages/bartholomew-vault',
  '../prediction-exchange-core/axiom-vscode',
  '../acoustic-cloak/extensions/vscode'
];

// Determine source dist directory (root dist or webview dist)
const repoRoot = path.resolve(__dirname, '..');
const candidateSourceDists = [
  path.join(repoRoot, 'shared-ui-core', 'dist'),
  path.join(repoRoot, 'dist'),
  path.join(repoRoot, 'packages', 'vscode-extension', 'dist')
];

function findSourceDist() {
  for (const p of candidateSourceDists) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function syncAssets() {
  const sourceDist = findSourceDist();

  if (!sourceDist) {
    console.error('[ERROR] Source distribution directory not found. Compile webview assets first.');
    process.exit(1);
  }

  console.log('[INFO] Synchronizing modern UI core across extension suite from: ' + sourceDist);

  let syncedCount = 0;
  let skippedCount = 0;

  targetExtensions.forEach((relPath) => {
    const resolvedPath = path.resolve(repoRoot, relPath);

    if (fs.existsSync(resolvedPath)) {
      const extDist = path.join(resolvedPath, 'dist');
      if (!fs.existsSync(extDist)) {
        fs.mkdirSync(extDist, { recursive: true });
      }

      // Sync dist assets recursively if assets folder exists
      const sourceAssets = path.join(sourceDist, 'assets');
      const targetAssets = path.join(extDist, 'assets');
      if (fs.existsSync(sourceAssets)) {
        if (!fs.existsSync(targetAssets)) {
          fs.mkdirSync(targetAssets, { recursive: true });
        }
        fs.cpSync(sourceAssets, targetAssets, { recursive: true });
      }

      console.log(`[SYNC] Updated Webview assets for: ${path.basename(resolvedPath)} (${relPath})`);
      syncedCount++;
    } else {
      console.warn(`[SKIP] Extension path not found locally: ${relPath}`);
      skippedCount++;
    }
  });

  console.log(`[COMPLETE] UI synchronization finished. Synced: ${syncedCount}, Skipped: ${skippedCount}.`);
}

syncAssets();
