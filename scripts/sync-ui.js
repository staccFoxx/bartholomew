/**
 * Universal Extension UI Synchronization Pipeline
 * =================================================
 * Automatically synchronizes compiled modern UI core assets across the
 * entire Bartholomew toolchain.
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

const targetExtensions = [
  'packages/vscode-extension',
  'packages/bartholomew-keystone',
  'packages/promptsmith-vscode',
  'packages/bartholomew-trinity',
  'packages/bartholomew-vault',
  '../prediction-exchange-core/axiom-vscode',
  '../acoustic-cloak/extensions/vscode'
];

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

function executeBulletproofSync() {
  const sourceDist = findSourceDist();

  if (!sourceDist) {
    console.error('[ERROR] Build failure: /shared-ui-core/dist missing. Compile your UI core first.');
    process.exit(1);
  }

  console.log('[INFO] Deploying spatial UI core across extension suite from: ' + sourceDist);
  let successCount = 0;
  let skippedCount = 0;

  targetExtensions.forEach((extPath) => {
    const resolvedExtPath = path.resolve(repoRoot, extPath);
    const extDistPath = path.join(resolvedExtPath, 'dist');

    if (fs.existsSync(resolvedExtPath)) {
      try {
        if (!fs.existsSync(extDistPath)) {
          fs.mkdirSync(extDistPath, { recursive: true });
        }
        fs.cpSync(sourceDist, extDistPath, { recursive: true });
        console.log(`[SYNCED] Upgraded UI core for: ${path.basename(resolvedExtPath)} (${extPath})`);
        successCount++;
      } catch (err) {
        console.error(`[ERROR] Failed to sync ${path.basename(resolvedExtPath)}:`, err.message);
      }
    } else {
      console.warn(`[SKIPPED] Target directory not found: ${extPath}`);
      skippedCount++;
    }
  });

  console.log(`[COMPLETE] Synchronization complete. Successfully updated ${successCount} modules (Skipped: ${skippedCount}).`);
}

executeBulletproofSync();
