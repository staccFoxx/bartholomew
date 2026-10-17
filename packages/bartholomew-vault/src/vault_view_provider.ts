import * as vscode from 'vscode';
import { VaultEngine } from './vault_engine';

export class VaultViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'vault.dashboardView';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _vaultEngine: VaultEngine,
    private readonly _getTotalVaulted: () => number
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case 'tokenizeSelection':
          await vscode.commands.executeCommand('vault.tokenizeSelection');
          this.refresh();
          break;
        case 'detokenizeSelection':
          await vscode.commands.executeCommand('vault.detokenizeSelection');
          this.refresh();
          break;
        case 'tokenizeClipboard':
          await vscode.commands.executeCommand('vault.tokenizeClipboard');
          this.refresh();
          break;
        case 'auditMcp':
          await vscode.commands.executeCommand('vault.auditMcpServers');
          this.refresh();
          break;
        case 'exportCompliance':
          await vscode.commands.executeCommand('vault.exportComplianceReport');
          break;
        case 'clearVault':
          await vscode.commands.executeCommand('vault.clearVault');
          this.refresh();
          break;
      }
    });

    this.refresh();
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview();
    }
  }

  private _getHtmlForWebview(): string {
    const totalVaulted = this._getTotalVaulted();
    const activeSurrogates = this._vaultEngine.getActiveSurrogateSummary();

    const surrogatesListHtml = activeSurrogates.length === 0
      ? '<div style="color:var(--vscode-descriptionForeground, #475569); font-size:11px; text-align:center; padding:12px 0; font-weight:600;">No active surrogate tokens in RAM enclave.</div>'
      : activeSurrogates.map(s => `
        <div style="background:var(--vscode-editor-inactiveSelectionBackground, rgba(15,23,42,0.06)); border:1px solid var(--vscode-focusBorder, #0284c7); border-radius:6px; padding:6px 8px; margin-bottom:6px; font-family:var(--vscode-editor-font-family, monospace); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--vscode-textLink-foreground, #0369a1); font-weight:700;">${s.category}</span>
            <span style="color:var(--vscode-testing-iconPassed, #059669); font-size:10px; font-weight:700;">ENCLAVE RESIDENT</span>
          </div>
          <div style="color:var(--vscode-foreground, var(--vscode-editor-foreground, #0f172a)); font-weight:700; margin-top:2px;">${s.surrogate}</div>
          <div style="color:var(--vscode-descriptionForeground, #334155); font-size:10px; margin-top:1px; font-weight:600;">Masked: ${s.preview}</div>
        </div>
      `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      background-color: var(--vscode-sideBar-background, var(--vscode-editor-background, #ffffff));
      color: var(--vscode-foreground, var(--vscode-editor-foreground, #0f172a));
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      padding: 12px;
      margin: 0;
      line-height: 1.4;
    }
    .vault-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 14px 8px;
      background: var(--vscode-editor-inactiveSelectionBackground, rgba(2, 132, 199, 0.08));
      border: 1px solid var(--vscode-focusBorder, #0284c7);
      border-radius: 10px;
      margin-bottom: 14px;
    }
    .vault-emblem-svg {
      width: 52px;
      height: 52px;
      margin-bottom: 8px;
      color: var(--vscode-textLink-foreground, #0284c7);
      filter: drop-shadow(0 0 6px rgba(2, 132, 199, 0.4));
    }
    .vault-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--vscode-foreground, var(--vscode-sideBarTitle-foreground, #0f172a));
      text-transform: uppercase;
    }
    .vault-sub {
      font-size: 11px;
      color: var(--vscode-descriptionForeground, #334155);
      font-weight: 600;
      margin-top: 2px;
    }
    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      margin-top: 8px;
      padding: 4px 10px;
      background: var(--vscode-badge-background, rgba(16, 185, 129, 0.15));
      border: 1px solid var(--vscode-testing-iconPassed, #059669);
      border-radius: 4px;
      color: var(--vscode-badge-foreground, #065f46);
      font-size: 10px;
      font-weight: 800;
      font-family: var(--vscode-editor-font-family, monospace);
    }
    .btn-action {
      width: 100%;
      background: var(--vscode-button-secondaryBackground, #e2e8f0);
      border: 1px solid var(--vscode-button-border, #94a3b8);
      color: var(--vscode-button-secondaryForeground, #0f172a);
      font-size: 11px;
      font-weight: 700;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      transition: all 0.15s ease;
    }
    .btn-action:hover {
      background: var(--vscode-button-background, #0284c7);
      border-color: var(--vscode-focusBorder, #0284c7);
      color: var(--vscode-button-foreground, #ffffff);
    }
    .section-header {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--vscode-sideBarSectionHeader-foreground, var(--vscode-foreground, #0f172a));
      margin: 12px 0 6px 2px;
    }
  </style>
</head>
<body>
  <div class="vault-hero">
    <!-- Precision Vector Cybernetic Vault Logo with Adaptive Theme Contrast -->
    <svg class="vault-emblem-svg" viewBox="0 0 36 36" fill="none">
      <polygon points="18,3 32,11 32,25 18,33 4,25 4,11" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="currentColor" fill-opacity="0.12"/>
      <circle cx="18" cy="18" r="10.5" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 1.5"/>
      <rect x="16.5" y="6" width="3" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="16.5" y="27.5" width="3" height="2.5" rx="0.5" fill="currentColor"/>
      <rect x="6" y="16.5" width="2.5" height="3" rx="0.5" fill="currentColor"/>
      <rect x="27.5" y="16.5" width="2.5" height="3" rx="0.5" fill="currentColor"/>
      <path d="M5 13.5H9.5V15.5H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M5 20.5H9.5V22.5H5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      <circle cx="18" cy="18" r="7.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M18 13.2C16.45 13.2 15.2 14.45 15.2 16C15.2 17.15 15.9 18.15 16.3 18.7L15.6 22.8H20.4L19.7 18.7C20.1 18.15 20.8 17.15 20.8 16C20.8 14.45 19.55 13.2 18 13.2Z" fill="currentColor"/>
    </svg>
    <div class="vault-title">Bartholomew Vault</div>
    <div class="vault-sub">In-Process PII &amp; Secret Tokenizer</div>
    <div class="stat-badge">
      <span>LATENCY: &lt;35µs</span> &bull; <span>${totalVaulted} VAULTED</span>
    </div>
  </div>

  <div class="section-header">Fast Actions</div>
  <button class="btn-action" onclick="sendMsg('tokenizeSelection')">
    <span>Tokenize Editor Selection / Buffer</span>
  </button>
  <button class="btn-action" onclick="sendMsg('detokenizeSelection')">
    <span>Detokenize Active Selection (JIT)</span>
  </button>
  <button class="btn-action" onclick="sendMsg('tokenizeClipboard')">
    <span>Tokenize Host Clipboard</span>
  </button>
  <button class="btn-action" onclick="sendMsg('auditMcp')">
    <span>Audit Workspace MCP Tool Servers</span>
  </button>
  <button class="btn-action" onclick="sendMsg('exportCompliance')">
    <span>Export Compliance Dossier (SOC 2)</span>
  </button>

  <div class="section-header">Active In-Memory Surrogates (${activeSurrogates.length})</div>
  ${surrogatesListHtml}

  <script>
    const vscode = acquireVsCodeApi();
    function sendMsg(cmd) {
      vscode.postMessage({ command: cmd });
    }
  </script>
</body>
</html>`;
  }
}
