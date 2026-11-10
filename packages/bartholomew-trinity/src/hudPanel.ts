import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ExtensionBridge } from './bridge/extensionBridge';

export class SuiteHudPanel {
  public static currentPanel: SuiteHudPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (SuiteHudPanel.currentPanel) {
      SuiteHudPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'bartholomewSuiteHud',
      'Bartholomew Spatial HUD',
      column || vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'dist'),
          vscode.Uri.joinPath(extensionUri, 'dist', 'assets')
        ]
      }
    );

    SuiteHudPanel.currentPanel = new SuiteHudPanel(panel, extensionUri);
    ExtensionBridge.registerPanel(panel);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._update();
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'executeAttestedHedge':
            vscode.commands.executeCommand('bartholomew.executeAttestedHedge', message.payload?.marketId || 'active-branch', message.payload?.size || 100);
            return;
          case 'openGuard':
            vscode.commands.executeCommand('bartholomew-guard.openDashboard');
            return;
          case 'openTortuga':
            vscode.commands.executeCommand('tortuga.openDashboard');
            return;
          case 'openKyro':
            vscode.commands.executeCommand('kyro.openDashboard');
            return;
          case 'openPromptsmith':
            vscode.commands.executeCommand('promptsmith.openDashboard');
            return;
          case 'openKeystone':
            vscode.commands.executeCommand('keystone.openDashboard');
            return;
        }
      },
      null,
      this._disposables
    );
  }

  private _update() {
    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
  }

  private _getHtmlForWebview(_webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bartholomew Spatial HUD</title>
  <style>
    :root {
      --bg: #070b14;
      --card-bg: rgba(15, 23, 42, 0.75);
      --border: rgba(255, 255, 255, 0.1);
      --cyan: #38bdf8;
      --emerald: #34d399;
      --amber: #fbbf24;
      --red: #f87171;
      --violet: #a78bfa;
      --fg: #f1f5f9;
      --muted: #94a3b8;
      --mono: "JetBrains Mono", Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--fg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 16px;
      overflow-x: hidden;
      user-select: none;
    }

    /* Top HUD Navigation */
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border);
    }
    .hud-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pulse-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: var(--cyan);
      box-shadow: 0 0 12px var(--cyan);
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.85); }
    }
    .hud-title {
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--cyan);
    }
    .hud-meta {
      display: flex;
      gap: 8px;
    }
    .hud-badge {
      font-family: var(--mono);
      font-size: 10px;
      padding: 3px 8px;
      border-radius: 3px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border);
    }
    .badge-live {
      border-color: rgba(52, 211, 153, 0.4);
      color: var(--emerald);
    }

    /* Grid Layout */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
      margin-bottom: 16px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 14px;
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.15s ease;
    }
    .card:hover {
      border-color: rgba(56, 189, 248, 0.4);
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .card-name {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: var(--fg);
    }
    .card-status {
      font-family: var(--mono);
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 2px;
      border: 1px solid var(--border);
    }
    .card-desc {
      font-size: 11px;
      color: var(--muted);
      line-height: 1.45;
      margin-bottom: 14px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      font-family: var(--mono);
      font-size: 11px;
      padding: 6px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .metric-label {
      color: var(--muted);
      font-size: 10px;
    }
    .btn-action {
      display: inline-block;
      width: 100%;
      text-align: center;
      margin-top: 10px;
      padding: 8px 12px;
      background: rgba(56, 189, 248, 0.12);
      color: var(--cyan);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 4px;
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .btn-action:hover {
      background: var(--cyan);
      color: #000000;
    }

    /* Live Activity Terminal Stream */
    .terminal-box {
      background: #030712;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px;
      font-family: var(--mono);
      font-size: 11px;
    }
    .terminal-title {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--muted);
      margin-bottom: 8px;
    }
    .log-list {
      max-height: 160px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .log-item {
      padding: 3px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      justify-content: space-between;
      color: #cbd5e1;
    }
    .log-time {
      color: var(--muted);
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <header>
    <div class="hud-brand">
      <div class="pulse-dot"></div>
      <span class="hud-title">Bartholomew Spatial Mission Control</span>
    </div>
    <div class="hud-meta">
      <span class="hud-badge badge-live">SUITE ONLINE</span>
      <span class="hud-badge" id="clockTicker">--:--:--</span>
    </div>
  </header>

  <div class="grid">
    <!-- Tortuga Card -->
    <div class="card">
      <div>
        <div class="card-head">
          <span class="card-name">Tortuga Risk Markets</span>
          <span class="card-status" style="color:var(--emerald); border-color:var(--emerald);">CLOB 127.0.0.1:8095</span>
        </div>
        <p class="card-desc">Sovereign Bayesian probability markets, sprint work hedging, and continuous posterior drift modeling.</p>
        <div class="metric-row">
          <span class="metric-label">Execution Engine</span>
          <span>Zero-Gas Matcher</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Solvency Proof</span>
          <span style="color:var(--cyan);">ZK-SNARK Attested</span>
        </div>
      </div>
      <div>
        <button class="btn-action" onclick="send('executeAttestedHedge')">Attest & Execute Hedge</button>
        <button class="btn-action" style="background:rgba(255,255,255,0.04); border-color:var(--border); color:var(--fg); margin-top:6px;" onclick="send('openTortuga')">Open Risk Desk</button>
      </div>
    </div>

    <!-- Bartholomew Guard Card -->
    <div class="card">
      <div>
        <div class="card-head">
          <span class="card-name">Bartholomew Guard</span>
          <span class="card-status" style="color:var(--emerald); border-color:var(--emerald);">RING-0 SECURE</span>
        </div>
        <p class="card-desc">Real-time AST linter, prompt injection firewall, and autonomous policy enforcement engine.</p>
        <div class="metric-row">
          <span class="metric-label">Veto Rules</span>
          <span>64 Invariant Gates</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Telemetry Pipe</span>
          <span style="color:var(--cyan);">Coupled to Tortuga</span>
        </div>
      </div>
      <div>
        <button class="btn-action" onclick="send('openGuard')">Open Guard Console</button>
      </div>
    </div>

    <!-- Keystone Card -->
    <div class="card">
      <div>
        <div class="card-head">
          <span class="card-name">Bartholomew Keystone</span>
          <span class="card-status" style="color:var(--violet); border-color:var(--violet);">PASSKEYS ACTIVE</span>
        </div>
        <p class="card-desc">Cryptographically signed agent clearance tokens with HMAC-SHA256 scope validation and spend caps.</p>
        <div class="metric-row">
          <span class="metric-label">Spend Ceiling</span>
          <span>$25.00 Session Limit</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Latency Overhead</span>
          <span style="color:var(--emerald);">&lt; 15 microseconds</span>
        </div>
      </div>
      <div>
        <button class="btn-action" onclick="send('openKeystone')">Manage Passkeys</button>
      </div>
    </div>

    <!-- Kyro Defense Card -->
    <div class="card">
      <div>
        <div class="card-head">
          <span class="card-name">Kyro Photonic Defense</span>
          <span class="card-status" style="color:var(--cyan); border-color:var(--cyan);">&lt;1.0 fJ/MAC</span>
        </div>
        <p class="card-desc">Mach-Zehnder optical computing telemetry, sub-7ms duplex voice intent routing, and acoustic cloak.</p>
        <div class="metric-row">
          <span class="metric-label">Optical Mesh</span>
          <span>4x4 Unitary Matrix</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Acoustic Shield</span>
          <span style="color:var(--emerald);">Active (Zero-Noise)</span>
        </div>
      </div>
      <div>
        <button class="btn-action" onclick="send('openKyro')">Open Photonic Lab</button>
      </div>
    </div>
  </div>

  <!-- Live Activity Audit Stream -->
  <div class="terminal-box">
    <div class="terminal-title">Sovereign Audit & Event Stream</div>
    <div class="log-list" id="eventLogs">
      <div class="log-item">
        <span><span class="log-time">[BOOT]</span> Bartholomew Spatial Mission Control initialized.</span>
        <span style="color:var(--emerald);">READY</span>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function send(command, payload) {
      vscode.postMessage({ command, payload });
    }

    function updateClock() {
      const now = new Date();
      document.getElementById('clockTicker').innerText = now.toTimeString().split(' ')[0] + ' UTC';
    }
    setInterval(updateClock, 1000);
    updateClock();

    window.addEventListener('message', event => {
      const msg = event.data;
      if (!msg) return;

      const logList = document.getElementById('eventLogs');
      const item = document.createElement('div');
      item.className = 'log-item';
      const timeStr = new Date().toTimeString().split(' ')[0];

      if (msg.event === 'HEDGE_CONFIRMED') {
        item.innerHTML = '<span><span class="log-time">[' + timeStr + ']</span> Tortuga Hedge Filled on ' + (msg.payload?.marketId || 'active-branch') + ' (' + (msg.payload?.exchange || 'LOCAL_CLOB') + ')</span><span style="color:var(--cyan);">ZK-CONFIRMED</span>';
      } else {
        item.innerHTML = '<span><span class="log-time">[' + timeStr + ']</span> ' + JSON.stringify(msg) + '</span><span style="color:var(--muted);">OK</span>';
      }
      logList.prepend(item);
    });
  </script>
</body>
</html>`;
  }

  public dispose() {
    SuiteHudPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }
}
