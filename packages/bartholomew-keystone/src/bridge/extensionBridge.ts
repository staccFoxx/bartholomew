import * as vscode from 'vscode';

export class ExtensionBridge {
  private static activePanel: vscode.WebviewPanel | undefined;

  public static setPanel(panel: vscode.WebviewPanel) {
    this.activePanel = panel;
  }

  // Push data (e.g., live budget burns, capability states) down to the Svelte UI
  public static sendToUI(command: string, payload: any) {
    if (this.activePanel) {
      this.activePanel.webview.postMessage({ command, payload });
    }
  }

  // Listen for actions triggered from the Svelte UI buttons
  public static registerMessageHandlers(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this.activePanel = panel;

    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'authorizePasskey': {
            const scope = message.payload?.scope || message.scope || 'all';
            vscode.window.showInformationMessage(`Keystone: Signing passkey scope: ${scope}`);
            this.sendToUI('PASSKEY_AUTHORIZED', { scope, timestamp: Date.now() });
            break;
          }

          case 'revokePasskey': {
            vscode.window.showWarningMessage('Keystone: Active passkey revoked across all agents.');
            this.sendToUI('PASSKEY_REVOKED', { timestamp: Date.now() });
            break;
          }

          case 'grantRequest': {
            const id = message.payload?.id || message.id;
            vscode.window.showInformationMessage(`Keystone: Granted capability request ${id}`);
            this.sendToUI('REQUEST_RESOLVED', { id, verdict: 'GRANTED' });
            break;
          }

          case 'denyRequest': {
            const id = message.payload?.id || message.id;
            vscode.window.showInformationMessage(`Keystone: Denied capability request ${id}`);
            this.sendToUI('REQUEST_RESOLVED', { id, verdict: 'DENIED' });
            break;
          }
        }
      },
      null,
      context.subscriptions
    );
  }
}
