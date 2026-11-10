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

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const distPath = path.join(this._extensionUri.fsPath, 'dist', 'assets');
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'index.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'index.css'));

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bartholomew Spatial HUD</title>
  <link rel="stylesheet" href="${styleUri}">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #070b14;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
      overflow-x: hidden;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="${scriptUri}"></script>
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
