import * as vscode from 'vscode';

export class ExtensionBridge {
  private static activePanels: Set<vscode.WebviewPanel> = new Set();

  public static registerPanel(panel: vscode.WebviewPanel) {
    this.activePanels.add(panel);
    panel.onDidDispose(() => {
      this.activePanels.delete(panel);
    });
  }

  public static broadcast(command: string, payload?: any) {
    for (const panel of this.activePanels) {
      try {
        panel.webview.postMessage({ command, payload });
      } catch (err) {
        console.error('[ExtensionBridge Error] Failed to postMessage:', err);
      }
    }
  }
}
