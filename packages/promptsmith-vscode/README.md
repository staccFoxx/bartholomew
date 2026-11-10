<p align="center">
  <img src="https://bartholomew.info/assets/promptsmith_mascot.png" width="140" height="140" alt="PromptSmith Mascot" />
</p>

<h1 align="center">PromptSmith (v2.4.2)</h1>

<p align="center">
  <strong>Zero-Clutter Model Auto-Hook, Voice-to-Spec Dictation Refiner, Live Compiler Error Grounding, and Deterministic Prompt Optimizer for Cursor, Windsurf, Claude Code, Copilot, and VS Code.</strong>
</p>

<p align="center">
  <a href="https://open-vsx.org/extension/bartholomew/promptsmith-ai"><img src="https://img.shields.io/badge/Open--VSX-v2.4.2-blue.svg?style=flat-square" alt="Open-VSX" /></a>
  <a href="https://bartholomew.info/promptsmith.html"><img src="https://img.shields.io/badge/Web_Studio-Live-gold.svg?style=flat-square" alt="Web Studio" /></a>
  <a href="https://bartholomew.info/demo.html"><img src="https://img.shields.io/badge/Interactive_Demo-45s_Walkthrough-cyan.svg?style=flat-square" alt="Interactive Demo" /></a>
  <a href="https://bartholomew.info/checkout/promptsmith"><img src="https://img.shields.io/badge/Passkey-$9/mo_or_$10-success.svg?style=flat-square" alt="Stripe Passkey" /></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" /></a>
</p>

---

## Overview

PromptSmith is an in-editor prompt structuring engine, voice-to-spec compiler, and workspace companion designed to maximize the first-pass accuracy and token efficiency of frontier AI models.

When developers write raw prompts or dictate spoken thoughts, models spend self-attention capacity deciphering conversational filler, mid-sentence self-corrections, or ungrounded error references. PromptSmith compiles raw drafts or voice streams into structured, high-density specifications tailored to **Anthropic Claude 3.7 / 3.5 Sonnet**, **OpenAI o3 / o1**, **GPT-4o**, **Google Gemini 2.0**, **DeepSeek R1**, and coding agents (**Cursor Composer**, **Windsurf Cascade**, **Claude Code**, **GitHub Copilot**, **Cline**).

---

## Key Capabilities in v2.4.2

### 1. Zero-Clutter Model Auto-Hook Bridge (`detectActiveModelHook`)
PromptSmith automatically detects which AI environment you are running inside (**Cursor**, **Windsurf**, **Antigravity**, **Claude Code**, **GitHub Copilot**, or **Cline**) on startup. When **Auto-Hook Active Model** is enabled, every optimized prompt is automatically copied to your clipboard and synced to your active model's native instruction file without cluttering your editor.

### 2. Voice-to-Spec Dictation & Spoken-Thought Refiner (`compileVoiceTranscript`)
Built for developers who use voice dictation (Web Speech API, Windows `Win+H`, macOS Dictation, Wispr Flow, or Superwhisper):
- **Mid-Sentence Self-Correction Resolution**: Automatically resolves spoken backtracking such as `"use Express, no wait actually use FastAPI"` into `"use FastAPI"`.
- **Spoken Syntax & Casing Formatting**: Converts `"snake case user id"` to `user_id`, `"camel case fetch token"` to `fetchToken`, `"dot env"` to `.env`, and `"fat arrow"` to `=>`.
- **Spoken Command Detection**: Trailing voice commands like `"PromptSmith optimize for Claude"` automatically switch the target profile and compile.

### 3. Live IDE Compiler & Linter Error Grounding (`+ Ground Errors`)
Pulls active red squiggles (`vscode.languages.getDiagnostics()` across open files) plus your active `git diff --stat` summary directly into your prompt specification so your AI model fixes the exact line and compiler error on the first turn.

### 4. Pre-Flight Secret Scrubber
Scans your draft in real time for exposed OpenAI, Anthropic, Stripe, GitHub (`ghp_...`), Google Cloud (`AIza...`), AWS (`AKIA...`), and PEM private keys—letting you redact them in one click before they ever reach a third-party model API.

### 5. 1-Click Agent Rule Exporter
Export any compiled blueprint directly to `.cursorrules`, `.windsurfrules`, `CLAUDE.md`, or `.github/copilot-instructions.md`.

### 6. Dual-Pose Gentleman Companion
Includes an interactive, non-intrusive Gentleman companion in the HUD that strolls in a **90-degree side-profile with his white-gloved hands clasped behind his back**, pauses to tip his top hat and salute when hovered, and turns front-facing to strike his gold `>_` hammer when compiling a prompt.

<p align="center">
  <img src="https://bartholomew.info/assets/promptsmith_screenshot.png" width="100%" alt="PromptSmith Studio and Model Benchmark Matrix" />
</p>

---

## Quick Start

1. Install the extension from the Open VSX Registry, VS Code Marketplace, or `.vsix` package.
2. Open the **PromptSmith** sidebar from the Activity Bar, or press `Alt+Shift+P` (`Cmd+Shift+P` on macOS).
3. Type or dictate a thought into the **Input Draft** box, click **+ Ground Workspace** or **+ Ground Errors** if desired, and click **Optimize**.
4. Export to `.cursorrules` / `CLAUDE.md` / `.github/copilot-instructions.md` or paste directly into your AI chat.

---

## License & Passkey Unlock

PromptSmith includes **10 free in-editor optimizations** out of the box. Unlimited offline optimizations and multi-model benchmarking can be unlocked with a **Developer Pro** subscription (**$9 / month**) or a **$10 One-Time Passkey** via Stripe at [bartholomew.info/checkout/promptsmith](https://bartholomew.info/checkout/promptsmith).

Licensed under the MIT License. Maintained by [Bartholomew](https://bartholomew.info).
