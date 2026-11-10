declare const require: any;
const fs = require('fs');
const path = require('path');
const os = require('os');
import { KeystoneEngine, KeystonePasskey } from './keystone_passkey';
import { KeystoneDashboardPanel } from './keystone_dashboard_panel';

export interface ExtensionContext {
  subscriptions: { push: (...items: any[]) => void };
}


function getKeystoneLogoBase64(rootPath: string): string {
  const candidates = [
    path.join(__dirname, '..', 'icon.png'),
    path.join(__dirname, '..', 'keystone_logo_1024.png'),
    path.join(__dirname, '..', 'images', 'keystone_128.png'),
    path.join(rootPath, 'packages', 'bartholomew-keystone', 'icon.png'),
    path.join(rootPath, 'images', 'keystone_logo.png')
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) {
        const b64 = fs.readFileSync(c).toString('base64');
        if (b64 && b64.length > 100) {
          return 'data:image/png;base64,' + b64;
        }
      }
    } catch {}
  }
  return '';
}

export function activate(context: ExtensionContext) {
  let vscode: any;
  try {
    vscode = require('vscode');
  } catch {
    return;
  }

  const engine = new KeystoneEngine();

  // 1. Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 105);
  statusBarItem.command = 'keystone.openDashboard';
  statusBarItem.text = `$(key)`;
  statusBarItem.tooltip = `Bartholomew Keystone -- No Active Passkey | Click to Issue Capability Passkey`;
  statusBarItem.color = '#94a3b8';
  context.subscriptions.push(statusBarItem);
  statusBarItem.show();

  function updateStatusBar() {
    const pk = getActivePasskey();
    if (pk) {
      const now = new Date().getTime();
      const expiry = new Date(pk.expires_at).getTime();
      const isExpired = now > expiry;
      const isValid = engine.verifyPasskey(pk);

      if (isExpired) {
        statusBarItem.text = `$(alert)`;
        statusBarItem.tooltip = `Bartholomew Keystone -- Passkey Expired (${pk.agent_id}) | Click to Renew Capability Passkey`;
        statusBarItem.color = '#f59e0b';
      } else if (isValid) {
        const spendLimit = pk.scopes?.budget?.max_spend_usd !== undefined ? `$${pk.scopes.budget.max_spend_usd.toFixed(2)}` : '$25.00';
        statusBarItem.text = `$(key)`;
        statusBarItem.tooltip = `Bartholomew Keystone -- Active Passkey (${pk.agent_id}) with ${spendLimit} Spend Cap | Click to open Dashboard`;
        statusBarItem.color = '#10b981';
      } else {
        statusBarItem.text = `$(shield)`;
        statusBarItem.tooltip = `Bartholomew Keystone -- Passkey Signature Mismatch | Click to Re-issue`;
        statusBarItem.color = '#ef4444';
      }
    } else {
      statusBarItem.text = `$(key)`;
      statusBarItem.tooltip = `Bartholomew Keystone -- No Active Passkey | Click to Issue Capability Passkey`;
      statusBarItem.color = '#94a3b8';
    }
  }

  function getPasskeyPath(): string {
    const rootPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (rootPath) {
      const btpPath = path.join(rootPath, '.btp', 'keystone.json');
      if (fs.existsSync(btpPath)) return btpPath;
      const btpK = path.join(rootPath, '.btp_keystone.json');
      if (fs.existsSync(btpK)) return btpK;
    }
    const homeDir = os.homedir();
    const homeBtp = path.join(homeDir, '.btp', 'keystone.json');
    if (fs.existsSync(homeBtp)) return homeBtp;
    const homeBtpK = path.join(homeDir, '.btp_keystone.json');
    if (fs.existsSync(homeBtpK)) return homeBtpK;
    return rootPath ? path.join(rootPath, '.btp', 'keystone.json') : homeBtp;
  }

  function getActivePasskey(): KeystonePasskey | null {
    try {
      const p = getPasskeyPath();
      if (fs.existsSync(p)) {
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (!data.issued_at && data.created_at) {
          data.issued_at = data.created_at;
        }
        return data;
      }
    } catch {}
    return null;
  }

  updateStatusBar();

  // 2. Command: Issue Agent Capability Passkey
  const issueCmd = vscode.commands.registerCommand('keystone.issuePasskey', async () => {
    const presetChoice = await vscode.window.showQuickPick([
      {
        label: 'Developer Sandbox (Recommended)',
        description: 'Read workspace, write src/ & tests/, safe test commands, $25 ceiling, 2h TTL'
      },
      {
        label: 'Read-Only Auditor',
        description: 'Read-only clearance, no write permissions, no bash execution, $0 ceiling'
      },
      {
        label: 'Custom Autonomous Clearance',
        description: 'Manually configure globs, allowed commands, network domains, and spend limit'
      }
    ], { placeHolder: 'Select a Keystone Capability Clearance Preset' });

    if (!presetChoice) return;

    let agentId = 'agent-worker-01';
    let scopes: any = {};
    let ttl = 120;

    if (presetChoice.label.startsWith('Developer Sandbox')) {
      const inputAgent = await vscode.window.showInputBox({
        prompt: 'Enter Autonomous Agent ID or Name',
        value: 'agent-dev-01'
      });
      if (!inputAgent) return;
      agentId = inputAgent;

      scopes = {
        files: {
          allow_read: ['**/*'],
          allow_write: ['src/**', 'tests/**', 'site/**', 'docs/**'],
          deny: ['.env*', 'secrets*', 'credentials*', 'id_rsa*', 'id_ed25519*', '.git/hooks/**']
        },
        commands: {
          allow_exec: ['npm test', 'npm run build', 'python -m unittest', 'pytest', 'git status', 'git diff', 'cargo check'],
          deny_exec: ['rm', 'curl', 'wget', 'sudo', 'mkfs', 'dd', 'chmod', 'chown'],
          deny_shell_operators: true
        },
        network: {
          allow_domains: ['github.com', 'npmjs.com', 'pypi.org', 'docs.python.org', 'localhost'],
          allow_search: true
        },
        budget: {
          max_spend_usd: 25.00,
          max_per_txn_usd: 10.00
        },
        env: {
          deny_keys: ['KEY', 'SECRET', 'TOKEN', 'AUTH', 'PASSWORD']
        }
      };
    } else if (presetChoice.label.startsWith('Read-Only Auditor')) {
      const inputAgent = await vscode.window.showInputBox({
        prompt: 'Enter Autonomous Agent ID or Name',
        value: 'agent-auditor-01'
      });
      if (!inputAgent) return;
      agentId = inputAgent;

      scopes = {
        files: {
          allow_read: ['**/*'],
          allow_write: [],
          deny: ['.env*', 'secrets*', 'id_rsa*']
        },
        commands: {
          allow_exec: [],
          deny_exec: ['*'],
          deny_shell_operators: true
        },
        network: {
          allow_domains: ['docs.python.org', 'nodejs.org'],
          allow_search: false
        },
        budget: {
          max_spend_usd: 0.00,
          max_per_txn_usd: 0.00
        }
      };
    } else {
      const inputAgent = await vscode.window.showInputBox({
        prompt: 'Enter Autonomous Agent ID or Name',
        value: 'agent-custom-01'
      });
      if (!inputAgent) return;
      agentId = inputAgent;

      const allowedWrite = await vscode.window.showInputBox({
        prompt: 'Allowed File Write Scopes (comma-separated globs)',
        value: 'src/, tests/, site/'
      });

      const maxSpendStr = await vscode.window.showInputBox({
        prompt: 'Max Spend Limit USD ($)',
        value: '50.00'
      });

      const spendUsd = parseFloat(maxSpendStr || '50.00');
      const writeGlobs = (allowedWrite || 'src/').split(',').map((s: string) => s.trim()).filter(Boolean);

      scopes = {
        files: {
          allow_read: ['**/*'],
          allow_write: writeGlobs,
          deny: ['.env', 'secrets', 'credentials.json', 'id_rsa']
        },
        commands: {
          allow_exec: ['npm test', 'npm run build', 'python -m unittest', 'pytest'],
          deny_exec: ['rm', 'curl', 'wget', 'sudo', 'mkfs', 'dd']
        },
        network: {
          allow_domains: ['github.com', 'npmjs.com', 'pypi.org'],
          allow_search: true
        },
        budget: {
          max_spend_usd: spendUsd,
          max_per_txn_usd: 20.00
        }
      };
    }

    const passkey = engine.issuePasskey(agentId, scopes, ttl);
    const savePath = getPasskeyPath();
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(savePath, JSON.stringify(passkey, null, 2), 'utf-8');

    vscode.window.showInformationMessage(
      `Keystone Passkey issued for '${agentId}'! Clearance active for 2 hours.`,
      'Copy Token ID',
      'Open Dashboard'
    ).then((choice: string) => {
      if (choice === 'Copy Token ID') {
        vscode.env.clipboard.writeText(passkey.passkey_id);
      } else if (choice === 'Open Dashboard') {
        vscode.commands.executeCommand('keystone.openDashboard');
      }
    });

    statusBarItem.text = `$(key)`;
  });

  // 3. Command: Inspect Active Agent Clearance
  const inspectCmd = vscode.commands.registerCommand('keystone.inspectClearance', () => {
    vscode.commands.executeCommand('keystone.openDashboard');
  });

  // 4. Command: Revoke Agent Passkey
  const revokeCmd = vscode.commands.registerCommand('keystone.revokePasskey', () => {
    const p = getPasskeyPath();
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      vscode.window.showInformationMessage('Keystone Passkey revoked. Agent privileges stripped.');
      statusBarItem.text = `$(key)`;
    }
  });

  // 5. Command: Validate Agent Action against Passkey
  const validateCmd = vscode.commands.registerCommand('keystone.validateAction', async () => {
    const passkey = getActivePasskey();
    if (!passkey) {
      vscode.window.showErrorMessage('Cannot validate action: No active Keystone Passkey.');
      return;
    }

    const testCmd = await vscode.window.showInputBox({
      prompt: 'Enter command or file target to test against passkey clearance',
      value: 'rm -rf /'
    });
    if (!testCmd) return;

    const res = engine.evaluateAction(passkey, 'COMMAND_EXEC', testCmd);
    if (res.verdict === 'ALLOW') {
      vscode.window.showInformationMessage(`[CLEARANCE GRANTED] Action permitted (${res.latency_us}us). Receipt: ${res.receipt_hash}`);
    } else {
      vscode.window.showErrorMessage(`[OUT OF SCOPE] Blocked: ${res.reason} (${res.latency_us}us). Receipt: ${res.receipt_hash}`);
    }
  });

  // 6. Command: Audit Receipts
  const auditCmd = vscode.commands.registerCommand('keystone.auditReceipts', () => {
    const receipts = engine.getReceiptHistory();
    if (receipts.length === 0) {
      vscode.window.showInformationMessage('No actions evaluated yet. Audit receipt log is empty.');
      return;
    }
    const summary = receipts.slice(0, 5).map(r => `[${r.verdict}] ${r.action_type}: ${r.target} (${r.receipt_hash})`).join('\n');
    vscode.window.showInformationMessage(`Recent Keystone Clearance Receipts:\n\n${summary}`);
  });

  // 7. Command: Open Keystone Passkey Dashboard Webview (Spend Governor HUD)
  const dashboardCmd = vscode.commands.registerCommand('keystone.openDashboard', () => {
    KeystoneDashboardPanel.createOrShow(context.extensionUri, getActivePasskey, engine);
  });

  context.subscriptions.push(issueCmd, inspectCmd, revokeCmd, validateCmd, auditCmd, dashboardCmd);
}

export function deactivate() {}
