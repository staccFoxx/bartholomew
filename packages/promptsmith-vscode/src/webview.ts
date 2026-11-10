/**
 * PromptSmith - Universal Screen Companion & Adaptive Cognitive Learning Studio (2027 Edition)
 * Hyper-interactive webview for Cursor, Windsurf, and VS Code.
 * Benchmarks prompts across Frontier Models, Coding Bots, and Next-Gen AI.
 * Adapts cognitive scaffolding dynamically to any age and knowledge level.
 */

import { PromptMetrics } from "./analyzer";
import { EnhancementProfile } from "./enhancer";
import { ModelBenchmarkEngine, BenchmarkTarget } from "./benchmarks";
import { CognitiveAudience } from "./learner";
import { DisciplinaryLens, OmniEqualizerEngine } from "./equalizer";
import { PromptWorkspaceToolkit } from "./workspace_skills";

export class PromptWebviewProvider {
  public static getHtml(
    originalPrompt: string,
    enhancedPrompt: string,
    metrics: PromptMetrics,
    activeProfile: EnhancementProfile,
    isLicensed: boolean,
    remainingTrial: number,
    activeAudience?: CognitiveAudience,
    activeDiscipline?: DisciplinaryLens,
    autoHookEnabled = true,
    detectedModelLabel = "Claude 3.7 / Auto",
    historyVault: { ts: string; raw: string; compiled: string; profile: string }[] = []
  ): string {
    const safeOriginal = (originalPrompt || "Select text in your editor and press Alt+P to improve it.")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const benchmarks = ModelBenchmarkEngine.benchmarkPrompt(originalPrompt);
    const modelTargets = benchmarks.filter(b => b.category === "model");
    const botTargets = benchmarks.filter(b => b.category === "bot");
    const futureTargets = benchmarks.filter(b => b.category === "future");

    const cognitive = metrics.cognitive;
    const currentAudience = activeAudience || cognitive.audience;
    const currentDiscipline = activeDiscipline || metrics.discipline;
    const equalizerProf = OmniEqualizerEngine.PROFILES[currentDiscipline] || metrics.equalizer;
    const wsContext = PromptWorkspaceToolkit.inspectWorkspace();
    const ambiguities = PromptWorkspaceToolkit.lintAmbiguities(originalPrompt);
    const secretFindings = PromptWorkspaceToolkit.detectSecrets(originalPrompt);
    const costSim = PromptWorkspaceToolkit.simulateMultiTurnSavings(originalPrompt, metrics.tokenSavingsPercent);

    let mascotMessage = "Calibrated for maximum reasoning precision: high-density tokens, invariant constraints, and zero conversational fluff.";
    if (currentAudience === "explorer") {
      mascotMessage = "Friendly learning mode active: intuitive real-world analogies, step-by-step scaffolding, and clear explanations.";
    } else if (currentAudience === "architect") {
      mascotMessage = "Staff-architect precision active: formal Hoare invariants, strict schema validation, and maximum signal density.";
    } else if (currentAudience === "executive") {
      mascotMessage = "Executive decision mode active: strategic deliverables, risk trade-offs, and clear ROI contracts.";
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>PromptSmith Studio</title>
  <style>
    :root {
      --bg: var(--vscode-editor-background, #080c16);
      --fg: var(--vscode-editor-foreground, #e2e8f0);
      --card: rgba(14, 20, 36, 0.75);
      --card-border: rgba(255, 255, 255, 0.09);
      --accent: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.25);
      --emerald: #10b981;
      --purple: #a855f7;
      --amber: #f59e0b;
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      --font-mono: "JetBrains Mono", Consolas, "SF Mono", monospace;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: radial-gradient(circle at 50% 0%, #111827 0%, var(--bg) 80%);
      color: var(--fg);
      font-family: var(--font-sans);
      padding: 12px;
      min-height: 100vh;
      overflow-x: hidden;
      font-size: 11.5px;
      line-height: 1.45;
    }

    /* Top HUD / Mascot Header */
    .hud-header {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--card);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.08);
      user-select: none;
    }
    .mascot-avatar {
      width: 48px;
      height: 48px;
      object-fit: contain;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.6));
      cursor: grab;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      flex-shrink: 0;
    }
    .mascot-avatar:hover {
      transform: scale(1.1) rotate(-3deg);
    }
    .mascot-avatar:active {
      cursor: grabbing;
      transform: scale(0.95);
    }
    .hud-meta {
      flex: 1;
      min-width: 0;
    }
    .hud-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .brand-title {
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 800;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .brand-title span.pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--emerald);
      box-shadow: 0 0 8px var(--emerald);
    }
    .license-badge {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      border: 1px solid rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.12);
      color: var(--emerald);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .license-badge.trial {
      border-color: rgba(245, 158, 11, 0.4);
      background: rgba(245, 158, 11, 0.12);
      color: var(--amber);
    }
    .hud-sub {
      font-size: 10.5px;
      color: #94a3b8;
      line-height: 1.35;
    }

    /* Template Quick Chips */
    .chips-bar {
      display: flex;
      gap: 5px;
      overflow-x: auto;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .chips-bar::-webkit-scrollbar {
      height: 3px;
    }
    .chips-bar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
    .chip-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.09);
      color: #94a3b8;
      font-size: 9.5px;
      font-family: var(--font-mono);
      padding: 3px 8px;
      border-radius: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .chip-btn:hover {
      background: rgba(56, 189, 248, 0.12);
      border-color: rgba(56, 189, 248, 0.4);
      color: #fff;
    }

    /* Cognitive Level HUD */
    .panel-box {
      background: var(--card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 10px;
      margin-bottom: 10px;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .panel-label {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-pill {
      font-family: var(--font-mono);
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .pill-cyan { background: rgba(56, 189, 248, 0.15); color: var(--accent); border: 1px solid rgba(56, 189, 248, 0.3); }
    .pill-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
    .pill-emerald { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.3); }

    /* Audience Selector Tabs */
    .button-group {
      display: flex;
      gap: 4px;
      margin-top: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
    }
    .pill-btn {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 9.5px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .pill-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    .pill-btn.active {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.45);
      color: #38bdf8;
      font-weight: 700;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
    }

    /* Lateral Brainstormer 3 Divergent Vectors */
    .vectors-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-top: 8px;
    }
    .vector-pill {
      background: rgba(168, 85, 247, 0.05);
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 6px;
      padding: 6px 8px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .vector-pill:hover {
      background: rgba(168, 85, 247, 0.15);
      border-color: #c084fc;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(168, 85, 247, 0.25);
    }
    .v-title { font-size: 9.5px; font-weight: 700; color: #e9d5ff; font-family: var(--font-mono); }
    .v-desc { font-size: 8.5px; color: #a855f7; line-height: 1.25; }

    /* Target Category Tabs */
    .category-tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .cat-tab-btn {
      background: transparent;
      border: none;
      color: #64748b;
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .cat-tab-btn.active {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
    }

    /* Benchmarks Cards Grid */
    .targets-scroll-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      max-height: 160px;
      overflow-y: auto;
      padding-right: 2px;
      margin-bottom: 10px;
    }
    .targets-scroll-grid::-webkit-scrollbar {
      width: 4px;
    }
    .targets-scroll-grid::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
    }
    .target-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 6px;
      padding: 6px 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .target-card:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-1px);
    }
    .target-card.active {
      background: rgba(56, 189, 248, 0.12);
      border-color: #38bdf8;
      box-shadow: 0 0 14px rgba(56, 189, 248, 0.18);
    }
    .t-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      font-size: 10.5px;
    }
    .t-score {
      font-family: var(--font-mono);
      font-size: 9.5px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 4px;
    }
    .score-green { background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .score-yellow { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .t-bottom {
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #64748b;
      font-family: var(--font-mono);
    }

    /* Telemetry HUD Quick Strip */
    .telemetry-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-family: var(--font-mono);
      font-size: 9.5px;
    }
    .telemetry-val {
      font-weight: 800;
      color: #38bdf8;
    }

    /* View Mode Switcher (Compiled vs Diff) */
    .view-mode-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .mode-switch-btns {
      display: flex;
      gap: 4px;
    }
    .mode-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-family: var(--font-mono);
      font-size: 9px;
      padding: 2px 7px;
      border-radius: 4px;
      cursor: pointer;
    }
    .mode-btn.active {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.4);
      color: #fff;
    }

    /* Adaptive Dark Code Editor */
    .editor-wrapper {
      position: relative;
      margin-bottom: 10px;
    }
    textarea.prompt-editor {
      width: 100%;
      min-height: 130px;
      max-height: 280px;
      background: rgba(0, 4, 10, 0.55);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      color: #f1f5f9;
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 10px 12px;
      line-height: 1.45;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    textarea.prompt-editor:focus {
      border-color: rgba(56, 189, 248, 0.6);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.15);
    }

    /* Interactive Diff Viewport */
    .diff-viewport {
      display: none;
      width: 100%;
      min-height: 130px;
      max-height: 280px;
      overflow-y: auto;
      background: rgba(0, 4, 10, 0.55);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      color: #cbd5e1;
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 10px 12px;
      line-height: 1.5;
    }
    .diff-del {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      text-decoration: line-through;
      padding: 1px 4px;
      border-radius: 3px;
    }
    .diff-add {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
    }

    /* Primary Actions */
    .action-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 6px;
      margin-bottom: 10px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      color: #fff;
      border: 1px solid rgba(56, 189, 248, 0.5);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.15s ease;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(2, 132, 199, 0.45);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 8px 10px;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    /* Passkey Pro Box ($9/mo or $10 Passkey) */
    .pro-box {
      background: rgba(16, 185, 129, 0.04);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 8px;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .pro-meta {
      font-size: 10px;
      color: #94a3b8;
    }
    .pro-title {
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      color: #fff;
    }
    .btn-sub {
      background: #10b981;
      color: #042f1a;
      border: none;
      padding: 4px 10px;
      border-radius: 5px;
      font-family: var(--font-mono);
      font-weight: 800;
      font-size: 10px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-sub:hover {
      background: #34d399;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
    }
    .mascot-stride-stage {
      width: 64px;
      height: 66px;
      position: relative;
      flex-shrink: 0;
      cursor: grab;
    }
    .mascot-facing {
      width: 64px;
      height: 66px;
      position: relative;
      transition: transform 0.16s ease;
      transform-origin: center center;
      filter: drop-shadow(0 5px 12px rgba(0, 0, 0, 0.65));
    }
    .mascot-facing.flip-left { transform: scaleX(-1); }
    .mascot-layered-rig { width: 100%; height: 100%; position: relative; }
    .pose-front, .pose-side { position: absolute; inset: 0; width: 100%; height: 100%; transition: opacity 0.14s ease; pointer-events: none; }
    .pose-front { opacity: 1; }
    .pose-side  { opacity: 0; }
    .rig-state-walking .pose-front { opacity: 0; }
    .rig-state-walking .pose-side  { opacity: 1; }
    .rig-layer { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
    .rig-ground-shadow {
      position: absolute; bottom: 2px; left: 20%; width: 56%; height: 6px;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0) 75%);
      border-radius: 50%; transform-origin: center center;
    }
    .rig-layer-leg-l  { transform-origin: 36.1% 72.6%; }
    .rig-layer-leg-r  { transform-origin: 48.4% 72.6%; }
    .rig-layer-upper  { transform-origin: 45% 65%; }
    .rig-layer-hat    { transform-origin: 26.2% 51.6%; }
    .rig-layer-hammer { transform-origin: 57.6% 55.6%; }
    .rig-side-leg-near { transform-origin: 51.2% 72.6%; }
    .rig-side-leg-far  { transform-origin: 51.2% 72.6%; }
    .rig-side-upper    { transform-origin: 48.0% 66.0%; }
    .rig-side-head     { transform-origin: 47.3% 45.3%; }

    /* Idle breathing (hat follows head) */
    .rig-state-idle .rig-layer-upper, .rig-state-idle .rig-layer-hat { animation: gentIdleBreath 2.6s infinite ease-in-out; }
    .rig-state-idle .rig-layer-hammer { animation: gentIdleHammer 2.6s infinite ease-in-out; }
    .rig-state-idle .rig-ground-shadow { animation: gentShadowIdle 2.6s infinite ease-in-out; }

    /* Side-profile stroll: hands behind back, head tipped down in thought */
    .rig-state-walking .rig-side-upper { animation: gentSideTorsoBob 0.31s infinite ease-in-out; }
    .rig-state-walking .rig-side-head { animation: gentSideHeadDown 0.31s infinite ease-in-out; }
    .rig-state-walking .rig-side-leg-near { animation: gentSideStrideNear 0.62s infinite cubic-bezier(0.42, 0, 0.58, 1); }
    .rig-state-walking .rig-side-leg-far { animation: gentSideStrideFar 0.62s infinite cubic-bezier(0.42, 0, 0.58, 1); }
    .rig-state-walking .rig-ground-shadow { animation: gentStrideShadow 0.31s infinite ease-in-out; }

    /* Forge strike */
    .rig-state-forging .rig-layer-hammer { animation: gentForgeStrike 0.24s infinite alternate ease-in-out; }
    .rig-state-forging .rig-layer-upper, .rig-state-forging .rig-layer-hat { animation: gentStrideBounce 0.24s infinite ease-in-out; }

    /* Hat-removal salute */
    .rig-state-salute .rig-layer-upper { animation: gentSaluteBow 1.3s ease-in-out; }
    .rig-state-salute .rig-layer-hat { animation: gentHatRemove 1.3s ease-in-out; }

    /* Thought cloud above the hat while strolling */
    .stroll-thought { position: absolute; left: 44%; top: -24px; width: 40px; height: 30px; opacity: 0; transition: opacity 0.25s ease; pointer-events: none; z-index: 2; }
    .rig-state-walking .stroll-thought { opacity: 1; }
    .stroll-thought .tb { position: absolute; border-radius: 50%; background: rgba(241,245,249,0.92); }
    .stroll-thought .tb1 { width: 3px; height: 3px; left: 3px; bottom: 0; animation: thoughtRise 1.8s infinite ease-in-out; }
    .stroll-thought .tb2 { width: 5px; height: 5px; left: 7px; bottom: 4px; animation: thoughtRise 1.8s infinite ease-in-out 0.3s; }
    .stroll-thought .tcloud {
      position: absolute; left: 11px; top: 0; width: 27px; height: 16px; border-radius: 10px;
      background: rgba(241,245,249,0.95);
      box-shadow: -6px 3px 0 -2px rgba(241,245,249,0.95), 6px 3px 0 -2px rgba(241,245,249,0.95);
      display: flex; align-items: center; justify-content: center; gap: 2px;
      animation: thoughtFloat 2.4s infinite ease-in-out;
    }
    .stroll-thought .tcloud span { width: 3px; height: 3px; border-radius: 50%; background: #0f172a; animation: thoughtDot 1.2s infinite ease-in-out; }
    .stroll-thought .tcloud span:nth-child(2) { animation-delay: 0.2s; }
    .stroll-thought .tcloud span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes thoughtRise { 0%, 100% { transform: translateY(0); opacity: 0.55; } 50% { transform: translateY(-2px); opacity: 1; } }
    @keyframes thoughtFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    @keyframes thoughtDot { 0%, 100% { opacity: 0.25; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.1); } }
    @keyframes gentIdleBreath { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-2.5px); } }
    @keyframes gentIdleHammer { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-2.5px) rotate(-5deg); } }
    @keyframes gentShadowIdle { 0%, 100% { transform: scaleX(1); opacity: 0.55; } 50% { transform: scaleX(0.88); opacity: 0.38; } }
    @keyframes gentSideTorsoBob { 0%, 100% { transform: translateY(0px) rotate(1.4deg); } 50% { transform: translateY(-3px) rotate(-1.0deg); } }
    @keyframes gentSideHeadDown { 0%, 100% { transform: translateY(0px) rotate(11deg); } 50% { transform: translateY(-3px) rotate(9deg); } }
    @keyframes gentSideStrideNear {
      0% { transform: rotate(-26deg) translate(1.5px, -1px); } 25% { transform: rotate(0deg) translate(0px, 0px); }
      50% { transform: rotate(24deg) translate(-1.5px, -1px); } 75% { transform: rotate(0deg) translate(1px, -3px); }
      100% { transform: rotate(-26deg) translate(1.5px, -1px); }
    }
    @keyframes gentSideStrideFar {
      0% { transform: rotate(24deg) translate(-1.5px, -1px); } 25% { transform: rotate(0deg) translate(1px, -3px); }
      50% { transform: rotate(-26deg) translate(1.5px, -1px); } 75% { transform: rotate(0deg) translate(0px, 0px); }
      100% { transform: rotate(24deg) translate(-1.5px, -1px); }
    }
    @keyframes gentStrideBounce { 0%, 100% { transform: translateY(0px) rotate(1.2deg); } 50% { transform: translateY(-3.5px) rotate(-1.2deg); } }
    @keyframes gentStrideShadow { 0%, 100% { transform: scaleX(1.14); opacity: 0.65; } 50% { transform: scaleX(0.82); opacity: 0.34; } }
    @keyframes gentForgeStrike { 0% { transform: rotate(-28deg); } 100% { transform: rotate(24deg); } }
    @keyframes gentSaluteBow { 0%, 100% { transform: translateY(0px) rotate(0deg); } 30%, 70% { transform: translateY(1.5px) rotate(3deg); } }
    @keyframes gentHatRemove {
      0%, 100% { transform: rotate(0deg) translateY(0px); }
      30%, 70% { transform: rotate(-26deg) translateY(-7px); }
    }
  </style>
</head>
<body>

  <!-- Top Interactive HUD -->
  <div class="hud-header" id="draggable-hud" title="Drag to reposition companion, hover for a hat-tip, or click to toggle his stroll">
    <div class="mascot-stride-stage" id="mascot-drag-target" onclick="toggleMascotStride()">
      <div class="mascot-facing" id="mascot-facing">
        <div id="mascot-svg-rig" class="mascot-layered-rig rig-state-walking">
          <div class="rig-ground-shadow"></div>
          <div class="stroll-thought" aria-hidden="true">
            <span class="tb tb1"></span><span class="tb tb2"></span>
            <div class="tcloud"><span></span><span></span><span></span></div>
          </div>
          <div class="pose-front">
            <img src="data:image/png;base64,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" class="rig-layer rig-layer-leg-r" alt="Right Leg">
            <img src="data:image/png;base64,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" class="rig-layer rig-layer-leg-l" alt="Left Leg">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAAA4BklEQVR42u29eXSd13mf++y9v/GMOABBgCA4U6JEiZqsybJly7LiIZbt2A6VNG5727TXuclaTdO0N7lpWtPK0Datm6TJTVw76ZTBbakkN5NdK5ZlSZZlWdZMcZDEGQRAjGc+37j3vn+cQ9pOnE7pXZdwvmctriOBAIlD/L733e+4oaCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoOBKRfyleo/WDl/+R75QfNMfYQvJFAL873xfFmtBSmmH2vuf144Qw38mY4z4xv8vBFkI8Jveh7X2WwlOAD4wVq1WqwDb9+yZnJzYskVa+Wffv0JkWX9w5uTJ8+12O5ap1O2kvQYMgOwbRfmnBFmI8S+nAK0QQtpvEJwDNPZcc2D7rtlte8Y3b9kzVq1uK9drW8NSZQpr8f2gFpZLY+JbvH+LFVbrpNfvrxptMm102m23zvej3sXV5bWTa2sXzxx96flTnU7nItD7RjEWQvzLJUAhhLgkPAef2Tfdce+BXTv33jE+OXldvd7YXanWJv0gCALfcx3lIpQ0CInruEYKNOZba0VIRJZrJzcaARhtZJqmJkniJBoMep1ue761vvbawuKFF04ef/lrx48ffx1YH1leIYQoRPhtLkAxsjTO9u3bb7jj7rffv33bzrvHGxN7KtVaIyyVpOd72nM943kenuvg+Z7juR4IbBj6yne9P1co2hgxiCOTpZkRFjGIU5uliU6zlDjORJZlKk0S2Y+6cbfduri8svTy8ePHPvf45z/7CHBRCPEXOnMWAtwY4tv8nvd98K9cd+CWD09Pb91brlQc1/WyUhiI+lhNVStlWSqVRSn0heu4KKVQrmMRIOx/3U8KwAoLCIzWQucGrTVJEtPtDWy32zWdTs/0e32dmlymcaqazfXu3LlTX/rSV774qWPPP/+EECIvRPjtJ8BL4pv98N/8P378wPU3HWw0JjzP92wYltzJTRPO1NQE5VLZKqUsEkxuhNZaZDqTJjcSIdA6F3mu5X/Ft1vXdY0QAgTWcRzjSscoR1ohBUYbBoNYrq2vsbzatIN+P03i2AyigVqYnzvz1OOf/7nHH3/0d4UQWSHC/zrOhhNfiS1/9Xs+8hM333T7X2mMj9swCJxavR5umd6kJxqNHCFEmmey1+87udbSGCOssaPoYKRfIf4bT54lyxN16XOxw68UUlhHKeM5rvZCX89unTGbGmNiea1VXl1dM67r9j0v2O1I56PWWvPEE1/8XSGELkT456M2UMQBIN7zroP/2+23v+mHx8bHqdWq4aZNE+HWmcnE83ziNPU6vb4Xx4mbay0v6QYhhqITwz9H/Hf9fV//XDH6ekBobWSa5yqOEzeOYyfNc+q1UuYHgTLYkjZ57AXhRFiq7Dozd/qpXru98pck4f8/hdxgRwVvy8yW/aVKtW4hVMoNXVeZTrfnnJubD9fWW84wCpXfmCz+X/4gCCGx1tLp9uXC4rK3sLgSWGOMoxwhkBUllTs+sWnnrq07tv1Fk+CFC77CLLZUrquklDrPg2gwoOUo51LUqbUmz3OCIMDzXKS8JETLX0QDl8RsrcUYQ5qmRFFMHCdYa+kPYhXFiUrTjCiK1DBDJFzXdb1CYt8GFtBai7WWPXv27Nqxc8eBsFRCa217/R7tdhutNVJKjLEMBhHtdptWq02v1yeKItI0Q2uDtfwZIYpv8etS2dhaLgsujmN6vR6tVpt2u0MUxVhrRxZREEUxrVaLNE2xVjPWaIztufa62wFvVJ0p3PBGt4DX33jLjTNbt11TrVbJsowsy+j3+2RZRqlUwvd9lFJobdA6IUlShAApJY7jIKUC7DAlo/7846/WGq01IMjzHGMMxhisNd8kYGMMWZYRRRFRFJHnOUIgHMex9fqEs312+xuDIJiK43iukNoGFuDIgsgtM1v3lUph1XUV9XqVXm9AkiTEcUyapriui+u6+L6P6zpIKYcxCIzEKEYf+7pbFd+iq+CSxcWab26mGf3eMCeYkKbp5QcBQCmJ7/t4noeUktpYY/vVV1898/LLL89dspYFG0+Al3J/1fGJyT1BEEhrjPV9XziOQxzHRFFMluWj/44QQuC4LkEQEAQBruvheT5SQJamCCWwiJE1+0bvOIyU7TD0RSofYzRZmpCnGUk8IEszcq0xxnz9YKoUruvgecMHwFqLsYYwLE1u3bV358svv/zVQmob2AKOoshavVbf6jguaZoiRj/4UqmE67hkeY4xFiElAkGexKwvX6TTabO6NE9zeZlet82Fc2cRUqAs+BJCV1FSEsdRKDGUY57lVMcnaGzZhuf7jG/bg/RLVCY243kuyvPIc42wBqXAdVwc10UKcdmSWmMIgqCyaWzTbCGzb5Mz4Dem8C5ZINfzKVdr5FlKr93i6Esv8PqxI8ydPcWZUyfpDfq4JqOqDbWSQyUM8ZTCUQJXChQCKyypMfSFQ+qXMK7H+dYanHiFkjBUhKXie4zNbGfz7DZqm7fS2HcLpYlJvLCMNTl5kqCtQQr5p3OJ4huOEQUbWYBm5JCFEISlEGMsq0uLvPbyC3zty49z4uRJ1hYXkEBZwXjJY9dYmYrvUw5dQkfiSIGU4nIwIYTCYumWGkxt20WpXEPIoXVFSAb9Pr3mOnp1gXR1jsXVC8xZgf/Un1Aa38z4nuuYvPpGGrM78ZRHmqaFqr7dBDjK8/X73f6K0QajNUdfPsILTz/FkWe+xMKFM7QTzUTgsnd6gnJtDC/wweR48YCaMniOxHcUJd/D91wC38F1PQLPpetV0Duup16vIV13VPUQ5JnGWoOxlk63S/vMq5TX5/AcgU408fpF5hbPcu6pz9LZfDW33vd+du7eO4qGJWmaDTrd9ZVL3dRFm9bGFOClH1p7eXn5pLXG/snDD4tHH34Ykcd0u238oMTbZqq49RqD8jhBtcZEo0EQhnSbq0w2L7BtvIrjepQDn7DkE/o+ju9T8iSrNuSsqpB0u8h0gMojbBZjEMigBuUG1VIZ79qbyObK1NfPosseYT4MRkyecOrkMb7slNhz1dWkqUYIl6jfW587e/5UIbMNbgFH1kMvXpx/PY6iQbPdKVulLDii2e/xltkJdm3bTrrtKiY2TeK7LoEfUK5U6McDgotj3DRVwSLxPInnuriuh+MqlKPYIgThYpNEN5kIJaVSgOOEKKlItWGtt8iFpmHFGcNu3YshoZJ00KJMpjOSxGVsLKU61sBxfTxjcFyXXq9z4eTJEwsUWehvjzPgkeefP9J8z/vPOq53XY5g0I+YGt/Ezm2z7HzLO3HLZfLWOk7SwdVtyjKiJCR79m5j65iHEBLHdVBKIdWwTKeNxdicG9wJ9GSJfj6glfbIXIsVFic1zIRj7N7isNzu8sLaIqtOhQkSpBsQ5yHGdJmYmMQvlzj+wlexWCGkw+LCwvPtdntRCIEtcoAb+wwohODMmdeOnj75+sODKLoWK+XmqS12i2/E9Xe9GXfzFCsvP82NW0psnakNI1wBbikgLFdQSuK6Lkq5ICUYjc4z0jQl6WfkRjOvOzRTTa2xBzPo0V86Q5Y3QQkawSxb6w3ucrqcsV10ViLDwVcCazR1mxLUq3SaizbJchFFefTaybOfAaLi/MeG74axowm0wQvPfuETayvLJ8vlEtdcvc/u3jHL1I7drB75Ku++dpIbdk4R2pwAi4vFyXIcDKVSiXK1QrlWoVQpE4QhrishixA25exgmX4wy81v/QhTkzcgWgZ/4BD26vg9h/NLr/Dq3GlKQYld0w3qZZ9ASTxHUqtWqduUwfoKQihbCkqEQbi6fm7x+YMHD6p77rlHWWvlwYMH1aFDh2Qhuw3qgn/2X/zq9Z/7L58prbdbF6empvfu2D7LlJ9h+23u3beZ7dMNBq0mY4HLepTi+wG+sNjBALdaxQ9LCNcdRrbCkg0MMsk411wk9rfaG+96QCwfe4bo9AtsrgvE+FZ63S799R6bEsHFzlkapTol3yPwFbnOkEaRCY9NlRL9fpOsUqO9tky3H/Wee+251edee44/NUtcsAEFKIQQ9pd+9d9uvumWN/zY6TPn3zI1Pc3OHVupmZh7btqOWjsD0YCVVo9Hji3Y2tY9dvNUTewOE7ErVJg0RzouBCHCGEhjTBwzyAZcWGty4E0fEMvHn7H5wlGxZ99O6vUypH0G7RarlRVWFiWx6HJhdY5rtuzFdyQ2dJCZBATViQnC8/PENmd6divlQR7+/sPPveUP//Nv0Gs1+bGP/rT57f/025VK6K791Ef/wbOFS95gLhjgh3/o+x/9tV/+uXe9+Y233/Kh977jsKscXFeZyUYV15E0+xG/98qSfccPH+JDf+8nZLexjSdbvm0J33oOaAHWD8HzsEZjen2a/TVsplg9+ixLz35e7N62ia3bNqPTlHNn5zhz5gJpkjI9UWFrYwrtx0Syj6cEjrXIPMHB4IUVNjdqxMuLMs01nufsWF+58PB7H/irDzvl6ue++sKRL9xx993/dDjfTuGGN6ILPnTokHzsMeRP/IMfeuH06bNfnjt99mCtVLJZp0noKV54/YK9/yM/Kg7ccB3/9tf/Dc8996x95JFHBB+6V/zwB95MLkfNqWmCThK0Tul122SdiMWlZ9m5rcHC/AL/+j8/zPnVNgNrydIEqzXjvsvd+2epzSpebb7KDbUDlHwfGZaJckWcSyYmpplcXqajc3KtxbEjL/oTE8t4y+fN0hcOq2ve+a5TP/C3fuS0EELbQ1aKB4UpBLiBePDBB83hw4fFPfcckufOnW96vis2baogdJ+o3YHyuLj+lls5euQoj3z2j0yzH4szZ88yv7pObi3KZNjmEnm3TdRsgRVkeUq31WSLP8aZC6t89dkz3PmWO/nIbQeoKkPeXqW9usaR00s09YB0dZ0wc8kbhrIbEHd6oBXKqeGU60yNJeSOxJ/cSlCZFM984me5bUtFbbHGtP7ktz50tjl359mz898jdoov20OHpHjwQVMIcANx8OBB88ADD9jv/3t/748X5xdOOkrtdR1pErSs12tEuaE6NkEe9/nCo4+J3Xt2cuDAfmypjM1TSFLsIGGwtkYe51S8MlF8Ej+sM711mvd88N00xqsk7SZRloEX0JiZ5v6tM5zqLHPqdcVUPWRtucfE5jHKViC1YpC5GNdnrDHJueUmYzsniBYucO24x3ijRr+5JpWJde2Zz29ddPxPNq19M9C2H/vYX+oUjbMRv2lrrYB4/NWxMRE4iY27bYzjcO3OMWvPPsN4ucbf+cj3ie/90Dvx/YCrd8zghCVMv4e0FmkN5Jrm0iLVUomxMYkROfu2z+IpSxSlqLEJqpUq0vGwgwiL5rnnv8yNU9uxuo8wbbJBQq4trl8lCEJSp8yYP0W4vE6r3WFcGhJl6K2tEi9dpOw5qhVHefD689e98v/8zr13f/Dg733x0CEHyAsBbhQeekiKBx7Qpx757E+Op9GecLKWSzPueH7IrNJCrx6xrCnu3V4WXHs1eGW0DCBLURPjsDIHWROBZdDp4USafZM7Od+ap2tyJkp1ZKUEno9AYTXIWoNXXvsq1VQTrLY5tXSanpVU3RpWeugkhlIVN6zhV8aZmZzhhfOnCPMuFdel02xSHasTKvA8Fy/rWyeN7kSI31s5dswWLngjWT4hzCs9O9385M/e00fZ7Td+l3CamRVJKrASFbrCCEluJeQCPA/aLajUAIGNIvIoIu31yTPNlr2zTCtJu7vOkbPPwESJ7bVrcZUDwpLYmFdf+SrnnnyKqSxgVSxSH59g8ew5YrcLlQa5cqw1CNf1scJh91W3oLzXWHn+UQaDGB1HOJUSbrmMpxBBGIjy+Pg1OC5HH3qoEOCG4WMfEwLs2c7aeO/oc5V08w4ROErY1QVhPRdZqkKljAx8hFSQDMg12LUVTHMVayxmfYWk2aS33qXTjhhcXMN1BXLZ4rvKPvPEw7z8yjOiVKqQDSKaC+u4a112z+5i855t1OtVVtaWyLQhjQYYlJ185wft2snTmCQSTmUTKI+ZrbtITo8RJeMkrTZkOb7vE1RcZFimvbT6Glpz3cGDgoceKgS4IbzvddcJwCSkVlVrTFx3gGD5FGQJlCsIx8FmMTrpWqutMIMuRMD6ynCOI8+IBwPWL64xf3EN6wW8/Mrr4ErKN77JXvWuD7LPcZg/f9I2L5wiXXhd7PUlu+65jdr0DFmWETdXyfoxFkjTDEts69t3i17u0D9xDM9qpBJI5YB0KE1MEDXbSJHjhT5+pWxtWGO53X4Jo5ncv18UFnCDuF8hhD70Qz9UCRpbks6m2X59fGxSLp+3Jk2QzWWinmN6k1eJJGgI7Ulwc7v66peEd+41xgKHOM9pd/q02z0yY/nMs8fpl8bsX/s/f4xr3nKfqFTqOI4i3Lmf5toSIkvI1+fpzh0jOXsS4j7GgE1SPGVpLS8xcetbUaWa6Bmr8V2Zx33hByWkUijXJW5F6DjBn6jgBoEVpYrqCb+/+Y1vOw7w2KjRuxDglS8++8r58+Pxubn/uDh34W+ZcvWVbVVvZ3ahheiu0a1ustkd7xfBzB4RIMjTlOWleeFcf6d9dbkp8hPPU9YJUkr6acYTJxdoTm7nB37iJ7n+1tuF73ooDHmaokyOTlOyQc86lUmaO24TqDF49WuI5iJ5FpHrnNJV19vd7/t+sba6YpeWVuVmoUQa9/DMBNJ1EFKSdtu4jsCv13DLgVFSqX658fgbbznw3KFDh+SDRR6QjVIy1LbXe8e2LZvf8fQLX7vpqhtv+0NF9/5Ba8n2y5M2v+O7RX3LdhydI6TEC30CzyMLSmLPfe+xR0pj4quPPMzS3FkS5TJ7wx386A/+kN2ydbsQdjhNh1I4UtLt9kmT2Hqui85SgdGY2atgeide0iXIYnud4whvao+wpTJzL75ou/1I1LII6bjkaYRVLjZPKFXK+JObCHzHmCQV3WByEF5124NCCHvo0CFRVEI2UC04VOq746hv6p75O/U77v2XK0/8ZxvVdyh9x/twwzJZv4tbrWC0YX1lCT8sUa7Vee2VF7n6ttttuGlSPPOVp9l99dXc8ea77cTktGhMTJJlGa1WkzAsgYVetzucDzaGNNcoKVESnFKI02jg+j4y0TaOBswtzLO4uER7fcCUishLZXSWDKss3Q5OnupAlIzuDVwzMYOz77aP3vWutz5TVEE21mYEA4jBYHBTrRTKxuap78gWXr+jNbWXeGqfcOIIej3sxCYs1vb6PVGvNwiCkNOvH7elWl2k8cCMT24Sd979Zma3b7PVsYZwXZ+V5SVbG2sI1/VYWlwgSQZYa/BdJYRVKCVIEo3JR2tVbYQeRCLJEjsYxKI/6HNhcRE/B9QA47jkeYojJLrdJEQrX7lKze7sOPve8E/u/f6/8S/t4cNKPPCApmCDjWVqnWRaE9QaJsniuvFca5PUooXIck2nuUoz14TVKp12i9ePH7HV+phQWBYXFqTnurx24jX8ckW4fmj73S6u57OyvGCV4+A5Dq4jSeJYdKIcrQ1SCKRguBU1HVzeEZPnuRhEKa8ceYVuP2XGz9FRH1vbhEgTOpm1K9tuENWac1hMbXlx6p77/vjWG288cghkIb6NN5SkhBBaC/GMcp1rk0FkrcRkSSKUUAiJdSQiz2IrlUu/s87c8rINS2X6va49fuwYjlJiudfn4ukz9OfPctf9HxBeWEIoZev1KoNeVyz3elQqFYLABwFplpHECTrPyPMMayy51iRxTKvVYWF+ns4gZVstxFs/j61tRmcZnrC8vta0rfEd+fc9+CM/KoSYByjc7gYV4EOjRG2UJI/Q0n8jN9pKIaQxBiktcXeA7wYozxW9bte2m0183xfdXp8zL7xIFKc4UnLx7Hmy1QXWmhf5kpFsveY6pmZmRGutietKtDEsXVwGIaiO2valVAhHobOcfq9Hs9lkfWWdTqdHqmHS01QuvIR1A3AdrDBoY/OuUc7s9OSzJ778B51nP/lJ9w0f+YgWomi/2pACPHjwoLHWipdeeun3V9fWHzNZeo8QIlWO8rAW13UZDNo015oYjKjVa8wvXmTx/BxJb0C5VKLTbBFIuOaOt7Bj3z6CsMz6+jpz584NFxiVQqQQCEfRbnU4d/ocRmuUM1zlpo0mHiT0BzFZpjFZn7H+CpVkHes52FIVY8FxXdPSOMZ1126/af+PXXvXLd1Dhw7JWwvxbeipODvKmfUP//Ef/5Wk2fkDk+W3mzzLPd8XUTRQSRJTrVXx/IBjLx+n3WpiM0MgJXOnTvPUs09jhGB6+04qL79EnMSsLa+yfOE8vtbccsNNVGa3MdYYQ7o+mQWdW9K0T6YzTJ4jtEblMV5vnf7aSSqVAOlW0dJDCAcQxitVZTLWWAtk9oG33HXLl6y1srB83ybXNBw8eFA99NBD+tOf/vTM4vzKz3e73e/RWYof+rZSrYo4immvN8mzHE8YVBKRzJ3k2Ree5wvzqyhgF7AVqEus7zmiHJZtjhAXB33Gdm7hlmt3M8gsqZBY6WGsRAiDMhmuSXF1goOllbaYqG/GEx4yKFEa22yrE9N2ev+N7erV177v1ltvevLZZ591b7311qyQ2cYV4J/5/g4fPiwfGEWRf/TZP/nOV18+8pHW+VPvX19fM65U0tEZMo1wki5e0kPZjIlqlVNrbY7OtXnrvv3snZ2xmzZvIti0SaSuhzCJrZVyIXurvPjSCbqDBHROnmsyY9CjJUZSieH2KwGttEU9qGONi18Zw6+M5duuvclpXH/D33/jvff8/Cc/+Un3B37gBwrxbUABXlrVbP6cJUVYa8UDDzwgH3roIW2tdX/v5x58Zu5rT97UjyNj8kwqAZ7rUAoDytUqmybHOXDtbrQbEPsNvPEpa4MyfuhSVlZUsi7Nk8d44YmnSZVLpVEnSVP6vZh+FBMlGXmu0UYjjCXXGV3doeLW0fh4pbqe3XWNmnnDHb//xvvf/b2PPfaYftvb3qaLiws35hnQXq58hOFsqsWBMPC3Z1kmkqh3ATgihLggpdSHDx8OhRDR01969G/3L577nLhwdsIvj1tPKRGWAmqVEuPjdcq1Cu3egMkJn8myxjFLgp61ei1h0I84fm6OC3MLlMfH2TEzTZZndPsDALS1w84XKcgyQ24tmdYM1wBKrJWmPrFFVfde+5mr7n/3XxdCJMOO7UJ8G1GAohEEsznuNhl6bxLSecdkbXw/2Ea1VhPlcrk5d+HciaWFC39o8vS3HnjggVVrrb8Ki1s2TT37wqc/+a7mhdO6Vq+pcslnbKxCrTHGWKOGqxTt5TVWF5YxWUYWRSKJeiRJhihV2HngesY2j5NFMVmzhc5zev2YKErJjcZoTZZpMgODPCcThpJycMtjQu25Pn7Th7/nJytCdL9orSOEyAtpbTwXrABdcoMvWmHukY4DFrbvvAolBI5ymJ7Zil8q0Yuj/t69u77y7nd+5zNPPPnUnWdPvvqm2Z27vHI2sFMXj4ntUw3hhAH1apXNU+OMbxqnUqvgl0tkuSHqR2RRjNEZypF4no8WgjhO6LY7tJZXmTu/yPJ6F2s1WMh1TprlaC1Z7a3jBz5+OMWXF3qmdO2d8tabD/zmh+/f8pHv/u7/qH/8x+8zDxTVjg0lQAHYccZrTdF80vfc67XWesuWrVIiRJ4kI1Nt8cOSndi8RVoBW7ZfxWvHXmRh/jye61sjEFfPTHP/vq3sHQtxgpDGphrbd88yNjFOUA5xPR+pFFaATlPyOCLtR/QHMf3egNXVVebPz7OwtE6aW5ACa81wi5bOiOKM9axH5Izz2eeOk7gN9u6/2Vxz4y3y9hv2/OMf/tvf+zOX3tOhQ4fUxz72MVOkYTaIAMOw+j7X937T5lnNWmNvvukm0Wm1WZy7wMSmieEgUa+LzlObZLmpNCZslmZSKCmwRnheiPQrhF6Ja8KEN880mAw9Nu/cwvZr91KplHEdcflSmzzX5GlC0h/QbndZXVnn4tIqa+stMgPGCnJryLKcJMkY5BmxVyat1Pjs0y+wtNxkcnKGUn3cViemzTUHrs92TW/+9Xe+6y2H3/6mO578+rjlIXno0HCuuZDcleuCg8bk9M9Njo//8Nkzr7N9did79+6lud7k9ddOsHl6M9VKldbqGr1eC20t0zNbaXd6+EGAQJFlGTpNMNJhcXWZmmf4kfd8B1vyARPVkG27dlCqVTDCYjRkOidNEvrdPs31Du1Oj8EgwuqMKM/oRhGdOGNgJYlfxRmfpjy+iSeffoqXT7xK6JdRrofreNQ2bcEvVaiGZbbu3K5nt279wrVX7/kv73v3fZ/fvWvmqDZFTHKlCvBSxLh7euvuf49O715du2jfdOebRZamZFnO+QtzuI7DttntNNtrNNdWMNawY8du+v0B5XKFZquJTmMSq9mZ+3xvNs2Z/hruG3YRXDWJijv466tMhh5TmxqEvoexliTPiQbDm45WOn0urLVYbLbopAmqVCfYshW/sZlSfRzXkbz2+gke/cpXUNJFCoVyXLBQHZ9EZ6lNel3tl6tqYmqr2LZjFzv37FnbsWvHY7t3zv7i9zXCp7nnHl0sJroCo2DXdStCyfH19SZTk9O4jmT+wgpe4ON6DoP+gCjpo4QCoRDSQSqHWq1OmqZIKVCux0AnXN/zeEc4zeTe2zhy/DhPPf805/aPM3HrTaz2ujx/8iyyuQpCYACrFJ045vz8RTqdmAlcbnFnhgnn8RLBlhnyaEBzbZWXjh3HGHBdOXpyhtd3pWlCGneFsNoxSZ+1+VNm/eI5c/q1YxNTszs+NLV12wee2b3zzf/qbW/7yqWKTiG/K0iAQojU6Dz2XJ9atcaFhUW6gx7l0RVXaZbR6XRRUqLN8GM619Rq1eHVDX2FFYaK47Mt80g8jfY9brn5NrbPz/Loi09zZP7z7P5rD/D6apuvvf4Sy0lKY99VeFbjnFlmW+ZyjbuFNzT2MCZLPHrxJdaXh5chep7P4toaa60OpaCEEBIhR/cIS9BZgslzPNcbfRwppZWDzqo9/sKFrB/d5hmvVi4kd4UKME3TRZ3kx8vl0hv6gz79KMIaS+qkWCzaaLq9PoHvY6zF6gwQuI5LuTS8UiHNM2yvx3guEdJh7eIS6902mYA3XX0nUwuvMf+pz3FfZZzr3L10ZMJLF1pcJ8eZDfaza2ySqeo4QaXC6YtzRGgiYZBphuOHnDo7R7VSRUiJHZ3phBQoqTBWID0P3/eQAoRyyLMcrVMRBKESWHrt9cLqXYECvHQeamc6fsJadTAeRL7W2kopRJqliNG9bnEcIYUgz/LLy8bXW22EAMdx6CYR1cxQtQrH91hYvsir7XO06MOioRKM8dbdt7FtbAopBSda52ideIyyYzhvO0SDlNANKI3VITNoDB0bU7KGI8eO0mq1qdRqw+thhUAqBUYgpaI36FEul3AdD4RBa0OKpVIpE8cZ/dbqaKdNwZVoAQVg21HvcxUnnBOw11hrrbEiTbLRgJAlSzMyJyfLMsIwROucQTTAaAtWkyuouB6hhUqtyg3bp5leGCOKB2ROzqpOePHUCY7yKhXH54JdozE+QRJlBLGmYktk2bAHMDM5KQZRCjg7d56jJ45TLlcQCOr1MZqtFmncxxqDEAI/8ClXymAtJjf0B11q1Squ4zLoJ6SDLibLv6nBtuDKEaA9ePCgOnz48IV6bWLRIvZirTUW8jwfxepDN5zrHK01ruMipYOjXIw0WC3QGKrVKkbmDHoD6pvH2bxlG91en4W1Jc6uz9NMOgRIdCJYJuL2cB9v3XUNidSYJKdSr5EbQyvp08fQNSlzZ88RBCFSSrQdCq5cLhGO7idWSuD7/lB81hDrFG00ExMTrK83cT0HbEaSFB74ij0DPvTQQ1oIwcT4li4Ck+XpcADIWNBgEZcviLZYXN8d3f8rsMaircHzPSq1GrFdpdls03qpw+KgxflojTYDEkey0vAZr4xho4Qk83hs7VWStSY3bd/P2FidJBrQbHVYTXr0HEsfjet5VCo+3W4PRzpkaUroh3g1D6WGO6KjQQ+sJdWaQRQN7y5WDtYaSqVgeIl2VJSIrzgBXtp68PO//MlbXjzyyh1fffrp6/qdjqTfy/IsA2mFtVraDKzUmFzjOMN73oQE5QzPYUYbqpUqkTV08pR+0meh12bJtGk6hnbo0d3WsDd8z3u56763i7WFRZsmmegsLtjB736Jx59+Vuy+uIXJsTFa0YB106cZWC4019mxYxdxkuAFHlgYZvEMaRLheSFxErO8skKjXifNEvr9PtNTm8nNMCr2fZ8sS8EUArxiLeD0tqmL1yWpV6uUv7y8vOYsLi5sXVtbp9tuEQ16SBHlFqTOM+m5PkpJhADlSKSVWGMYr9VZWl3hS3aZ81mXrgJdD0m3bmbLnTfb93/w/dz+xjeLsFzGcRCddo/UaBF98AP2yY//a/vCb/+xmFluEgqPWGlejJrI8Rk2NRrMX7xIGATD86YAi8VRDhbB2XOnQUgC30ePGlld1ydNMyrVCmEQEkUD8jQpFHelCfBSVeD7vuu7FoB/JQS8Nndh2+Off/z2V06cePup02fvba63dq8uX3TXV1dorq6asFSSUsnRdVsOFlBSUa+PcfL0SY6WY5QecPP+A9z7jnfaO9/+Vm66+Q2iXh8jTlMWTh+1XlAiF4GoVipUt24Tb/3oj9ixN95gnvl3h2XvxVc50ulw0WretncvuYXA94eJa2vACrTWCOVw8vRr5NpQq1XQuSHNcqQU5CMhjo+P47nO8HKmPLs0WlAEIldgP6A4fPiwfOBXfkVcNTs7B8wBv2utDX/hE7/2xtdfO/XehfmFt50+efJGJSXCJBhj8RwPISVKSUrlEr1ej8ZYA9fz7HVvvI0f/Uf/EOX6QhtDmqZYazFWi1xra5TF830whon6JnHHe76T7Tdfb3/hn39cPPKbv8mW6SlmpqZZvLiAH3ijbuxhSkgIyclTr9Nab9pyuSZcZ5j3y/MMsCRpSrVSwXUUrusipcBQuOArWYD2Ug/doUOH5LFjx8TIQkbAo8Cj1trqz//yv/7Aa6fmPvXME4/4WHAcFwSUSiVcxyEaDAgbDTZNjLO6smaNsNLkGdZapJQoIdiy83rSNBHNtVWUctAmx+icyfEx8fSTT9kTr75qZ6a3iH1X78MiQAxHP40Zlt4cx+XM2fMsryzbn/7Zf8L83Jz9N7/+70StXiPXmjzXpHFKlmZEcYyQkkq5jB96heI2wljmn25bOnjwoGo0GlII0bXW/s7/9eDHf0FK5QshrHKUMNoQBAFZlpLlOUEQoBxHXJifsyeOn7C33Hyz6A/iS5fOoZQkiWMcz7tc0qtXQx5++BH78Y//MxPHsSqVQjZPTZHEA6SUo4gbpPJYXl6l02naX/mVT/Ad3/Ed9uUXX5CPfuFRzp2fA0BrQ55rBtGAVnP4Txx4XnFlKxv0pqSHHnpI33fffcZaK77y3LH7Pa80bsFYi1DKQSkH3wvodHtoo/GCYFilEIhHv/B5pByWW4QQSMdBSkWWpXiuhzGaSiXkD/7gj+w/+5mfMnmSqDzPKVerjDfGSbMc13FRUuE6Lt1uD2u0/bVP/Tr3v/d+Oz93TtSqdd5///swZnjDOhiyLCVJUnqDPmvrLRaXVlhdbRWK28jLiYQQ9rf+8FGhdY6rhk2lUkhQ4LoeKyvLJElMHEWUg4BSqSyeeOwJ8773f1Ds2buHKE5ZuTiH4/gI5eB5LmHg8Bu/8Zvm1z7xKyJPM5UZSxwn7JieQTkKi0U57nAvjDFcmF/gnd9xn1hZWubffOrXxHpznfPn57gwN4/n+0SD4TBTlqekaYpSCmMsgedRK1cLxW30axocIe6KogQhpLU2QyiJNAYpBevNJp7r47resHEhDIj6ffkb/+Hf25/+6Z8S1kLcbVltBY3NsyIMfD71yV8zn/7N/0Cea5FrQ5JlrDWb3HLzLWRpilACYSXCEcydO8/Cwjx//JnP8kd/9BmSNCXPc6y1ZKPXS0OlOtfkWpNmw4WZWmva7XahuA16WSGPNJsSYG1lvZYlEQhsnucYbVDSQSlBu91ESkG9VscimJ9fxA8CvvqVp+0jX/iirVd8pnbsE1ftv0lEgz7/4p//nPmPv/1bKMeVCMF6q82Zs2fQOiMolegPBkghcRxFf9Dn9Vdfxfd8HMdFOQ7B0MoSBAGB7yGluHzO0yYnTYaBSJbldPt95pcuFrXgDSlAa8WWhQVtrXWS3IwPBhHWWJHlmjRLEHJ4tuv3uzjKJcszJsYb+GHA+bnzeK4j/9Onf9suLl5kU6PKqVMn+cV/+XHz+Be/KIQQcnFpidNnz9KP+sxunWXXjt24yiWOE4QQGATHjh0niiNqtToCO7xt02h0rofJZ60xdtSixXCAfhgR52RZTjRIiOMiEb0xl5QD4sEHzQ/+4F+frFVK+3u9DgIh7GhXX71WI89zBoMIz/MAQ56nbN60if5gwNLKMt1eV/zqr35Cv+vd75K//Iu/xPnz50W31xErq6u4rsv22VlqtSq9fjR0pQw3IIDk1OnTLCws0Bgbp1wOybMcKRQaiyXHmEvj9PabBh2yLMZREikljnIKtW30M+Azz5zXK2vNNDcajcYKyyAagIR+v0+cxIzVGxgNVkGaJFQqZcJSQLvdEV/5ypfVY48/bs+fPSOSPKNerXD13r1UK2WyPKff6xNFA8Ya42gz7FxZXVvj+LFjBEFIrVbDGIMxBm2GdWk72phqLrU1CgnW4CjFlplZM3f+rABlgiBUQVCIcEMLUJa9cpTEtTxLhzVZBGmSonNLJ+qSphmu62KNJs+H0YCJhlax0Rjn/Pk5+t2WqDc2cdXUJOVSCZ3lRGlMmqTD8pnWOK5LbnLSNOfE8ePkec7kps24yiHXOcbYYVVE2GGi2loYjQ5ghzXiLMvNj/+jj8njLz/Hr/zfv+yWSiWL8AvFbdA8oASoVSp7PUfOxoOeEQIJw5prkiQ0m02M0Ugph3owGjPq3bNYzp09x4fftZtP/sTb2TZmGcQpa2urrDWb9Lp9BlFEnCTkuQELWaaZm59jdW2FsbEGYRCgrRmOA1x6vbzIRlzeqSSFwGhrNk1vl51B/PDHfvqn3n77G998Mopj0W6vF7W4jRoFA3RbLRsPYsxoyFYKgUDQ7XRoNZuj45ckN3ooFmNGgYKhUvbZHnYp909RyoYD6FEcEycJSTqsoGg9/HwhJL1en1MnT+J5HrVqdbSr2mLMaGGRtZfd7zDJfXmjP1IqMzUzy5effemLk43Go3/37//Ye/cfuP5iEAS1QnIbWICLy+siigboUcVhWN91GAwGtNuty0NC1pjLmw+SJGPQ7yOVz5883+SxYyltd4Y9u7YxVhujXCrjjUpyw2aDYWfNmTOnGAz6TIxP4jgOlqGbHe6KuWT7vh4m2dEDIYUiKFWojE1yy0237rHWuh/+7veduO9t997/gQ98aG7UA1lsSNhQS8pHr0vtFkk2bGnKc4PjSJSANM8ZRH2kVEgxXDaOESNBeCA1jnI5clHz3AXL1KYqNo7I0ow8M2R6lK8bJZPbnQ5nz52lWqkRBOHI0tmh2zUGDJfFihUILBKJlcPmiHK1IcPKGDu2zRwA1KFDh/SDDz74HH+qBa1gg1jAg6PXXdtmb3eki9XGytHGLIEmS9NhWU4Ot5caY8kzTZJmDJKYJMnp9nrcfesMb7quysX5eVZX12m2WnR6HXq9PoM4IUpSjDasra6SZRn1+hhiZOnsZTsnhsPol92uvZx3kULhBhXKY+MElRq97iCDYXPFoUOH5EZbiVwIcMTRo0etELA4d+HeXreFFFIyurhocXmVbq+L1mbkKkHrHBgGIEpAlGrG/YQP3xVy394YR3dI9VBExg7lZK0FM+xiabaalMIKrudh9PAsycjlG8AKcXmfyKX4QwiBUgovKFEemyQIK8wtr+bPPfcp/Q0dPoXl24gCfPDBB40xNtAy2NPrdogH3eG2hCTDGIHneURRD9cdDoUzmiPGgqMUpcAj1g6PfO6rnD/XpFafYLzRoFouUw4DQt/Hd128UeOokorA88nSlDhNyLXGMjxbWqNHLnikPjsMhBACoRyU62GtFlEc4Spnv+/fNQ3DHsdCbhtQgNZaCXDkyInrhXKmlpcWbbfbkkJYtM6ZnNw8ik4NruN9k4kxWLJs2Gzazz3+00suf3jC46qr9xD3O+TGkI/Od9Zy2a36gY90HIQQhL6P6zoYbUbuF+zoCGetGVnA4co3gDjq0WuuiajXRQg5NT+/WiT/NrIAh8sdD8kLF84cabdWnux12iKLE60vnfmsoNNtjxYcOcPZYZOTa4PONZnWZFlGmsRIx2Gp1SOOIkq+otVqkyQpSZqRZRlZnpEbg9b5sFFVG7KRW7ajCshoIgljLYEfoKRCIhEjq+j5JcpjE0ipTJrmpqv1VQDXDW97L9iQQcjh68R3fud3JsK6L+3YtRcvDC8PrOd5Sr/XQ0o1PAMaO2yFyjOSNCGOI3qDmFCl/OO/tocP3Oxw4vUzTG+eIIljkjQlTROyPMPoYYolzVKEMNbzHIzWWDOKgEepGMSw4UCp4WwyiGFDhJJYLGkck+WZka4nB5G+9ptDqYKNVwl54AFjrRVjY6X7HNcnDEvCWI2x0O52SLNktHpXjs5+Fj2azcjznCTN8JQmXjjFtdMOUb/NervPdXu3MRgMMBbUaN1bnKRUSiV7391vwHEkiFHUK4faGw7LC4SAKIqGA+dWk1t9uSPaCQL8sCJa3R7Lq+1rhqmkogVrIyeiR4cuXcqyBDsqeWltaDXXAfB9fzS7AUIqlFQ4SqKUQxi4rPQVnzlq+f3nEzJZ4eyFizjK4e437GesWsIydLG7d8zwXe9+q3jp6KtifmEZzx2dKw2I4TjcqPF0OKKZm/zyBgchJFI4WGPIkog4TugP4gPWWrn/6NEiAt7gzQgiTXMj5FAAjuPRaq/QH/QQQuJ7weVAYJh+ETDa3ycY7hd85qzACpcwVGhtOHp6jqt3zHDnzdeSG4uSLp4jePSJr/D6uYuUgpBOp0upXCLV6defBWFGo5nDXKSVly6ztug8RacpOktl1O8h3ZnZrz355M4HH3zw9Oi+u6IKshEFqJQ0//BnfllIIYdD3lqPrJ+gFFTwveEdv1IMJ9i+MTJ1XZcsy2m3Vtm8aRNKDv1pqVTm1bMXefXMBSolH60NS8vrCMdhYryBzjWD/nB9b+AHJEk8TEcbMUpL20s3Nw1LeBh0lpKnCXmeksSxHUTJ5JHzzW3A6SIQ2ZguWFhrxalT62MgfKMNjuux3lqnN+gipYPWeigOe6n8NhSfQOA4DoNBxOrKGnGcsr7eIo5TpHJGIgzwgpBerBkkmsbEOPV6dWThIAg9kjghTqJhmmf08UvWUHxzzgijc9I0QetcpGmiM2N86Xq3DhPqk4UAN5oADx8+LIUQdnX1wk1hGM7keWbjQSRXli+Ctchhxz5pktLt9IjjDDsqkQkpaLc6LC4uIRDUqjX8MKTf7dNpdy4nrAXDu+V8z0UIyWiykiwdNjMYa2m3O0TJAHdkaYdPhrhciBOjmWN0jh71F2ZZKjq9AWlubxHAgzxWuN+N5oIPHjxoAZbW102WZTZJ+lw4f5YkjREIhFDWcR0Tlsp4nkOSZuTdHD/wGfQ79Ht9fM/D8zykkEgkYRgyiAc0mx3K5RDHHY5Oaq1JR/O8eTbM/SHA8xw8zyGKYowxhGGJPMvQuR6K0HK5Q8Zajc4zsrivsiQW/V6fxZXmAfPaa764+ur0UtdNwQZrx4qjmFznzJ05xerq4jDaFRKhHOF5nvJcV3mer2rVmvJcTw36kcqzXJVLJRX4oXJdTzmOUmAVQqogCJXrKjUYxGrQH/7qtHuq34uUyaxylaOCIFClUqhCP1RhEKhKuaJ0rlW321FCCKUcRwkhFGK0uh+pBEKZPFNZHJGliex12jZOkmsenWvuBexHP/rRoiS3kSzgxz42EiCwvrTE3JmTQhsNQpjhUc9+wnHVpzE2SDNjHAy+42MDixaKHI3FgBYYB8g02hGQ5whH4HqKXqtPnOcEjoPrOJdvrpOOe/kpzRXg5gQ6pNVbReuUsU1T5K0+wmE4Q2KVlOjMZPnOLIl/MY0HY9Ggr6PMuCv9/puBo0UgskGjYN8qe/7cKdHuNIdjj5eaUYR4ZWVl8cn/FX9H8j8wNam1Zmn+/Lf8vfHxvad0miRJ1CdNEjsYxCyutm+By/PNupDeBhOg5wm302phrbFSSmGNwQpLpvNwdNOmugJ+sHIYvqQ1Y3wxFOBA9DodonjTVdZaXwiRXtoKW8hvQwhw6IN37NqxnOdxIoTyhJBWiGEKxKSx+Qbh6SugYmOEyLVg2GWTp4no9Xr0omTXw088vJnh3sPCDW+UIGRUOZBvOLDvlbFG43nXDYQUjpHSwQowV+A76HZX6bUuknbXybJEDgY90251ti8tpbPw9Sm/go3SDXPwoNBa86H3f9c/v/6GA+R5bh3Xs0Ove+W9hTRN6XSbXLzwOounjtBdW7ZRksokN9d/44xLwQYR4O/8zu/oQ4cOyR/8we//L2+65+5/NLNtm5NnuXUd114qt11hB1aklGRZysr8KV5/4TEuzp9lEOUHKBS48c+sf/MjP/SP91y937puyYZh9e9yOXFyZTzQnlfdp6SzhBBWSseAyLft3m+/53//+78kpeTgwYOq+FFuQIbNn0jP8/jZf/rxv7Ntx961Sm38J680AU54E/tcJ1hCCKuUaxzl67Bct+/9ru/98nB5UhGEbPRLth2Au9761pv277/h3ivo8m0JsO/AXfsmNu9cEkJZxwmM44RZrT5lbrjh9n+3ERcCFHnAP5vqyAH11OOPv/gtbt38/5FDwINUZ7ZSHp+k12mis8Q6gS+DMBCh6376CnpYiiDkL4geff9Xzns4dCkN02HT9HYmNm/BYk2pVE1ntk5/9GvPP/V5huOZRSWkeBL/v2P//v3ermves+PcuWfUK0e+Irbv2JfMnXzl9Oi+4KICUlB4m4Jvd4auVl5xx4SCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoL/Qf5fEtMIiqbyjcQAAAAASUVORK5CYII=" class="rig-layer rig-layer-upper" alt="PromptSmith Gentleman">
            <img src="data:image/png;base64,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" class="rig-layer rig-layer-hat" alt="Top Hat">
            <img src="data:image/png;base64,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" class="rig-layer rig-layer-hammer" alt="Gold Hammer">
          </div>
          <div class="pose-side">
            <img src="data:image/png;base64,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" class="rig-layer rig-side-leg-far" alt="Far Stride Leg">
            <img src="data:image/png;base64,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" class="rig-layer rig-side-leg-near" alt="Near Stride Leg">
            <img src="data:image/png;base64,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" class="rig-layer rig-side-upper" alt="Side-Profile Torso">
            <img src="data:image/png;base64,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D2x96kt/dMNtu95673Nf+fKDh//j7O3lxVaYri+H8uYbn1p/39v+1pf+02cm/cXlD9zz5rf8+isfm3lh4rHH1Ac/8YmY/LbMnP8Ods0KDvZRC2utmJ2dFfV6XQghusCL2etDf4xSHNj1dzcsLn176wE3uf+Gt22rvPLSkRvah4588V45EdaawbaHrX3z/r1707U7cPJHnPP/Z2mmsNbKffv2qX379qjXNnkIBI/tevu6PRRu+4P173nfn/3or37sj3/pU1suLSPKyfmfYDKFZVo++dBDevp7dB3Z3P3J+V/tR06D3McetW/PHpU/jpycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJycnJz/ofy/x6IfrV0q7B4AAAAASUVORK5CYII=" class="rig-layer rig-side-head" alt="Side-Profile Head">
          </div>
        </div>
      </div>
    </div>
    <div class="hud-meta">
      <div class="hud-top">
        <div class="brand-title">
          <span class="pulse-dot"></span>
          PromptSmith
        </div>
        <span class="license-badge ${isLicensed ? '' : 'trial'}">
          ${isLicensed ? 'PRO UNLOCKED' : remainingTrial + ' TRIES LEFT'}
        </span>
      </div>
      <div class="hud-sub">${mascotMessage}</div>
    </div>
  </div>

  <!-- Zero-Clutter Model Auto-Hook & Voice-to-Spec Dictation Bridge -->
  <div class="panel-box" style="border-color: rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.06);">
    <div class="panel-header">
      <span class="panel-label" style="color: #38bdf8;">
        Auto-Hook Model Bridge &amp; Voice-to-Spec
      </span>
      <span class="badge-pill pill-cyan">${detectedModelLabel}</span>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-top:4px;">
      <label style="display:inline-flex; align-items:center; gap:5px; font-size:9.5px; color:#e2e8f0; cursor:pointer;" title="Works alongside your active IDE model automatically without cluttering your screen">
        <input type="checkbox" id="chk-auto-hook" ${autoHookEnabled ? 'checked' : ''} onchange="toggleAutoHook(this.checked)" style="accent-color:#38bdf8; cursor:pointer;">
        <span>Auto-Hook Active Model (Zero-Clutter)</span>
      </label>
      <div style="display:flex; gap:4px;">
        <button class="pill-btn active" id="btn-voice-mic" onclick="startVoiceDictation()" title="Speak thoughts or voice commands directly">Voice Input</button>
        <button class="pill-btn" onclick="cleanVoiceNow()" title="Strip spoken filler words, resolve 'no wait' self-corrections, and format spoken code tokens">Clean Voice</button>
        <button class="pill-btn" onclick="saluteMascot()" title="Tip Hat & Salute">Salute</button>
        <button class="pill-btn" id="btn-stride-toggle" onclick="toggleMascotStride()" title="Toggle 90-degree side-profile stroll">Stroll: ON</button>
      </div>
    </div>
  </div>

  <!-- Quick Template Chips -->
  <div class="chips-bar">
    <button class="chip-btn" onclick="applyQuickPrompt('sys-design')">System Design</button>
    <button class="chip-btn" onclick="applyQuickPrompt('algo-proof')">Algorithmic Proof</button>
    <button class="chip-btn" onclick="applyQuickPrompt('ui-tokens')">UI Design Tokens</button>
    <button class="chip-btn" onclick="applyQuickPrompt('root-cause')">Root Cause Debug</button>
    <button class="chip-btn" onclick="applyQuickPrompt('age-10')">Explain Like I'm 10</button>
  </div>

  <!-- Adaptive Pattern Recognition HUD -->
  <div class="panel-box">
    <div class="panel-header">
      <span class="panel-label">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Cognitive Pattern Calibration
      </span>
      <span class="badge-pill pill-cyan">${cognitive.audienceLabel} &bull; ${metrics.detectedDomain}</span>
    </div>
    <div style="font-size: 9.5px; color: #94a3b8; margin-bottom: 4px;">
      Readability: <b>Grade ${cognitive.fleschKincaidGrade}</b> &bull; Bloom's Taxonomy: <b>${cognitive.bloomsLevel}</b>
    </div>
    <div class="button-group">
      <button class="pill-btn ${!activeAudience ? 'active' : ''}" onclick="setAudience('auto')">Auto-Detect</button>
      <button class="pill-btn ${activeAudience === 'explorer' ? 'active' : ''}" onclick="setAudience('explorer')">Explorer (All Ages)</button>
      <button class="pill-btn ${activeAudience === 'practitioner' ? 'active' : ''}" onclick="setAudience('practitioner')">Practitioner</button>
      <button class="pill-btn ${activeAudience === 'architect' ? 'active' : ''}" onclick="setAudience('architect')">Staff Architect</button>
      <button class="pill-btn ${activeAudience === 'executive' ? 'active' : ''}" onclick="setAudience('executive')">Executive ROI</button>
    </div>
  </div>

  <!-- Omni-Disciplinary Equalizer (Level the Playing Field) -->
  <div class="panel-box">
    <div class="panel-header">
      <span class="panel-label">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
        Omni-Disciplinary Equalizer
      </span>
      <span class="badge-pill pill-emerald">${equalizerProf.title}</span>
    </div>
    <div class="button-group">
      <button class="pill-btn ${!activeDiscipline ? 'active' : ''}" onclick="setDiscipline('auto')">Auto</button>
      <button class="pill-btn ${activeDiscipline === 'architect' ? 'active' : ''}" onclick="setDiscipline('architect')">Systems Architect</button>
      <button class="pill-btn ${activeDiscipline === 'designer' ? 'active' : ''}" onclick="setDiscipline('designer')">UI/UX Designer</button>
      <button class="pill-btn ${activeDiscipline === 'analyst' ? 'active' : ''}" onclick="setDiscipline('analyst')">Data Analyst</button>
      <button class="pill-btn ${activeDiscipline === 'creator' ? 'active' : ''}" onclick="setDiscipline('creator')">Everyday Creator</button>
    </div>
  </div>

  <!-- Autonomous Lateral Brainstormer -->
  <div class="panel-box" style="border-color: rgba(168, 85, 247, 0.3);">
    <div class="panel-header">
      <span class="panel-label" style="color: #c084fc;">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Autonomous Lateral Brainstormer
      </span>
      <span class="badge-pill pill-purple">Transcend Consensus</span>
    </div>
    <div class="vectors-grid">
      <div class="vector-pill" onclick="selectVector('inversion')" title="Asymmetric Inversion: Forbid conventional CRUD/cache">
        <div class="v-title">Vector A</div>
        <div class="v-desc">Inversion</div>
      </div>
      <div class="vector-pill" onclick="selectVector('bisociation')" title="Bisociation: Cross-domain biological/physics synthesis">
        <div class="v-title">Vector B</div>
        <div class="v-desc">Bisociation</div>
      </div>
      <div class="vector-pill" onclick="selectVector('transcendence')" title="Transcendence: Zero-state edge mathematical determinism">
        <div class="v-title">Vector C</div>
        <div class="v-desc">Transcendence</div>
      </div>
    </div>
    <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
      <button class="pill-btn" onclick="triggerBrainstorm()" style="background: rgba(168, 85, 247, 0.2); border-color: rgba(168, 85, 247, 0.5); color: #fff; font-weight: 700;">
        Synthesize Lateral Blueprint &rarr;
      </button>
    </div>
  </div>

  <!-- Multi-Model Target Selector & Benchmark Suite -->
  <div class="panel-box">
    <div class="category-tabs">
      <button class="cat-tab-btn active" id="tab-models" onclick="switchCategory('models')">Frontier Models (8)</button>
      <button class="cat-tab-btn" id="tab-bots" onclick="switchCategory('bots')">Coding Bots (7)</button>
      <button class="cat-tab-btn" id="tab-future" onclick="switchCategory('future')">Next-Gen AI (4)</button>
    </div>

    <!-- Models Grid -->
    <div class="targets-scroll-grid" id="grid-models">
      ${modelTargets.map(t => {
        const scoreClass = t.compatibilityScore >= 85 ? "score-green" : t.compatibilityScore >= 70 ? "score-yellow" : "";
        const isActive = activeProfile === t.profileKey;
        return `
        <div class="target-card ${isActive ? 'active' : ''}" onclick="selectTarget('${t.profileKey}')">
          <div class="t-top">
            <span>${t.name}</span>
            <span class="t-score ${scoreClass}">${t.compatibilityScore}%</span>
          </div>
          <div class="t-bottom">
            <span>${t.provider}</span>
            <span>${t.latencyRating}</span>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Bots Grid -->
    <div class="targets-scroll-grid" id="grid-bots" style="display:none;">
      ${botTargets.map(t => {
        const scoreClass = t.compatibilityScore >= 85 ? "score-green" : t.compatibilityScore >= 70 ? "score-yellow" : "";
        const isActive = activeProfile === t.profileKey;
        return `
        <div class="target-card ${isActive ? 'active' : ''}" onclick="selectTarget('${t.profileKey}')">
          <div class="t-top">
            <span>${t.name}</span>
            <span class="t-score ${scoreClass}">${t.compatibilityScore}%</span>
          </div>
          <div class="t-bottom">
            <span>${t.provider}</span>
            <span>${t.latencyRating}</span>
          </div>
        </div>`;
      }).join('')}
    </div>

    <!-- Future AI Grid -->
    <div class="targets-scroll-grid" id="grid-future" style="display:none;">
      ${futureTargets.map(t => {
        const scoreClass = t.compatibilityScore >= 85 ? "score-green" : t.compatibilityScore >= 70 ? "score-yellow" : "";
        const isActive = activeProfile === t.profileKey;
        return `
        <div class="target-card ${isActive ? 'active' : ''}" onclick="selectTarget('${t.profileKey}')">
          <div class="t-top">
            <span>${t.name}</span>
            <span class="t-score ${scoreClass}">${t.compatibilityScore}%</span>
          </div>
          <div class="t-bottom">
            <span>${t.provider}</span>
            <span>${t.latencyRating}</span>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Curated Workspace Grounder & Rules Scrubber -->
  <div class="panel-box" style="border-color: rgba(16, 185, 129, 0.3);">
    <div class="panel-header">
      <span class="panel-label" style="color: var(--emerald);">
        Workspace Context Grounder &amp; Rules Exporter
      </span>
      <span class="badge-pill pill-emerald">${wsContext.workspaceName}</span>
    </div>
    <div style="font-size: 9.5px; color: #94a3b8; margin-bottom: 6px;">
      Active: <b>${wsContext.activeFileRelative}</b> (${wsContext.languageId}) &bull; Stack: <b>${wsContext.detectedStack.slice(0, 4).join(", ") || "Auto"}</b>
    </div>
    <div class="button-group">
      <button class="pill-btn active" onclick="groundWorkspaceNow()" title="Inject verified project stack &amp; active file symbols">+ Ground Stack</button>
      <button class="pill-btn active" onclick="groundDiagnosticsNow()" style="border-color:rgba(245,158,11,0.45); color:#fbbf24;" title="Pull active IDE compiler/linter errors directly into your prompt">+ Ground Errors</button>
      <button class="pill-btn" onclick="exportRules('.cursorrules')" title="Write compacted .cursorrules to workspace root">Export .cursorrules</button>
      <button class="pill-btn" onclick="exportRules('CLAUDE.md')" title="Write compacted CLAUDE.md to workspace root">Export CLAUDE.md</button>
      <button class="pill-btn" onclick="exportRules('.github/copilot-instructions.md')" title="Write compacted .github/copilot-instructions.md">Export Copilot Rules</button>
      <button class="pill-btn" onclick="exportRules('.windsurfrules')" title="Write compacted .windsurfrules to workspace root">Export .windsurfrules</button>
    </div>
  </div>

  ${secretFindings.length > 0 ? `
  <!-- Pre-Flight Secret & Credential Leak Guard -->
  <div class="panel-box" style="border-color: rgba(244, 63, 94, 0.55); background: rgba(244, 63, 94, 0.08);">
    <div class="panel-header">
      <span class="panel-label" style="color: #fda4af;">
        Pre-Flight Secret Guard (${secretFindings.reduce((acc, s) => acc + s.count, 0)} Credential Leak Risk)
      </span>
      <button class="mode-btn active" onclick="scrubSecretsNow()" style="background:#e11d48; border-color:#fb7185; font-weight:700;">Scrub Secrets</button>
    </div>
    <div style="font-size:9.5px; color:#fecdd3;">
      Detected: ${secretFindings.map(s => `<b>${s.count}x ${s.label}</b>`).join(', ')}
    </div>
  </div>
  ` : ''}

  ${secretFindings.length > 0 ? `
  <!-- Pre-Flight Secret & Credential Leak Guard -->
  <div class="panel-box" style="border-color: rgba(244, 63, 94, 0.55); background: rgba(244, 63, 94, 0.08);">
    <div class="panel-header">
      <span class="panel-label" style="color: #fda4af;">
        Pre-Flight Secret Guard (${secretFindings.reduce((acc, s) => acc + s.count, 0)} Credential Risk)
      </span>
      <button class="mode-btn active" onclick="scrubSecretsNow()" style="background:#e11d48; border-color:#fb7185; font-weight:700;">Scrub Secrets</button>
    </div>
    <div style="font-size:9.5px; color:#fecdd3;">
      Detected: ${secretFindings.map(s => `<b>${s.count}x ${s.label}</b>`).join(', ')}
    </div>
  </div>
  ` : ''}

  ${ambiguities.length > 0 ? `
  <!-- Pre-Flight Ambiguity & Missing Constraint Linter -->
  <div class="panel-box" style="border-color: rgba(245, 158, 11, 0.35);">
    <div class="panel-header">
      <span class="panel-label" style="color: var(--amber);">
        Pre-Flight Ambiguity Linter (${ambiguities.length} Detected)
      </span>
      <span class="badge-pill" style="background:rgba(245,158,11,0.15); color:var(--amber); border:1px solid rgba(245,158,11,0.3);">1-Click Fix</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:4px;">
      ${ambiguities.map(a => `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:rgba(255,255,255,0.02); padding:4px 6px; border-radius:4px; border:1px solid rgba(255,255,255,0.06);">
          <span style="font-size:9.5px; color:#e2e8f0;"><b style="color:var(--amber);">[${a.severity}]</b> ${a.label}</span>
          <button class="mode-btn active" onclick='applyFix(${JSON.stringify(a.fixSnippet)})' style="white-space:nowrap;">+ Inject Guard</button>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Real-Time Token & 20-Turn Cost Telemetry Strip -->
  <div class="telemetry-strip" style="flex-wrap:wrap; gap:6px;">
    <span>Compression: <span class="telemetry-val" style="color:var(--emerald); font-weight:800;">-${metrics.tokenSavingsPercent}%</span></span>
    <span>Signal: <span class="telemetry-val" style="color:#38bdf8; font-weight:800;">${metrics.iqScore}/100</span></span>
    <span>20-Turn Saved: <span class="telemetry-val" style="color:var(--emerald); font-weight:800;">${costSim.cumulativeTokensSaved.toLocaleString()} tok (~$${costSim.openaiO3SavedUsd})</span></span>
    <span>Tokens: <span class="telemetry-val" id="cnt-tokens">0</span></span>
  </div>

  <!-- Direct Input Draft Box -->
  <div class="view-mode-bar">
    <span class="panel-label" style="font-size: 10px; color: #38bdf8;">
      Input Draft (Type, Paste, or Select in Editor + Alt+P)
    </span>
    <button class="mode-btn active" onclick="optimizeNow()" style="background:linear-gradient(135deg,#0284c7,#0369a1); border-color:#38bdf8; font-weight:700; padding:3px 10px;">
      Optimize Prompt &rarr;
    </button>
  </div>
  <div class="editor-wrapper" style="margin-bottom: 8px;">
    <textarea id="input-box" class="prompt-editor" style="min-height: 68px; max-height: 150px;" placeholder="Type or paste your raw prompt here, or highlight text in any code file and press Alt+P...">${(originalPrompt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
  </div>

  <!-- View Mode Switcher & Compiled Blueprint -->
  <div class="view-mode-bar">
    <span class="panel-label" style="font-size: 10px; color: #fff;">
      Compiled Prompt Blueprint
    </span>
    <div class="mode-switch-btns">
      <button class="mode-btn active" id="btn-mode-compiled" onclick="switchViewMode('compiled')">Blueprint</button>
      <button class="mode-btn" id="btn-mode-diff" onclick="switchViewMode('diff')">Live Diff</button>
    </div>
  </div>

  <div class="editor-wrapper">
    <textarea id="output-box" class="prompt-editor" oninput="updateLiveCounters()" placeholder="Your structured, high-density prompt blueprint will appear here...">${(enhancedPrompt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
    <div id="diff-box" class="diff-viewport"></div>
  </div>

  <!-- Action Buttons Row -->
  <div class="action-row">
    <button class="btn-primary" onclick="optimizeNow()" title="Compile and structure the Input Draft">
      Optimize
    </button>
    <button class="btn-secondary" id="btn-copy" onclick="copyToClipboard()" title="Copy Blueprint to Clipboard">Copy</button>
    <button class="btn-secondary" onclick="applyToEditor()" title="Insert Blueprint into Active Editor">Insert</button>
    <button class="btn-secondary" onclick="scrubSecretsNow()" title="Redact exposed API keys, tokens, and passwords">Scrub</button>
  </div>

  ${historyVault.length > 0 ? `
  <!-- Local Recent Prompts Vault -->
  <div class="panel-box" style="border-color: rgba(56, 189, 248, 0.22);">
    <div class="panel-header">
      <span class="panel-label" style="color: #94a3b8;">
        Recent Prompts Vault (${historyVault.length})
      </span>
      <button class="pill-btn" onclick="clearHistoryVault()" style="font-size:8.5px; padding:1px 6px;">Clear</button>
    </div>
    <div style="display:flex; flex-direction:column; gap:4px; max-height:95px; overflow-y:auto;">
      ${historyVault.map((h, idx) => `
        <div onclick="loadHistoryItem(${idx})" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:6px; padding:4px 6px; border-radius:4px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);">
          <span style="font-size:9.5px; color:#cbd5e1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:190px;">${h.raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
          <span style="font-size:8.5px; color:#38bdf8; font-family:var(--font-mono); text-transform:uppercase;">${h.target}</span>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Pro Passkey ($9/mo or $10 Passkey) -->
  <div class="pro-box">
    <div>
      <div class="pro-title">PromptSmith Pro ($9/mo or $10 Passkey)</div>
      <div class="pro-meta">Unlimited offline optimizations &amp; 19-target benchmarks.</div>
    </div>
    ${!isLicensed ? `<div style="display:flex; gap:5px;"><button class="btn-sub" onclick="openCheckout()">Get Passkey</button><button class="btn-secondary" style="padding:4px 8px; font-size:9.5px;" onclick="enterPasskey()">Enter Key</button></div>` : '<span style="color:var(--emerald); font-weight:800; font-family:var(--font-mono); font-size:10px;">ACTIVE PRO PASSKEY</span>'}
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const originalText = ${JSON.stringify(originalPrompt)};

    function getDraftText() {
      const inp = document.getElementById('input-box');
      const out = document.getElementById('output-box');
      return (inp && inp.value.trim()) ? inp.value.trim() : ((out && out.value.trim()) ? out.value.trim() : '');
    }

    function optimizeNow() {
      pulseMascotForge(850);
      const text = getDraftText();
      vscode.postMessage({ command: "optimizeInput", text });
    }

    function groundWorkspaceNow() {
      vscode.postMessage({ command: "groundWorkspace", text: getDraftText() });
    }

    function groundDiagnosticsNow() {
      vscode.postMessage({ command: "groundDiagnostics", text: getDraftText() });
    }

    function exportRules(targetFile) {
      const compiled = document.getElementById("output-box").value || "";
      vscode.postMessage({ command: "exportRulesFile", targetFile, text: getDraftText(), compiled });
    }

    function applyFix(fixSnippet) {
      vscode.postMessage({ command: "applyAmbiguityFix", fixSnippet, text: getDraftText() });
    }

    function scrubSecretsNow() {
      vscode.postMessage({ command: "scrubSecrets", text: getDraftText() });
    }

    function cleanVoiceNow() {
      vscode.postMessage({ command: "cleanVoiceStream", text: getDraftText() });
    }

    function toggleAutoHook(enabled) {
      vscode.postMessage({ command: "toggleAutoHook", enabled });
    }

    function loadHistoryItem(index) {
      vscode.postMessage({ command: "loadHistoryItem", index });
    }

    function clearHistoryVault() {
      vscode.postMessage({ command: "clearHistoryVault" });
    }

    // Dual-Pose Mascot Side-Profile Stroll + Front-Facing Forge & Hat-Tip Salute
    let isPatrolling = true;
    let isHoverPaused = false;
    let patrolX = 0;
    let patrolDir = 1;
    function stepMascotPatrol() {
      const stage = document.getElementById("mascot-drag-target");
      const facing = document.getElementById("mascot-facing");
      if (isPatrolling && !isHoverPaused && stage && !isDragging) {
        patrolX += patrolDir * 0.48;
        if (patrolX > 14) {
          patrolDir = -1;
          if (facing) facing.classList.add("flip-left");
        } else if (patrolX < -8) {
          patrolDir = 1;
          if (facing) facing.classList.remove("flip-left");
        }
        stage.style.transform = "translateX(" + patrolX.toFixed(1) + "px)";
      }
      requestAnimationFrame(stepMascotPatrol);
    }
    requestAnimationFrame(stepMascotPatrol);

    const hudHoverTarget = document.getElementById("mascot-drag-target");
    if (hudHoverTarget) {
      hudHoverTarget.addEventListener("mouseenter", function() {
        isHoverPaused = true;
        const rig = document.getElementById("mascot-svg-rig");
        const facing = document.getElementById("mascot-facing");
        if (facing) facing.classList.remove("flip-left");
        if (rig && isPatrolling) {
          rig.classList.remove("rig-state-walking", "rig-state-forging");
          rig.classList.add("rig-state-salute");
          setTimeout(function() {
            if (isHoverPaused && rig) {
              rig.classList.remove("rig-state-salute");
              rig.classList.add("rig-state-idle");
            }
          }, 1300);
        }
      });
      hudHoverTarget.addEventListener("mouseleave", function() {
        isHoverPaused = false;
        const rig = document.getElementById("mascot-svg-rig");
        const facing = document.getElementById("mascot-facing");
        if (rig && isPatrolling) {
          if (facing) facing.classList.toggle("flip-left", patrolDir < 0);
          rig.classList.remove("rig-state-idle", "rig-state-salute");
          rig.classList.add("rig-state-walking");
        }
      });
    }

    function pulseMascotForge(ms) {
      const rig = document.getElementById("mascot-svg-rig");
      const facing = document.getElementById("mascot-facing");
      if (!rig) return;
      isHoverPaused = true;
      if (facing) facing.classList.remove("flip-left");
      rig.classList.remove("rig-state-idle", "rig-state-walking", "rig-state-salute");
      rig.classList.add("rig-state-forging");
      setTimeout(function() {
        isHoverPaused = false;
        rig.classList.remove("rig-state-forging");
        if (facing && isPatrolling) facing.classList.toggle("flip-left", patrolDir < 0);
        rig.classList.add(isPatrolling ? "rig-state-walking" : "rig-state-idle");
      }, ms || 800);
    }

    function saluteMascot() {
      const rig = document.getElementById("mascot-svg-rig");
      const facing = document.getElementById("mascot-facing");
      if (!rig) return;
      isHoverPaused = true;
      if (facing) facing.classList.remove("flip-left");
      rig.classList.remove("rig-state-idle", "rig-state-walking", "rig-state-forging");
      rig.classList.add("rig-state-salute");
      setTimeout(function() {
        isHoverPaused = false;
        rig.classList.remove("rig-state-salute");
        if (facing && isPatrolling) facing.classList.toggle("flip-left", patrolDir < 0);
        rig.classList.add(isPatrolling ? "rig-state-walking" : "rig-state-idle");
      }, 1350);
    }

    function toggleMascotStride() {
      isPatrolling = !isPatrolling;
      isHoverPaused = false;
      const rig = document.getElementById("mascot-svg-rig");
      const facing = document.getElementById("mascot-facing");
      const btn = document.getElementById("btn-stride-toggle");
      if (rig) {
        rig.classList.remove("rig-state-salute", "rig-state-forging");
        rig.classList.toggle("rig-state-walking", isPatrolling);
        rig.classList.toggle("rig-state-idle", !isPatrolling);
      }
      if (facing) {
        facing.classList.toggle("flip-left", isPatrolling && patrolDir < 0);
      }
      if (btn) {
        btn.textContent = isPatrolling ? "Stroll: ON" : "Stroll: IDLE";
      }
    }

    // Voice Dictation (Web Speech API + OS Voice Typing Fallback)
    let wvSpeechRec = null;
    let wvListening = false;
    function startVoiceDictation() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const inp = document.getElementById("input-box");
      const btn = document.getElementById("btn-voice-mic");
      if (!SpeechRecognition) {
        if (inp) {
          inp.focus();
          inp.placeholder = "Voice Mode Active: Speak using OS Dictation (Win+H or Fn+Fn), then click Clean Voice...";
        }
        vscode.postMessage({ command: "cleanVoiceStream", text: getDraftText() });
        return;
      }
      if (wvListening && wvSpeechRec) {
        wvSpeechRec.stop();
        return;
      }
      wvSpeechRec = new SpeechRecognition();
      wvSpeechRec.continuous = true;
      wvSpeechRec.interimResults = true;
      wvSpeechRec.lang = "en-US";
      const startDraft = inp && inp.value ? inp.value.trim() + " " : "";
      wvSpeechRec.onstart = function() {
        wvListening = true;
        if (btn) btn.textContent = "Listening...";
      };
      wvSpeechRec.onresult = function(ev) {
        let t = "";
        for (let i = 0; i < ev.results.length; i++) {
          t += ev.results[i][0].transcript;
        }
        if (inp) inp.value = startDraft + t;
      };
      wvSpeechRec.onend = function() {
        wvListening = false;
        if (btn) btn.textContent = "Voice Input";
        vscode.postMessage({ command: "cleanVoiceStream", text: getDraftText() });
      };
      wvSpeechRec.start();
    }

    function scrubSecretsNow() {
      vscode.postMessage({ command: "scrubSecrets", text: getDraftText() });
    }

    function loadHistoryItem(index) {
      vscode.postMessage({ command: "loadHistoryItem", index });
    }

    function clearHistoryVault() {
      vscode.postMessage({ command: "clearHistoryVault", text: getDraftText() });
    }

    function switchCategory(cat) {
      document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('grid-models').style.display = 'none';
      document.getElementById('grid-bots').style.display = 'none';
      document.getElementById('grid-future').style.display = 'none';

      if (cat === 'models') {
        document.getElementById('tab-models').classList.add('active');
        document.getElementById('grid-models').style.display = 'grid';
      } else if (cat === 'bots') {
        document.getElementById('tab-bots').classList.add('active');
        document.getElementById('grid-bots').style.display = 'grid';
      } else {
        document.getElementById('tab-future').classList.add('active');
        document.getElementById('grid-future').style.display = 'grid';
      }
    }

    function switchViewMode(mode) {
      const editor = document.getElementById('output-box');
      const diffBox = document.getElementById('diff-box');
      const btnCompiled = document.getElementById('btn-mode-compiled');
      const btnDiff = document.getElementById('btn-mode-diff');

      if (mode === 'diff') {
        btnDiff.classList.add('active');
        btnCompiled.classList.remove('active');
        editor.style.display = 'none';
        diffBox.style.display = 'block';
        renderInteractiveDiff();
      } else {
        btnCompiled.classList.add('active');
        btnDiff.classList.remove('active');
        editor.style.display = 'block';
        diffBox.style.display = 'none';
      }
    }

    function renderInteractiveDiff() {
      const diffBox = document.getElementById('diff-box');
      const orig = getDraftText() || originalText || "";
      const enh = document.getElementById('output-box').value || "";

      let html = '<div style="margin-bottom:8px; font-weight:700; color:#38bdf8;">[INTERACTIVE RECONSTRUCTION LOG]</div>';
      html += '<div style="margin-bottom:6px;"><span class="diff-del">Original (' + orig.length + ' chars)</span> &rarr; <span class="diff-add">PromptSmith Enhanced (' + enh.length + ' chars)</span></div>';
      html += '<div style="padding:6px; background:rgba(255,255,255,0.02); border-radius:4px; border:1px solid rgba(255,255,255,0.06); white-space:pre-wrap;">' + enh.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
      diffBox.innerHTML = html;
    }

    function applyQuickPrompt(type) {
      let t = "";
      if (type === 'sys-design') t = "Design a high-throughput, horizontally partitioned event stream processing system handling 100k msg/sec with sub-millisecond p99 latency.";
      else if (type === 'algo-proof') t = "Formally prove the correctness and O(1) memory invariant of this distributed raft consensus state machine.";
      else if (type === 'ui-tokens') t = "Create a 2027 design system tokens schema supporting high-contrast accessibility (WCAG AAA), spring physics, and fluid typography.";
      else if (type === 'root-cause') t = "Perform root cause analysis on an intermittent deadlock occurring during simultaneous SQLite WAL checkpointing and IPC reads.";
      else if (type === 'age-10') t = "Explain quantum entanglement using an intuitive analogy with paired magical walkie-talkies that anyone can understand.";

      document.getElementById('input-box').value = t;
      vscode.postMessage({ command: "optimizeInput", text: t });
    }

    function triggerBrainstorm() {
      vscode.postMessage({ command: "triggerBrainstorm", text: getDraftText() });
    }

    function selectVector(vectorId) {
      vscode.postMessage({ command: "selectVector", vectorId, text: getDraftText() });
    }

    function setDiscipline(discipline) {
      vscode.postMessage({ command: "changeDiscipline", discipline, text: getDraftText() });
    }

    function setAudience(audience) {
      vscode.postMessage({ command: "changeAudience", audience, text: getDraftText() });
    }

    function updateLiveCounters() {
      const text = document.getElementById("output-box").value || getDraftText() || "";
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const tokens = Math.ceil(words * 1.33);
      document.getElementById("cnt-tokens").textContent = tokens;
    }

    function selectTarget(profile) {
      vscode.postMessage({ command: "changeProfile", profile, text: getDraftText() });
    }

    function applyToEditor() {
      const text = document.getElementById("output-box").value || getDraftText();
      vscode.postMessage({ command: "insert", text });
    }

    function copyToClipboard() {
      const text = document.getElementById("output-box").value || getDraftText();
      vscode.postMessage({ command: "copy", text });
      const btn = document.getElementById("btn-copy");
      if (btn) {
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy"; }, 1600);
      }
    }

    function openCheckout() {
      vscode.postMessage({ command: "openCheckout" });
    }

    function enterPasskey() {
      vscode.postMessage({ command: "enterPasskey" });
    }

    // Draggable Mascot Handler
    const mascotTarget = document.getElementById("mascot-drag-target");
    const hudContainer = document.getElementById("draggable-hud");
    let isDragging = false, startX = 0, startY = 0, initialX = 0, initialY = 0;

    const savedState = vscode.getState();
    if (savedState && savedState.posX !== undefined) {
      initialX = savedState.posX;
      initialY = savedState.posY;
      hudContainer.style.transform = "translate(" + initialX + "px, " + initialY + "px)";
    }

    mascotTarget.addEventListener("mousedown", dragStart);
    mascotTarget.addEventListener("touchstart", dragStart, { passive: false });

    function dragStart(e) {
      isDragging = true;
      const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
      startX = clientX - initialX;
      startY = clientY - initialY;
      document.addEventListener("mousemove", dragMove);
      document.addEventListener("mouseup", dragEnd);
      document.addEventListener("touchmove", dragMove, { passive: false });
      document.addEventListener("touchend", dragEnd);
    }

    function dragMove(e) {
      if (!isDragging) return;
      if (e.type === "touchmove") e.preventDefault();
      const currentX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX;
      const currentY = (e.type === "touchmove") ? e.touches[0].clientY : e.clientY;
      initialX = currentX - startX;
      initialY = currentY - startY;
      hudContainer.style.transform = "translate(" + initialX + "px, " + initialY + "px)";
    }

    function dragEnd() {
      isDragging = false;
      document.removeEventListener("mousemove", dragMove);
      document.removeEventListener("mouseup", dragEnd);
      document.removeEventListener("touchmove", dragMove);
      document.removeEventListener("touchend", dragEnd);
      vscode.setState({ posX: initialX, posY: initialY });
    }

    updateLiveCounters();
  </script>
</body>
</html>`;
  }
}
