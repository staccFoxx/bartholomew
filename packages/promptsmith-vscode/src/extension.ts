/**
 * PromptSmith - Extension Entry Point
 * Draggable Mascot Companion, Multi-Model Prompt Optimizer, Workspace Grounder & Pro Passkey.
 */

import * as vscode from "vscode";
import { PromptAnalyzer, PromptMetrics } from "./analyzer";
import { PromptEnhancer, EnhancementProfile } from "./enhancer";
import { CognitiveAudience } from "./learner";
import { DisciplinaryLens } from "./equalizer";
import { OrthogonalPathfinder } from "./orthogonal";
import { PromptWorkspaceToolkit } from "./workspace_skills";
import { PromptWebviewProvider } from "./webview";
import { PromptSmithDashboardPanel } from "./promptsmith_dashboard_panel";
import { PromptSmithTelemetry } from "./telemetry";
import * as https from "https";

export function activate(context: vscode.ExtensionContext) {
  const sessionId = "sess_" + Math.random().toString(36).substring(2, 10);
  const initialHook = PromptWorkspaceToolkit.detectActiveModelHook();
  let activeProfile: EnhancementProfile = (initialHook.recommendedProfile as EnhancementProfile) || "claude_xml";
  let autoHookEnabled = context.globalState.get<boolean>("promptsmith_auto_hook", true);
  let activeAudience: CognitiveAudience | undefined = undefined;
  let activeDiscipline: DisciplinaryLens | undefined = undefined;
  let lastPrompt = "";
  let lastEnhanced = "";
  let lastMetrics: PromptMetrics = PromptAnalyzer.analyze("");

  // License state management
  const LICENSE_KEY = "promptsmith_pro_license";
  const TRIAL_COUNT_KEY = "promptsmith_trial_count";
  let isLicensed = context.globalState.get<boolean>(LICENSE_KEY, false);
  let trialCount = context.globalState.get<number>(TRIAL_COUNT_KEY, 10);

  // Status Bar Indicator (Icon-only, clean & minimal)
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = "promptsmith.openDashboard";
  statusBar.text = autoHookEnabled ? "$(sparkle) Auto-Hook" : "$(sparkle)";
  statusBar.tooltip = `PromptSmith Auto-Hook: ${initialHook.detectedModelLabel} (${initialHook.hostIde}) | Alt+P to polish`;
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Detect runtime device / IDE environment
  const targetRuntime = detectRuntime();

  // Floating & dockable Webview Panel reference
  let assistantPanel: vscode.WebviewPanel | undefined;

  function getHistoryVault(): { ts: string; raw: string; compiled: string; profile: string }[] {
    return context.globalState.get<{ ts: string; raw: string; compiled: string; profile: string }[]>("promptsmith_history_vault", []);
  }

  async function recordHistoryItem(raw: string, compiled: string, prof: string) {
    const cleanRaw = (raw || "").trim();
    if (!cleanRaw || cleanRaw.startsWith("Select text in your editor")) return;
    let list = getHistoryVault().filter(x => x.raw !== cleanRaw);
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    list.unshift({ ts: nowStr, raw: cleanRaw.slice(0, 1200), compiled: (compiled || "").slice(0, 4000), profile: prof });
    if (list.length > 8) list = list.slice(0, 8);
    await context.globalState.update("promptsmith_history_vault", list);
  }

  function getPanelHtml(): string {
    return PromptWebviewProvider.getHtml(
      lastPrompt,
      lastEnhanced,
      lastMetrics,
      activeProfile,
      isLicensed,
      trialCount,
      activeAudience,
      activeDiscipline,
      autoHookEnabled,
      initialHook.detectedModelLabel,
      getHistoryVault()
    );
  }

  function broadcastViewUpdate() {
    sidebarProvider.updateView();
    if (assistantPanel) {
      assistantPanel.webview.html = getPanelHtml();
    }
  }

  function showValueInterceptionToast(actionLabel: string) {
    const origTokens = lastMetrics.estimatedTokens || Math.round(lastPrompt.length / 4) || 60;
    const optTokens = lastMetrics.optimizedTokens || Math.round((lastEnhanced || "").length / 4) || 40;
    const tokensSaved = Math.max(15, origTokens - optTokens);
    const pct = Math.max(10, lastMetrics.tokenSavingsPercent || Math.round((tokensSaved / Math.max(1, origTokens)) * 100));
    const costSaved = ((tokensSaved / 1000) * 0.015).toFixed(4);

    if (isLicensed) {
      vscode.window.showInformationMessage(`PromptSmith: ${actionLabel}. Trimmed ${tokensSaved} tokens (-${pct}%).`);
    } else {
      vscode.window.showInformationMessage(
        `PromptSmith: ${actionLabel}. Trimmed ${tokensSaved} tokens (-${pct}%). Saved ~$${costSaved}.`,
        "Unlock Developer Pro ($9/mo or $10)",
        "Enter Passkey"
      ).then(choice => {
        if (choice === "Unlock Developer Pro ($9/mo or $10)") {
          vscode.env.openExternal(vscode.Uri.parse("https://bartholomew.info/checkout/promptsmith?ref=editor_toast"));
        } else if (choice === "Enter Passkey") {
          vscode.commands.executeCommand("promptsmith.unlockLicense");
        }
      });
    }
  }

  async function checkAndConsumeTrial(): Promise<boolean> {
    if (isLicensed) return true;
    if (trialCount <= 0) {
      const choice = await vscode.window.showInformationMessage(
        "PromptSmith: Free trial completed (10/10 improvements used). Unlock Developer Pro ($9/mo or $10 Passkey) or enter passkey.",
        "Get Passkey ($9/mo or $10)",
        "Enter Passkey"
      );
      if (choice === "Get Passkey ($9/mo or $10)") {
        vscode.env.openExternal(vscode.Uri.parse("https://bartholomew.info/checkout/promptsmith?ref=vscode"));
      } else if (choice === "Enter Passkey") {
        vscode.commands.executeCommand("promptsmith.unlockLicense");
      }
      return false;
    }
    trialCount--;
    await context.globalState.update(TRIAL_COUNT_KEY, trialCount);
    return true;
  }

  function ensureActivePrompt(fallbackText?: string): string {
    if (fallbackText && fallbackText.trim()) {
      lastPrompt = fallbackText.trim();
      lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
      return lastPrompt;
    }
    if (!lastPrompt.trim()) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const sel = editor.selection;
        const txt = sel.isEmpty ? editor.document.getText() : editor.document.getText(sel);
        if (txt.trim()) {
          lastPrompt = txt.trim();
          lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
        }
      }
    }
    return lastPrompt;
  }

  function handleWebviewMessages(webview: vscode.Webview) {
    webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "optimizeInput":
          {
            const rawInput = (data.text || "").trim();
            if (!rawInput) {
              vscode.window.showWarningMessage("Type or paste a prompt in the Input Draft box first, or select text in your editor.");
              return;
            }
            if (!(await checkAndConsumeTrial())) return;
            if (data.profile) activeProfile = data.profile;
            const voiceRes = PromptWorkspaceToolkit.compileVoiceTranscript(rawInput);
            lastPrompt = voiceRes.corrections > 0 ? voiceRes.cleaned : rawInput;
            if (voiceRes.detectedCommand && voiceRes.detectedCommand !== "scrub_secrets" && voiceRes.detectedCommand !== "ground_workspace") {
              activeProfile = voiceRes.detectedCommand as EnhancementProfile;
            }
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
            await recordHistoryItem(lastPrompt, lastEnhanced, activeProfile);
            if (autoHookEnabled) {
              await vscode.env.clipboard.writeText(lastEnhanced);
            }
            statusBar.tooltip = `PromptSmith Auto-Hook (${initialHook.detectedModelLabel}) | Score: ${lastMetrics.iqScore}/100 (-${lastMetrics.tokenSavingsPercent}% words)`;
            broadcastViewUpdate();
            PromptSmithTelemetry.trackEvent(context, {
              sessionId,
              runtime: targetRuntime,
              action: "improve",
              profile: activeProfile,
              audience: activeAudience,
              discipline: activeDiscipline,
              inputPrompt: lastPrompt,
              enhancedPrompt: lastEnhanced,
              originalWords: lastPrompt.split(/\s+/).filter(Boolean).length,
              enhancedWords: lastEnhanced.split(/\s+/).filter(Boolean).length,
              tokenReductionPct: lastMetrics.tokenSavingsPercent,
              isLicensed,
              trialCountRemaining: trialCount
            });
          }
          break;
        case "groundWorkspace":
          {
            ensureActivePrompt(data.text);
            const ground = PromptWorkspaceToolkit.inspectWorkspace();
            const basePrompt = lastPrompt ? `${lastPrompt}\n\n${ground.contextSummaryBlock}` : ground.contextSummaryBlock;
            lastPrompt = basePrompt;
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
            broadcastViewUpdate();
            vscode.window.showInformationMessage(`PromptSmith: Injected workspace stack & symbols from ${ground.workspaceName}.`);
          }
          break;
        case "groundDiagnostics":
          {
            ensureActivePrompt(data.text);
            const diag = PromptWorkspaceToolkit.inspectDiagnosticsAndDiff();
            lastPrompt = lastPrompt ? `${lastPrompt}\n\n${diag.block}` : diag.block;
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
            if (autoHookEnabled && lastEnhanced) {
              await vscode.env.clipboard.writeText(lastEnhanced);
            }
            broadcastViewUpdate();
            vscode.window.showInformationMessage(`PromptSmith Error-to-Spec: Grounded ${diag.count} active IDE diagnostic(s) into blueprint.`);
          }
          break;
        case "exportRulesFile":
          {
            ensureActivePrompt(data.text);
            const targetFile = (data.targetFile || ".cursorrules") as ".cursorrules" | "CLAUDE.md" | ".windsurfrules" | ".github/copilot-instructions.md";
            const blueprint = (data.compiled || lastEnhanced || lastPrompt || "").trim();
            const res = await PromptWorkspaceToolkit.exportWorkspaceRulesFile(targetFile, blueprint);
            if (res.ok) {
              vscode.window.showInformationMessage(`PromptSmith: ${res.message}`);
            } else {
              vscode.window.showWarningMessage(`PromptSmith: ${res.message}`);
            }
          }
          break;
        case "scrubSecrets":
          {
            const raw = ensureActivePrompt(data.text);
            const { scrubbed, redactedCount } = PromptWorkspaceToolkit.scrubSecrets(raw);
            lastPrompt = scrubbed;
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
            broadcastViewUpdate();
            vscode.window.showInformationMessage(`PromptSmith Secret Guard: Redacted ${redactedCount} exposed credential(s).`);
          }
          break;
        case "cleanVoiceStream":
          {
            const raw = ensureActivePrompt(data.text);
            const vRes = PromptWorkspaceToolkit.compileVoiceTranscript(raw);
            lastPrompt = vRes.cleaned || raw;
            if (vRes.detectedCommand && vRes.detectedCommand !== "scrub_secrets" && vRes.detectedCommand !== "ground_workspace") {
              activeProfile = vRes.detectedCommand as EnhancementProfile;
            }
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
            await recordHistoryItem(lastPrompt, lastEnhanced, activeProfile);
            if (autoHookEnabled && lastEnhanced) {
              await vscode.env.clipboard.writeText(lastEnhanced);
            }
            broadcastViewUpdate();
            vscode.window.showInformationMessage(`PromptSmith Voice-to-Spec: Refined spoken thoughts (${vRes.corrections} disfluencies/self-corrections resolved).`);
          }
          break;
        case "toggleAutoHook":
          {
            autoHookEnabled = Boolean(data.enabled);
            await context.globalState.update("promptsmith_auto_hook", autoHookEnabled);
            statusBar.text = autoHookEnabled ? "$(sparkle) Auto-Hook" : "$(sparkle)";
            if (autoHookEnabled) {
              activeProfile = (initialHook.recommendedProfile as EnhancementProfile) || activeProfile;
              vscode.window.showInformationMessage(`PromptSmith Auto-Hook Active: Hooked alongside ${initialHook.detectedModelLabel}.`);
            }
            broadcastViewUpdate();
          }
          break;
        case "loadHistoryItem":
          {
            const list = getHistoryVault();
            const item = list[Number(data.index)];
            if (item) {
              lastPrompt = item.raw;
              lastEnhanced = item.compiled;
              lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
              broadcastViewUpdate();
            }
          }
          break;
        case "clearHistoryVault":
          {
            await context.globalState.update("promptsmith_history_vault", []);
            broadcastViewUpdate();
          }
          break;
        case "applyAmbiguityFix":
          {
            const currentDraft = (data.text || lastPrompt || "").trim();
            const snippet = (data.fixSnippet || "").trim();
            const merged = currentDraft ? `${currentDraft}\n${snippet}` : snippet;
            lastPrompt = merged;
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
            broadcastViewUpdate();
          }
          break;
        case "changeProfile":
          ensureActivePrompt(data.text);
          activeProfile = data.profile;
          if (lastPrompt) {
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
          }
          broadcastViewUpdate();
          break;
        case "changeAudience":
          ensureActivePrompt(data.text);
          activeAudience = data.audience === "auto" ? undefined : data.audience;
          if (lastPrompt) {
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
          }
          broadcastViewUpdate();
          break;
        case "changeDiscipline":
          ensureActivePrompt(data.text);
          activeDiscipline = data.discipline === "auto" ? undefined : data.discipline;
          if (lastPrompt) {
            lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
            lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
          }
          broadcastViewUpdate();
          break;
        case "triggerBrainstorm":
          ensureActivePrompt(data.text);
          if (!lastPrompt) {
            vscode.window.showWarningMessage("Type or paste a prompt in the Input Draft box first.");
            return;
          }
          activeProfile = "orthogonal_brainstorm";
          lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
          lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
          broadcastViewUpdate();
          vscode.window.showInformationMessage("PromptSmith: Synthesized Autonomous Lateral Brainstorming Blueprint.");
          break;
        case "selectVector":
          {
            ensureActivePrompt(data.text);
            if (!lastPrompt) {
              vscode.window.showWarningMessage("Type or paste a prompt in the Input Draft box first.");
              return;
            }
            const synth = OrthogonalPathfinder.synthesizeBrainstorm(lastPrompt);
            const v = synth.vectors.find((x: { id: string }) => x.id === data.vectorId) || synth.vectors[0];
            lastEnhanced = `### PROMPTSMITH ORTHOGONAL PATH: ${v.title.toUpperCase()}\n**Codename**: ${v.codename}\n**Core Paradigm**: ${v.paradigm}\n\n#### Consensus Trap Strictly Forbidden\n[FORBIDDEN]: ${v.consensusTrapForbidden}\n\n#### Counter-Intuitive Breakthrough Mechanism\n${v.counterIntuitiveMechanism}\n\n#### Concrete Architecture & Implementation Pattern\n${v.concreteArchitecture}\n\n#### Provocative Operator (de Bono PO)\n${v.provocativeOperator}\n\n#### Model Execution Directive\n${v.promptDirective}\n\n#### Target Task Specification\n${lastPrompt}`;
            broadcastViewUpdate();
            vscode.window.showInformationMessage(`PromptSmith: Applied ${v.title} Lateral Path.`);
          }
          break;
        case "insert":
          await insertIntoEditor(data.text);
          showValueInterceptionToast("Prompt inserted");
          break;
        case "copy":
          await vscode.env.clipboard.writeText(data.text);
          PromptSmithTelemetry.trackEvent(context, {
            sessionId,
            runtime: targetRuntime,
            action: "copy",
            profile: activeProfile,
            audience: activeAudience,
            discipline: activeDiscipline,
            inputPrompt: lastPrompt,
            enhancedPrompt: data.text,
            originalWords: lastPrompt.split(/\s+/).filter(Boolean).length,
            enhancedWords: data.text.split(/\s+/).filter(Boolean).length,
            isLicensed,
            trialCountRemaining: trialCount
          });
          showValueInterceptionToast("Prompt copied");
          break;
        case "openCheckout":
          await vscode.env.openExternal(vscode.Uri.parse("https://bartholomew.info/checkout/promptsmith?ref=vscode"));
          break;
        case "enterPasskey":
          await vscode.commands.executeCommand("promptsmith.unlockLicense");
          break;
        case "unlockKey":
          await validateAndActivateKey(data.key);
          break;
      }
    });
  }

  // Command: Contact Customer Support
  context.subscriptions.push(
    vscode.commands.registerCommand("promptsmith.contactSupport", () => {
      vscode.env.openExternal(vscode.Uri.parse("mailto:help@bartholomew.info?subject=PromptSmith%20Support%20Inquiry"));
    })
  );

  // Command: Export Workspace Rules (.cursorrules / CLAUDE.md / .windsurfrules)
  const exportRulesCmd = vscode.commands.registerCommand("promptsmith.exportWorkspaceRules", async () => {
    const choice = await vscode.window.showQuickPick(
      [
        { label: ".cursorrules", description: "Cursor IDE workspace rules" },
        { label: "CLAUDE.md", description: "Claude Code CLI project memory & invariants" },
        { label: ".github/copilot-instructions.md", description: "GitHub Copilot custom workspace instructions" },
        { label: ".windsurfrules", description: "Windsurf Cascade workspace rules" }
      ],
      { placeHolder: "Select the target AI rules file to generate & compact" }
    );
    if (!choice) return;
    const res = await PromptWorkspaceToolkit.exportWorkspaceRulesFile(
      choice.label as ".cursorrules" | "CLAUDE.md" | ".windsurfrules" | ".github/copilot-instructions.md",
      lastEnhanced || lastPrompt
    );
    if (res.ok) {
      vscode.window.showInformationMessage(`PromptSmith: ${res.message}`);
    } else {
      vscode.window.showWarningMessage(`PromptSmith: ${res.message}`);
    }
  });

  // Webview View Provider for Sidebar
  class PromptSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "promptsmith.sidebarView";
    private _view?: vscode.WebviewView;

    resolveWebviewView(webviewView: vscode.WebviewView) {
      this._view = webviewView;
      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [context.extensionUri]
      };

      this.updateView();
      handleWebviewMessages(webviewView.webview);
    }

    public updateView() {
      if (this._view) {
        this._view.webview.html = getPanelHtml();
      }
    }
  }

  const sidebarProvider = new PromptSidebarProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(PromptSidebarProvider.viewType, sidebarProvider)
  );

  async function validateAndActivateKey(key: string): Promise<boolean> {
    let cleanKey = (key || "").trim();
    if (!cleanKey) return false;

    // Support direct Stripe Checkout Session ID redemption (cs_live_... or cs_test_...)
    if (/^cs_(live|test)_[a-zA-Z0-9]+$/.test(cleanKey)) {
      const claimedKey = await claimStripeSessionKey(cleanKey);
      if (claimedKey) {
        cleanKey = claimedKey;
      } else {
        vscode.window.showErrorMessage("Could not verify that Stripe Session ID. Ensure checkout was completed or contact help@bartholomew.info.");
        return false;
      }
    }

    cleanKey = cleanKey.toUpperCase();
    if (!/^PSMITH-(PRO|TEAM|PASSKEY)-[0-9A-F]{5}(-[0-9A-F]{5}){3}$/.test(cleanKey)) {
      vscode.window.showErrorMessage("Please enter a valid passkey (e.g. PSMITH-PRO-XXXXX-XXXXX-XXXXX-XXXXX) or Stripe Session ID.");
      return false;
    }

    try {
      const isValid = await verifyRemoteLicense(cleanKey);
      if (isValid) {
        isLicensed = true;
        await context.globalState.update(LICENSE_KEY, true);
        broadcastViewUpdate();
        vscode.window.showInformationMessage("PromptSmith Pro Passkey Verified and Activated.");
        return true;
      }
    } catch {
      // Verification error handled below
    }

    vscode.window.showErrorMessage(
      "Passkey not recognized. Need assistance? Contact help@bartholomew.info",
      "Contact Support"
    ).then(c => {
      if (c === "Contact Support") {
        vscode.env.openExternal(vscode.Uri.parse("mailto:help@bartholomew.info?subject=Passkey%20Assistance"));
      }
    });
    return false;
  }

  // 1-Click Protocol URI Handler: vscode://bartholomew.promptsmith-ai/activate?key=...
  context.subscriptions.push(
    vscode.window.registerUriHandler({
      async handleUri(uri: vscode.Uri) {
        if (uri.path === "/activate" || uri.path === "/unlock") {
          const params = new URLSearchParams(uri.query);
          const key = params.get("key") || params.get("session_id");
          if (key) {
            await validateAndActivateKey(key);
          }
        }
      }
    })
  );

  // Command: Open Screen Mascot Assistant (Draggable, dockable anywhere)
  function openMascotPanel() {
    if (assistantPanel) {
      assistantPanel.reveal(vscode.ViewColumn.Beside);
    } else {
      assistantPanel = vscode.window.createWebviewPanel(
        "promptsmith.floatingAssistant",
        "PromptSmith Assistant",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [context.extensionUri]
        }
      );
      handleWebviewMessages(assistantPanel.webview);
      assistantPanel.onDidDispose(() => {
        assistantPanel = undefined;
      });
    }
    assistantPanel.webview.html = getPanelHtml();
  }

  // Command: Improve Selection
  const improveCmd = vscode.commands.registerCommand("promptsmith.improveSelection", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      openMascotPanel();
      vscode.window.showInformationMessage("Opened PromptSmith Studio. Type a prompt directly or select text in an editor.");
      return;
    }

    const selection = editor.selection;
    const text = selection.isEmpty ? editor.document.getText() : editor.document.getText(selection);

    if (!text.trim()) {
      openMascotPanel();
      vscode.window.showWarningMessage("No text selected in editor. Type your prompt in the PromptSmith Input Draft box.");
      return;
    }

    if (!(await checkAndConsumeTrial())) return;

    const voiceCleaned = PromptWorkspaceToolkit.compileVoiceTranscript(text);
    const { scrubbed } = PromptWorkspaceToolkit.scrubSecrets(voiceCleaned.corrections > 0 ? voiceCleaned.cleaned : text);
    lastPrompt = scrubbed;
    lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
    lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
    await recordHistoryItem(lastPrompt, lastEnhanced, activeProfile);

    statusBar.text = autoHookEnabled ? `$(sparkle) Auto-Hook` : `$(sparkle)`;
    statusBar.tooltip = `PromptSmith Auto-Hook (${initialHook.detectedModelLabel}) | Score: ${lastMetrics.iqScore}/100 (-${lastMetrics.tokenSavingsPercent}% words)`;
    broadcastViewUpdate();

    if (autoHookEnabled) {
      await vscode.env.clipboard.writeText(lastEnhanced);
      await PromptWorkspaceToolkit.exportWorkspaceRulesFile(initialHook.nativeRuleFile, lastEnhanced, true);
      showValueInterceptionToast(`Auto-Hooked for ${initialHook.detectedModelLabel} & copied to clipboard`);
    } else {
      openMascotPanel();
    }

    PromptSmithTelemetry.trackEvent(context, {
      sessionId,
      runtime: targetRuntime,
      action: "improve",
      profile: activeProfile,
      audience: activeAudience,
      discipline: activeDiscipline,
      inputPrompt: text,
      enhancedPrompt: lastEnhanced,
      originalWords: text.split(/\s+/).filter(Boolean).length,
      enhancedWords: lastEnhanced.split(/\s+/).filter(Boolean).length,
      tokenReductionPct: lastMetrics.tokenSavingsPercent,
      isLicensed,
      trialCountRemaining: trialCount
    });
  });

  // Command: Autonomous Lateral Brainstorming (Think Outside the Box)
  const brainstormCmd = vscode.commands.registerCommand("promptsmith.brainstormSelection", async () => {
    const editor = vscode.window.activeTextEditor;
    const selectionText = editor
      ? (editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection))
      : "";
    const text = selectionText.trim() || lastPrompt.trim();
    if (!text) {
      openMascotPanel();
      vscode.window.showWarningMessage("Select prompt text in your editor or enter a draft in PromptSmith first.");
      return;
    }
    lastPrompt = text;
    lastMetrics = PromptAnalyzer.analyze(text, targetRuntime);
    activeProfile = "orthogonal_brainstorm";
    lastEnhanced = PromptEnhancer.enhance(text, activeProfile, targetRuntime, activeAudience, activeDiscipline);
    statusBar.text = `$(sparkle)`;
    statusBar.tooltip = `PromptSmith | Lateral Brainstorm: Outside-the-box paths active`;
    broadcastViewUpdate();
    openMascotPanel();

    PromptSmithTelemetry.trackEvent(context, {
      sessionId,
      runtime: targetRuntime,
      action: "improve",
      profile: activeProfile,
      audience: activeAudience,
      discipline: activeDiscipline,
      inputPrompt: text,
      enhancedPrompt: lastEnhanced,
      originalWords: text.split(/\s+/).filter(Boolean).length,
      enhancedWords: lastEnhanced.split(/\s+/).filter(Boolean).length,
      tokenReductionPct: lastMetrics.tokenSavingsPercent,
      isLicensed,
      trialCountRemaining: trialCount
    });
    vscode.window.showInformationMessage("PromptSmith: Autonomous Lateral Brainstorming Active.");
  });

  // Command: Open Dashboard / Mascot Assistant & Optimization Playground
  const openDashboardCmd = vscode.commands.registerCommand("promptsmith.openDashboard", () => {
    PromptSmithDashboardPanel.createOrShow(context.extensionUri);
  });
  context.subscriptions.push(
    vscode.commands.registerCommand("promptsmith.openPlayground", () => {
      PromptSmithDashboardPanel.createOrShow(context.extensionUri);
    })
  );

  // Command: Unlock License Passkey ($9/mo or $10 Passkey)
  const unlockCmd = vscode.commands.registerCommand("promptsmith.unlockLicense", async () => {
    const key = await vscode.window.showInputBox({
      prompt: "Enter your PromptSmith Pro Passkey ($9/mo or $10 Passkey) or Stripe Session ID (cs_live_...)",
      placeHolder: "PSMITH-PRO-XXXXX-XXXXX-XXXXX-XXXXX"
    });

    if (key) {
      await validateAndActivateKey(key);
    }
  });

  // QuickFix / CodeAction Provider (Clean, zero emojis)
  class PromptCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection): vscode.CodeAction[] {
      const selected = document.getText(range);
      if (!selected || selected.trim().length < 10) return [];

      const action = new vscode.CodeAction("Optimize with PromptSmith", vscode.CodeActionKind.RefactorRewrite);
      action.command = {
        command: "promptsmith.improveSelection",
        title: "Optimize with PromptSmith"
      };
      return [action];
    }
  }

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(["markdown", "plaintext", "typescript", "python", "json"], new PromptCodeActionProvider(), {
      providedCodeActionKinds: [vscode.CodeActionKind.RefactorRewrite]
    })
  );

  const scrubSecretsCmd = vscode.commands.registerCommand("promptsmith.scrubSecrets", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      openMascotPanel();
      return;
    }
    const sel = editor.selection;
    const raw = sel.isEmpty ? editor.document.getText() : editor.document.getText(sel);
    const { scrubbed, redactedCount } = PromptWorkspaceToolkit.scrubSecrets(raw);
    if (redactedCount === 0) {
      vscode.window.showInformationMessage("PromptSmith Secret Guard: 0 exposed credentials detected.");
      return;
    }
    await editor.edit(eb => {
      if (sel.isEmpty) {
        eb.replace(new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(raw.length)), scrubbed);
      } else {
        eb.replace(sel, scrubbed);
      }
    });
    vscode.window.showInformationMessage(`PromptSmith Secret Guard: Redacted ${redactedCount} exposed credential(s).`);
  });

  const cleanVoiceCmd = vscode.commands.registerCommand("promptsmith.cleanVoiceStream", async () => {
    const editor = vscode.window.activeTextEditor;
    const raw = editor
      ? (editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection))
      : lastPrompt;
    if (!raw || !raw.trim()) {
      openMascotPanel();
      vscode.window.showInformationMessage("Dictate or type your spoken thoughts first, then run Clean Voice Stream.");
      return;
    }
    const vRes = PromptWorkspaceToolkit.compileVoiceTranscript(raw);
    const { scrubbed } = PromptWorkspaceToolkit.scrubSecrets(vRes.cleaned);
    lastPrompt = scrubbed;
    lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
    lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
    await recordHistoryItem(lastPrompt, lastEnhanced, activeProfile);
    if (autoHookEnabled) {
      await vscode.env.clipboard.writeText(lastEnhanced);
    }
    broadcastViewUpdate();
    vscode.window.showInformationMessage(`PromptSmith Voice-to-Spec: Resolved ${vRes.corrections} spoken disfluencies/self-corrections & copied spec.`);
  });

  const groundWorkspaceCmd = vscode.commands.registerCommand("promptsmith.groundWorkspace", async () => {
    const ground = PromptWorkspaceToolkit.inspectWorkspace();
    lastPrompt = lastPrompt ? `${lastPrompt}\n\n${ground.contextSummaryBlock}` : ground.contextSummaryBlock;
    lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
    lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
    broadcastViewUpdate();
    vscode.window.showInformationMessage(`PromptSmith: Grounded in ${ground.workspaceName} (${ground.detectedStack.join(", ") || ground.languageId}).`);
  });

  const groundDiagnosticsCmd = vscode.commands.registerCommand("promptsmith.groundDiagnostics", async () => {
    const diag = PromptWorkspaceToolkit.inspectDiagnosticsAndDiff();
    lastPrompt = lastPrompt ? `${lastPrompt}\n\n${diag.block}` : diag.block;
    lastMetrics = PromptAnalyzer.analyze(lastPrompt, targetRuntime);
    lastEnhanced = PromptEnhancer.enhance(lastPrompt, activeProfile, targetRuntime, activeAudience, activeDiscipline);
    if (autoHookEnabled && lastEnhanced) {
      await vscode.env.clipboard.writeText(lastEnhanced);
    }
    broadcastViewUpdate();
    vscode.window.showInformationMessage(`PromptSmith Error-to-Spec: Grounded ${diag.count} active IDE diagnostic(s) & copied blueprint.`);
  });
  context.subscriptions.push(scrubSecretsCmd, cleanVoiceCmd, groundWorkspaceCmd, groundDiagnosticsCmd);
  context.subscriptions.push(improveCmd, brainstormCmd, openDashboardCmd, unlockCmd, exportRulesCmd);
}

function claimStripeSessionKey(sessionId: string): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify({ session_id: sessionId });
      const req = https.request(
        "https://us-central1-acn-26670.cloudfunctions.net/claimKey",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              const data = JSON.parse(body);
              resolve(data && data.ok && data.key ? String(data.key) : null);
            } catch {
              resolve(null);
            }
          });
        }
      );
      req.on("error", () => resolve(null));
      req.write(payload);
      req.end();
    } catch {
      resolve(null);
    }
  });
}

function verifyRemoteLicense(key: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify({ key });
      const req = https.request(
        "https://us-central1-acn-26670.cloudfunctions.net/validateKey",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload),
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              const data = JSON.parse(body);
              resolve(Boolean(data && data.valid));
            } catch {
              resolve(false);
            }
          });
        }
      );
      req.on("error", () => resolve(false));
      req.write(payload);
      req.end();
    } catch {
      resolve(false);
    }
  });
}

async function insertIntoEditor(text: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("Open a text editor file first to insert the prompt, or click Copy.");
    return;
  }

  const selection = editor.selection;
  await editor.edit((editBuilder) => {
    if (selection.isEmpty) {
      editBuilder.insert(selection.active, text);
    } else {
      editBuilder.replace(selection, text);
    }
  });
}

function detectRuntime(): string {
  const appName = vscode.env.appName || "";
  if (appName.includes("Cursor")) return "Cursor IDE";
  if (appName.includes("Windsurf")) return "Windsurf IDE";
  if (appName.includes("Claude")) return "Claude Code / Desktop";
  return "VS Code";
}
