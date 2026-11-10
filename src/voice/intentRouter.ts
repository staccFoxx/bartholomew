import * as vscode from 'vscode';

export class IntentRouter {
  public static parseAndExecute(voiceTranscript: string): boolean {
    const query = voiceTranscript.toLowerCase().trim();

    if (query.includes('isolate security breach') || query.includes('guard') || query.includes('threat radar')) {
      vscode.commands.executeCommand('bartholomew-guard.openDashboard');
      vscode.window.showInformationMessage('JARVIS: Isolating AST threat vectors via Bartholomew Guard.');
      return true;
    } else if (query.includes('spend governor') || query.includes('budget') || query.includes('passkey')) {
      vscode.commands.executeCommand('keystone.openDashboard');
      vscode.window.showInformationMessage('JARVIS: Accessing Keystone spend governance matrix.');
      return true;
    } else if (query.includes('hedge risk') || query.includes('prediction market') || query.includes('tortuga')) {
      vscode.commands.executeCommand('tortuga.openDashboard');
      vscode.window.showInformationMessage('JARVIS: Opening Tortuga sovereign prediction markets.');
      return true;
    } else if (query.includes('optimize prompt') || query.includes('promptsmith')) {
      vscode.commands.executeCommand('promptsmith.openDashboard');
      vscode.window.showInformationMessage('JARVIS: Activating PromptSmith token optimization playground.');
      return true;
    } else if (query.includes('acoustic shield') || query.includes('kyro') || query.includes('telemetry scope')) {
      vscode.commands.executeCommand('kyro.openDashboard');
      vscode.window.showInformationMessage('JARVIS: Deploying Kyro photonic & acoustic telemetry deck.');
      return true;
    } else if (query.includes('deploy trinity')) {
      vscode.window.showInformationMessage('JARVIS: Initializing 3-phase Trinity security runtime.');
      return true;
    } else {
      vscode.window.showWarningMessage(`JARVIS: Intent unrecognized for command: "${voiceTranscript}"`);
      return false;
    }
  }
}
