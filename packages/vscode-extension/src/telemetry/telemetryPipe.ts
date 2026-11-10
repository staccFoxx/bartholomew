import * as vscode from 'vscode';

export interface SecurityViolationEvent {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  fileUri: string;
  ruleId: string;
  timestamp: number;
}

export class ExtensionTelemetryPipe {
  // Broadcast security telemetry from Bartholomew Guard to Tortuga
  public static async broadcastViolation(violation: SecurityViolationEvent) {
    try {
      // Find Tortuga extension in the active workspace
      const tortugaExt = vscode.extensions.getExtension('Bartholomew.tortuga-markets') ||
                         vscode.extensions.getExtension('bartholomew.tortuga-markets');
      if (!tortugaExt) {
        console.warn('[TelemetryPipe] Tortuga extension not active in workspace.');
        return;
      }

      // Ensure the extension API is activated
      const tortugaApi = tortugaExt.isActive ? tortugaExt.exports : await tortugaExt.activate();
      if (tortugaApi && typeof tortugaApi.handleExternalSecurityEvent === 'function') {
        // Trigger automated hedge or risk recalculation inside Tortuga
        await tortugaApi.handleExternalSecurityEvent(violation);
        vscode.window.showInformationMessage(`[Bartholomew Shield] Critical AST violation broadcasted to Tortuga risk desk.`);
      }
    } catch (err) {
      console.error('[TelemetryPipe Error] Failed to dispatch security event:', err);
    }
  }
}
