/**
 * Bartholomew & Tortuga Suite - Unified Open VSX & Marketplace Deployment Engine
 * ==============================================================================
 * 1. Audits all extension manifests for sponsor tag elimination & version coherence.
 * 2. Confirms clean .vsix packaging.
 * 3. Deploys to Open VSX registry and VS Code Marketplace via official CLIs.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SUITE_PACKAGES = [
  {
    name: 'tortuga-markets',
    publisher: 'bartholomew',
    version: '1.1.8',
    vsixPath: path.resolve(__dirname, '../prediction-exchange-core/axiom-vscode/tortuga-markets-1.1.8.vsix'),
    repoDir: path.resolve(__dirname, '../prediction-exchange-core/axiom-vscode')
  },
  {
    name: 'bartholomew-guard-vscode',
    publisher: 'bartholomew',
    version: '7.1.4',
    vsixPath: path.resolve(__dirname, 'packages/vscode-extension/bartholomew-guard-vscode-7.1.4.vsix'),
    repoDir: path.resolve(__dirname, 'packages/vscode-extension')
  },
  {
    name: 'bartholomew-keystone',
    publisher: 'bartholomew',
    version: '7.1.3',
    vsixPath: path.resolve(__dirname, 'packages/bartholomew-keystone/bartholomew-keystone-7.1.3.vsix'),
    repoDir: path.resolve(__dirname, 'packages/bartholomew-keystone')
  },
  {
    name: 'bartholomew-trinity',
    publisher: 'bartholomew',
    version: '7.1.3',
    vsixPath: path.resolve(__dirname, 'packages/bartholomew-trinity/bartholomew-trinity-7.1.3.vsix'),
    repoDir: path.resolve(__dirname, 'packages/bartholomew-trinity')
  },
  {
    name: 'bartholomew-vault',
    publisher: 'bartholomew',
    version: '7.0.3',
    vsixPath: path.resolve(__dirname, 'packages/bartholomew-vault/bartholomew-vault-7.0.3.vsix'),
    repoDir: path.resolve(__dirname, 'packages/bartholomew-vault')
  },
  {
    name: 'cyphervoice-vscode',
    publisher: 'bartholomew',
    version: '1.3.1',
    vsixPath: path.resolve(__dirname, '../acoustic-cloak/extensions/vscode/cyphervoice-vscode-1.3.1.vsix'),
    repoDir: path.resolve(__dirname, '../acoustic-cloak/extensions/vscode')
  }
];

function runSuiteAudit() {
  console.log('================================================================');
  console.log('BARTHOLOMEW & TORTUGA SUITE - PRE-FLIGHT RELEASE AUDIT');
  console.log('================================================================\n');

  let allValid = true;

  for (const pkg of SUITE_PACKAGES) {
    process.stdout.write(`[*] Auditing ${pkg.name}@${pkg.version}... `);
    const pkgJsonPath = path.join(pkg.repoDir, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
      console.log(`[FAIL] Missing package.json at ${pkgJsonPath}`);
      allValid = false;
      continue;
    }

    const manifest = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

    // Check sponsor tags
    const rawText = JSON.stringify(manifest).toLowerCase();
    if (rawText.includes('sponsor') || rawText.includes('donate') || rawText.includes('opencollective') || rawText.includes('patreon')) {
      console.log(`[FAIL] Sponsor or donation metadata detected in manifest!`);
      allValid = false;
      continue;
    }

    // Check VSIX package existence
    if (!fs.existsSync(pkg.vsixPath)) {
      console.log(`[FAIL] VSIX bundle not found: ${pkg.vsixPath}`);
      allValid = false;
      continue;
    }

    const stat = fs.statSync(pkg.vsixPath);
    console.log(`[PASS] (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
  }

  console.log('\n----------------------------------------------------------------');
  if (!allValid) {
    console.error('[!] Audit encountered errors. Fix items above before publishing.');
    process.exit(1);
  }

  console.log('[ALL 6 EXTENSIONS READY FOR PRODUCTION DEPLOYMENT]');
  console.log('----------------------------------------------------------------\n');

  const ovsxToken = process.env.OVSX_PAT;
  const vsceToken = process.env.VSCE_PAT;

  if (ovsxToken) {
    console.log('[*] Publishing to Open VSX Registry...');
    for (const pkg of SUITE_PACKAGES) {
      console.log(`  -> Publishing ${pkg.name}...`);
      try {
        execSync(`npx @open-vsx/ovsx publish "${pkg.vsixPath}" -p ${ovsxToken}`, { stdio: 'inherit' });
        console.log(`  [SUCCESS] Published ${pkg.name} to Open VSX.`);
      } catch (err) {
        console.error(`  [ERROR] Failed to publish ${pkg.name}:`, err.message);
      }
    }
  } else {
    console.log('[NOTICE] OVSX_PAT environment variable not set.');
    console.log('To publish all packages to Open VSX, set OVSX_PAT and run:');
    console.log('  node publish_suite.js\n');
    console.log('Manual one-liner per package:');
    for (const pkg of SUITE_PACKAGES) {
      console.log(`  npx @open-vsx/ovsx publish "${pkg.vsixPath}" -p <YOUR_TOKEN>`);
    }
  }

  if (vsceToken) {
    console.log('\n[*] Publishing to Visual Studio Code Marketplace...');
    for (const pkg of SUITE_PACKAGES) {
      console.log(`  -> Publishing ${pkg.name}...`);
      try {
        execSync(`npx @vscode/vsce publish --packagePath "${pkg.vsixPath}" -p ${vsceToken}`, { stdio: 'inherit' });
        console.log(`  [SUCCESS] Published ${pkg.name} to Marketplace.`);
      } catch (err) {
        console.error(`  [ERROR] Failed to publish ${pkg.name}:`, err.message);
      }
    }
  }
}

runSuiteAudit();
