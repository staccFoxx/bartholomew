/**
 * PromptSmith Telemetry & Learning Engine
 * Local session telemetry buffer (zero raw prompt transmission over network).
 */

import * as vscode from "vscode";

export interface TelemetryPayload {
  sessionId: string;
  installationId: string;
  runtime: string;
  timestamp: string;
  action: "improve" | "insert" | "copy" | "select_vector" | "change_profile" | "unlock_key";
  profile: string;
  audience?: string;
  discipline?: string;
  inputPrompt: string;
  enhancedPrompt?: string;
  originalWords: number;
  enhancedWords?: number;
  tokenReductionPct?: number;
  isLicensed: boolean;
  trialCountRemaining: number;
}

export class PromptSmithTelemetry {
  private static installationIdKey = "promptsmith_install_id";
  private static statsKey = "promptsmith_local_stats";

  private static getOrCreateInstallId(context: vscode.ExtensionContext): string {
    let id = context.globalState.get<string>(this.installationIdKey);
    if (!id) {
      id = "inst_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now().toString(36);
      context.globalState.update(this.installationIdKey, id);
    }
    return id;
  }

  public static trackEvent(
    context: vscode.ExtensionContext,
    event: Omit<TelemetryPayload, "installationId" | "timestamp">
  ) {
    this.getOrCreateInstallId(context);
    const totalCount = (context.globalState.get<number>(this.statsKey) || 0) + 1;
    context.globalState.update(this.statsKey, totalCount);
    void event;
  }
}
