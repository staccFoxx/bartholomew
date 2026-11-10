import * as vscode from 'vscode';

export class ExtensionBridge {
  private static activePanel: vscode.WebviewPanel | undefined;

  public static setPanel(panel: vscode.WebviewPanel) {
    this.activePanel = panel;
  }

  // Push data (e.g., live security telemetry & AST violations) down to the Svelte UI
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
          case 'applyQuickFix': {
            const targetFile = message.payload?.file || message.file;
            vscode.window.showInformationMessage(`Bartholomew Guard: Applying AST fix for ${targetFile || 'buffer'}`);
            break;
          }

          case 'navigateToCode': {
            const file = message.payload?.file || message.file;
            const line = message.payload?.line ?? message.line ?? 0;
            if (file) {
              try {
                const doc = await vscode.workspace.openTextDocument(file);
                const editor = await vscode.window.showTextDocument(doc);
                const pos = new vscode.Position(Math.max(0, line - 1), 0);
                editor.selection = new vscode.Selection(pos, pos);
                editor.revealRange(new vscode.Range(pos, pos));
              } catch (e) {
                vscode.window.showWarningMessage(`Bartholomew Guard: Could not open file ${file}`);
              }
            }
            break;
          }
        }
      },
      null,
      context.subscriptions
    );
  }
}
