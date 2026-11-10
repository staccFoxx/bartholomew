import * as vscode from 'vscode';

export class ExtensionBridge {
  private static activePanel: vscode.WebviewPanel | undefined;

  public static setPanel(panel: vscode.WebviewPanel) {
    this.activePanel = panel;
  }

  // Push data (e.g., live prompt optimization metrics) down to the Svelte UI
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
          case 'injectOptimizedPrompt': {
            const text = message.payload?.text || message.text || '';
            const editor = vscode.window.activeTextEditor;
            if (editor) {
              const targetRange = editor.selection.isEmpty
                ? new vscode.Range(editor.selection.active, editor.selection.active)
                : editor.selection;

              const edit = new vscode.WorkspaceEdit();
              edit.replace(editor.document.uri, targetRange, text);
              await vscode.workspace.applyEdit(edit);
              vscode.window.showInformationMessage('[PromptSmith] Injected compiled prompt into active buffer.');
            } else {
              await vscode.env.clipboard.writeText(text);
              vscode.window.showInformationMessage('[PromptSmith] No active editor found. Copied compiled prompt to clipboard.');
            }
            break;
          }

          case 'copyToClipboard': {
            const text = message.payload?.text || message.text || '';
            await vscode.env.clipboard.writeText(text);
            vscode.window.showInformationMessage('[PromptSmith] Copied compiled prompt to clipboard.');
            break;
          }
        }
      },
      null,
      context.subscriptions
    );
  }
}
