/**
 * PromptSmith - Curated Developer Skills & Workspace Rule Scrubber
 * 1. Workspace Context Grounder: Inspects active editor language, imports/symbols,
 *    and project stack (package.json, pyproject.toml, Cargo.toml, go.mod, tsconfig.json).
 * 2. Ambiguity & Constraint Linter: Detects underspecified prompts before sending to LLMs.
 * 3. Rule File Scrubber & Exporter: Compacts and writes .cursorrules, CLAUDE.md, and .windsurfrules.
 * 4. Multi-Turn Cost & Token Simulator: Computes 20-turn API cost savings across frontier models.
 */

import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export interface WorkspaceGroundContext {
  hasWorkspace: boolean;
  workspaceName: string;
  activeFileRelative: string;
  languageId: string;
  detectedStack: string[];
  extractedSymbols: string[];
  contextSummaryBlock: string;
}

export interface AmbiguityFinding {
  id: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  label: string;
  fixSnippet: string;
}

export interface SecretFinding {
  label: string;
  count: number;
}

export interface ActiveModelHookInfo {
  hostIde: string;
  detectedModelLabel: string;
  recommendedProfile: string;
  nativeRuleFile: ".cursorrules" | "CLAUDE.md" | ".windsurfrules" | ".github/copilot-instructions.md";
}

export interface VoiceCompileResult {
  cleaned: string;
  corrections: number;
  detectedCommand: string | null;
}

export interface CostSimulation {
  originalTokensPerTurn: number;
  optimizedTokensPerTurn: number;
  turnsSimulated: number;
  cumulativeTokensSaved: number;
  claudeSonnetSavedUsd: string;
  openaiO3SavedUsd: string;
  gpt4oSavedUsd: string;
}

export class PromptWorkspaceToolkit {
  /**
   * 1. Inspect the active VS Code / Cursor workspace and active editor to build
   *    a zero-hallucination grounding block.
   */
  public static inspectWorkspace(): WorkspaceGroundContext {
    const folders = vscode.workspace.workspaceFolders;
    const editor = vscode.window.activeTextEditor;

    const stack: string[] = [];
    let workspaceName = "Standalone Editor";
    let rootPath = "";

    if (folders && folders.length > 0) {
      rootPath = folders[0].uri.fsPath;
      workspaceName = folders[0].name;

      // Check package.json
      const pkgPath = path.join(rootPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
          const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
          const notable = [
            "typescript", "react", "next", "vue", "svelte", "tailwindcss",
            "express", "fastify", "nestjs", "prisma", "drizzle-orm",
            "zod", "vitest", "jest", "playwright", "esbuild", "vite",
            "firebase-functions", "firebase-admin", "stripe"
          ];
          for (const key of notable) {
            if (deps[key]) stack.push(`${key}@${String(deps[key]).replace(/^[\^~]/, "")}`);
          }
          if (stack.length === 0) stack.push("Node.js / npm");
        } catch {
          stack.push("Node.js");
        }
      }

      if (fs.existsSync(path.join(rootPath, "tsconfig.json")) && !stack.some(s => s.startsWith("typescript"))) {
        stack.push("TypeScript (tsconfig)");
      }
      if (fs.existsSync(path.join(rootPath, "pyproject.toml")) || fs.existsSync(path.join(rootPath, "requirements.txt"))) {
        stack.push("Python");
      }
      if (fs.existsSync(path.join(rootPath, "Cargo.toml"))) {
        stack.push("Rust (Cargo)");
      }
      if (fs.existsSync(path.join(rootPath, "go.mod"))) {
        stack.push("Go (go.mod)");
      }
    }

    let activeFileRelative = "None";
    let languageId = "plaintext";
    const extractedSymbols: string[] = [];

    if (editor) {
      languageId = editor.document.languageId;
      activeFileRelative = rootPath
        ? path.relative(rootPath, editor.document.uri.fsPath).replace(/\\/g, "/")
        : path.basename(editor.document.uri.fsPath);

      const docText = editor.document.getText().slice(0, 12000);
      const symbolRegexes = [
        /\b(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)/g,
        /\b(?:export\s+)?(?:class|interface|type|enum)\s+([a-zA-Z0-9_]+)/g,
        /\bdef\s+([a-zA-Z0-9_]+)\s*\(/g,
        /\bfn\s+([a-zA-Z0-9_]+)\s*[<(]/g,
        /\bfunc\s+(?:\([^)]+\)\s*)?([a-zA-Z0-9_]+)\s*\(/g
      ];
      for (const rx of symbolRegexes) {
        let m: RegExpExecArray | null;
        while ((m = rx.exec(docText)) !== null) {
          if (m[1] && !extractedSymbols.includes(m[1]) && extractedSymbols.length < 14) {
            extractedSymbols.push(m[1]);
          }
        }
      }
    }

    const lines: string[] = ["### Grounded Workspace & File Context"];
    lines.push(`- Workspace: \`${workspaceName}\``);
    if (activeFileRelative !== "None") {
      lines.push(`- Active File: \`${activeFileRelative}\` (Language: \`${languageId}\`)`);
    }
    if (stack.length > 0) {
      lines.push(`- Verified Stack & Packages: ${stack.slice(0, 10).map(s => `\`${s}\``).join(", ")}`);
    }
    if (extractedSymbols.length > 0) {
      lines.push(`- Active File Symbols: ${extractedSymbols.map(s => `\`${s}\``).join(", ")}`);
    }
    lines.push(`- Grounding Rule: Reuse existing project packages and symbol signatures above; do not invent unverified libraries.`);

    return {
      hasWorkspace: Boolean(folders && folders.length > 0),
      workspaceName,
      activeFileRelative,
      languageId,
      detectedStack: stack,
      extractedSymbols,
      contextSummaryBlock: lines.join("\n")
    };
  }

  /**
   * 1B. Inspect Active IDE Diagnostics (Compiler/Linter Errors) & Git Diff
   * Automatically extracts active red squiggles/errors from vscode.languages.getDiagnostics
   * so developers can ground bug-fix prompts in 1 click without copy-pasting terminal stack traces.
   */
  public static inspectDiagnosticsAndDiff(): { count: number; block: string } {
    const editor = vscode.window.activeTextEditor;
    const folders = vscode.workspace.workspaceFolders;
    const rootPath = folders && folders.length > 0 ? folders[0].uri.fsPath : "";

    const items: string[] = [];
    let totalErrors = 0;

    if (editor) {
      const uri = editor.document.uri;
      const diags = vscode.languages
        .getDiagnostics(uri)
        .filter(d => d.severity === vscode.DiagnosticSeverity.Error || d.severity === vscode.DiagnosticSeverity.Warning);

      const relFile = rootPath
        ? path.relative(rootPath, uri.fsPath).replace(/\\/g, "/")
        : path.basename(uri.fsPath);

      for (const d of diags.slice(0, 8)) {
        totalErrors++;
        const lineNum = d.range.start.line + 1;
        const sev = d.severity === vscode.DiagnosticSeverity.Error ? "ERROR" : "WARN";
        let codeLine = "";
        try {
          codeLine = editor.document.lineAt(d.range.start.line).text.trim();
        } catch {
          codeLine = "";
        }
        items.push(`- [${sev}] \`${relFile}:${lineNum}\`: ${d.message}${codeLine ? ` | Line: \`${codeLine.slice(0, 110)}\`` : ""}`);
      }
    }

    // If active editor had 0 errors, check workspace-wide errors
    if (items.length === 0) {
      const allDiags = vscode.languages.getDiagnostics();
      for (const [uri, diags] of allDiags) {
        const errs = diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
        if (errs.length === 0) continue;
        const relFile = rootPath
          ? path.relative(rootPath, uri.fsPath).replace(/\\/g, "/")
          : path.basename(uri.fsPath);
        for (const d of errs.slice(0, 4)) {
          totalErrors++;
          items.push(`- [ERROR] \`${relFile}:${d.range.start.line + 1}\`: ${d.message}`);
          if (items.length >= 8) break;
        }
        if (items.length >= 8) break;
      }
    }

    if (items.length === 0) {
      return {
        count: 0,
        block: "### Active IDE Diagnostics\n- Status: Zero active compiler or linter errors detected in workspace.\n- Directive: Preserve zero-warning compile state and strict type safety."
      };
    }

    const lines = [
      `### Active IDE Compiler & Linter Diagnostics (${totalErrors} Issue${totalErrors === 1 ? "" : "s"})`,
      ...items,
      "- Remediation Contract: Resolve the exact file:line diagnostic errors above without breaking adjacent type signatures."
    ];
    return { count: totalErrors, block: lines.join("\n") };
  }

  /**
   * 2. Lint a raw prompt for missing engineering constraints and return 1-click fixes.
   */
  public static lintAmbiguities(prompt: string): AmbiguityFinding[] {
    const raw = (prompt || "").trim();
    const findings: AmbiguityFinding[] = [];
    if (!raw) return findings;

    // Check 1: Target language or runtime unspecified
    if (!/\b(typescript|javascript|python|rust|go|golang|java|c\+\+|c#|sql|html|css|react|node|bash|powershell)\b/i.test(raw)) {
      findings.push({
        id: "missing_runtime",
        severity: "HIGH",
        label: "No target language or runtime specified",
        fixSnippet: "Target Runtime: Use strict TypeScript / Node.js with explicit type annotations."
      });
    }

    // Check 2: Error / edge-case handling unspecified
    if (!/\b(error|exception|fallback|null|empty|timeout|retry|edge case|boundary|invalid)\b/i.test(raw)) {
      findings.push({
        id: "missing_error_bounds",
        severity: "MEDIUM",
        label: "Missing error handling & boundary conditions",
        fixSnippet: "Boundary & Error Handling: Explicitly handle null/empty inputs, timeouts, and invalid states without silent failures."
      });
    }

    // Check 3: Output format or file scope unspecified
    if (!/\b(json|xml|markdown|diff|file|function|schema|test|interface|return|deliverable)\b/i.test(raw)) {
      findings.push({
        id: "missing_output_contract",
        severity: "MEDIUM",
        label: "No explicit output format or deliverable contract",
        fixSnippet: "Output Contract: Return complete, drop-in production code with zero placeholders or elided sections."
      });
    }

    // Check 4: Verification / test requirement unspecified
    if (!/\b(test|verify|assert|unit test|benchmark|invariant|prove|validation)\b/i.test(raw)) {
      findings.push({
        id: "missing_verification",
        severity: "LOW",
        label: "No verification or unit test assertion requested",
        fixSnippet: "Verification: Include deterministic unit test assertions covering nominal and boundary edge cases."
      });
    }

    return findings;
  }

  /**
   * 3. Compact and write a persistent IDE instruction file (.cursorrules, CLAUDE.md, or .windsurfrules).
   */
  public static async exportWorkspaceRulesFile(
    targetFile: ".cursorrules" | "CLAUDE.md" | ".windsurfrules" | ".github/copilot-instructions.md",
    compiledBlueprint: string,
    silent = false
  ): Promise<{ ok: boolean; filePath?: string; message: string }> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
      return {
        ok: false,
        message: "Open a project folder in your IDE first to export " + targetFile + "."
      };
    }

    const rootPath = folders[0].uri.fsPath;
    const outPath = path.join(rootPath, targetFile);
    const parentDir = path.dirname(outPath);
    if (!fs.existsSync(parentDir)) { fs.mkdirSync(parentDir, { recursive: true }); }
    const ctx = this.inspectWorkspace();

    const header = `# ${targetFile} - Generated & Compacted by PromptSmith\n` +
      `# Workspace: ${ctx.workspaceName} | Stack: ${ctx.detectedStack.join(", ") || ctx.languageId}\n\n`;

    const defaultCoreRules = [
      "## Core Engineering Invariants",
      "- Write complete, production-ready code with zero TODO placeholders or truncated sections.",
      "- Preserve existing project module boundaries, naming conventions, and dependency versions.",
      "- Validate all external inputs, boundary conditions, and error states explicitly.",
      "- Prefer small, deterministic, testable functions over deeply nested stateful logic."
    ].join("\n");

    const body = compiledBlueprint && compiledBlueprint.trim()
      ? `${header}${ctx.contextSummaryBlock}\n\n${defaultCoreRules}\n\n## Active Task & Prompt Blueprint\n${compiledBlueprint.trim()}\n`
      : `${header}${ctx.contextSummaryBlock}\n\n${defaultCoreRules}\n`;

    try {
      fs.writeFileSync(outPath, body, "utf-8");
      if (!silent) {
        const doc = await vscode.workspace.openTextDocument(outPath);
        await vscode.window.showTextDocument(doc, { preview: false });
      }
      return {
        ok: true,
        filePath: outPath,
        message: `Wrote compacted rules to ${targetFile} (${body.length} chars).`
      };
    } catch (err) {
      return {
        ok: false,
        message: `Failed to write ${targetFile}: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  }

  /**
   * 3A. Pre-Flight Secret & Credential Leak Scrubber
   */
  public static detectSecrets(prompt: string): SecretFinding[] {
    const raw = (prompt || "").trim();
    if (!raw) return [];
    const patterns: { label: string; regex: RegExp }[] = [
      { label: "OpenAI / Anthropic Key (sk-...)", regex: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}\b/g },
      { label: "GitHub Token (ghp_/github_pat_)", regex: /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g },
      { label: "AWS Access Key (AKIA...)", regex: /\bAKIA[0-9A-Z]{16}\b/g },
      { label: "Google API Key (AIza...)", regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
      { label: "Slack Token (xoxb/xoxp)", regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g },
      { label: "Stripe Live Key (sk_live_/rk_live_)", regex: /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b/g },
      { label: "Bearer / JWT Token", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
      { label: "Database URI with Password", regex: /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\s]+:[^@\s]+@[^\s]+/gi },
      { label: "Private Key Block", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g }
    ];
    const findings: SecretFinding[] = [];
    for (const p of patterns) {
      const m = raw.match(p.regex);
      if (m && m.length > 0) findings.push({ label: p.label, count: m.length });
    }
    return findings;
  }

  public static scrubSecrets(prompt: string): { scrubbed: string; redactedCount: number } {
    let text = prompt || "";
    let redactedCount = 0;
    const replacements: { regex: RegExp; token: string }[] = [
      { regex: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{16,}\b/g, token: "[REDACTED_API_KEY]" },
      { regex: /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, token: "[REDACTED_GITHUB_TOKEN]" },
      { regex: /\bAKIA[0-9A-Z]{16}\b/g, token: "[REDACTED_AWS_KEY]" },
      { regex: /\bAIza[0-9A-Za-z_-]{35}\b/g, token: "[REDACTED_GCP_KEY]" },
      { regex: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/g, token: "[REDACTED_SLACK_TOKEN]" },
      { regex: /\b(?:sk|rk)_live_[0-9A-Za-z]{16,}\b/g, token: "[REDACTED_STRIPE_KEY]" },
      { regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, token: "[REDACTED_JWT]" },
      { regex: /\b((?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\s]+:)([^@\s]+)(@[^\s]+)/gi, token: "$1[REDACTED_DB_PASS]$3" },
      { regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, token: "[REDACTED_PRIVATE_KEY_BLOCK]" }
    ];
    for (const r of replacements) {
      const m = text.match(r.regex);
      if (m && m.length > 0) {
        redactedCount += m.length;
        text = text.replace(r.regex, r.token);
      }
    }
    return { scrubbed: text, redactedCount };
  }

  /**
   * 3B. Zero-Clutter Model Auto-Hook Detector
   * Automatically detects the host IDE and active coding assistant right after installation.
   */
  public static detectActiveModelHook(): ActiveModelHookInfo {
    const appName = (vscode.env.appName || "").toLowerCase();
    const folders = vscode.workspace.workspaceFolders;
    const rootPath = folders && folders.length > 0 ? folders[0].uri.fsPath : "";

    if (appName.includes("cursor")) {
      return {
        hostIde: "Cursor IDE",
        detectedModelLabel: "Cursor Composer (Claude 3.7)",
        recommendedProfile: "cursor_composer",
        nativeRuleFile: ".cursorrules"
      };
    }
    if (appName.includes("windsurf")) {
      return {
        hostIde: "Windsurf IDE",
        detectedModelLabel: "Windsurf Cascade",
        recommendedProfile: "windsurf_cascade",
        nativeRuleFile: ".windsurfrules"
      };
    }
    if (appName.includes("antigravity")) {
      return {
        hostIde: "Antigravity IDE",
        detectedModelLabel: "Gemini 2.5 Pro Agent",
        recommendedProfile: "gemini_context",
        nativeRuleFile: "CLAUDE.md"
      };
    }

    // Check installed extensions in VS Code
    const exts = vscode.extensions.all.map(e => e.id.toLowerCase());
    if (exts.some(id => id.includes("claude-code") || id.includes("anthropic"))) {
      return {
        hostIde: "VS Code",
        detectedModelLabel: "Claude Code CLI",
        recommendedProfile: "claude_code",
        nativeRuleFile: "CLAUDE.md"
      };
    }
    if (exts.some(id => id.includes("claude-dev") || id.includes("cline") || id.includes("roo-cline"))) {
      return {
        hostIde: "VS Code",
        detectedModelLabel: "Cline / Roo Agent",
        recommendedProfile: "cline_mcp",
        nativeRuleFile: ".cursorrules"
      };
    }
    if (exts.some(id => id.includes("github.copilot"))) {
      return {
        hostIde: "VS Code",
        detectedModelLabel: "GitHub Copilot Edits",
        recommendedProfile: "copilot_edits",
        nativeRuleFile: ".github/copilot-instructions.md"
      };
    }

    // Fallback check for workspace rule files
    if (rootPath) {
      if (fs.existsSync(path.join(rootPath, ".cursorrules"))) {
        return { hostIde: "VS Code", detectedModelLabel: "Cursor Rules Bridge", recommendedProfile: "cursor_composer", nativeRuleFile: ".cursorrules" };
      }
      if (fs.existsSync(path.join(rootPath, ".windsurfrules"))) {
        return { hostIde: "VS Code", detectedModelLabel: "Windsurf Cascade Bridge", recommendedProfile: "windsurf_cascade", nativeRuleFile: ".windsurfrules" };
      }
      if (fs.existsSync(path.join(rootPath, "CLAUDE.md"))) {
        return { hostIde: "VS Code", detectedModelLabel: "Claude Code Bridge", recommendedProfile: "claude_code", nativeRuleFile: "CLAUDE.md" };
      }
    }

    return {
      hostIde: vscode.env.appName || "VS Code",
      detectedModelLabel: "Claude 3.7 / Frontier Auto",
      recommendedProfile: "claude_xml",
      nativeRuleFile: ".github/copilot-instructions.md"
    };
  }

  /**
   * 3C. Voice-to-Spec Dictation & Spoken-Thought Disfluency Compiler
   * Cleans spoken stream-of-consciousness thoughts, mid-sentence self-corrections, and spoken code tokens.
   */
  public static compileVoiceTranscript(rawSpeech: string): VoiceCompileResult {
    const raw = (rawSpeech || "").trim();
    if (!raw) return { cleaned: "", corrections: 0, detectedCommand: null };
    let text = raw;
    let corrections = 0;
    let detectedCommand: string | null = null;

    const cmdPatterns: { rx: RegExp; cmd: string }[] = [
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?optimize\s+(?:this\s+)?for\s+claude\s*$/i, cmd: "claude_xml" },
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?optimize\s+(?:this\s+)?for\s+(?:openai|o3|gpt)\s*$/i, cmd: "openai_o" },
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?optimize\s+(?:this\s+)?for\s+cursor\s*$/i, cmd: "cursor_composer" },
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?optimize\s+(?:this\s+)?for\s+copilot\s*$/i, cmd: "copilot_edits" },
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?scrub\s+(?:all\s+)?secrets\s*$/i, cmd: "scrub_secrets" },
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?ground\s+in\s+workspace\s*$/i, cmd: "ground_workspace" },
      { rx: /[,.\s]*(?:promptsmith\s+)?(?:please\s+)?brainstorm(?:\s+this)?\s*$/i, cmd: "orthogonal_brainstorm" }
    ];
    for (const p of cmdPatterns) {
      if (p.rx.test(text)) {
        detectedCommand = p.cmd;
        text = text.replace(p.rx, "");
        corrections++;
      }
    }

    // Resolve mid-sentence spoken backtracks ("use Express, no wait use FastAPI")
    const backtrackRx = /([^.,;!?]+?)(?:,\s*|\s+)(?:no\s+wait(?:\s+actually)?|scratch\s+that|actually\s+no|wait\s+no\s+make\s+it|i\s+mean\s+instead)\s*,?\s*([^.,;!?]+)/gi;
    text = text.replace(backtrackRx, (_m, _oldClause, newClause) => {
      corrections++;
      return String(newClause).trim();
    });

    // Convert spoken casing & symbol shorthand
    text = text.replace(/\bsnake\s+case\s+([a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+){0,3})/gi, (_m, words) => {
      corrections++;
      return String(words).trim().toLowerCase().replace(/\s+/g, "_");
    });
    text = text.replace(/\bcamel\s+case\s+([a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+){0,3})/gi, (_m, words) => {
      corrections++;
      const parts = String(words).trim().toLowerCase().split(/\s+/);
      return parts[0] + parts.slice(1).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    });
    text = text.replace(/\bpascal\s+case\s+([a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+){0,3})/gi, (_m, words) => {
      corrections++;
      return String(words).trim().toLowerCase().split(/\s+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    });

    const spokenSymbols: [RegExp, string][] = [
      [/\bdot\s+env\b/gi, ".env"],
      [/\bpackage\s+dot\s+json\b/gi, "package.json"],
      [/\bts\s*config\s+dot\s+json\b/gi, "tsconfig.json"],
      [/\btriple\s+equals\b/gi, "==="],
      [/\bnot\s+equals\b/gi, "!=="],
      [/\bfat\s+arrow\b/gi, "=>"]
    ];
    for (const [rx, sym] of spokenSymbols) {
      if (rx.test(text)) {
        corrections++;
        text = text.replace(rx, sym);
      }
    }

    // Strip verbal fillers
    const fillerRx = /\b(?:uh+|um+|uhm+|er+|ah+|like\s+basically|you\s+know\s+what\s+i\s+mean|you\s+know|sort\s+of\s+like|kind\s+of\s+like|so\s+yeah|i\s+guess\s+like)\b[,.\s]*/gi;
    const beforeFiller = text;
    text = text.replace(fillerRx, " ");
    if (text !== beforeFiller) corrections++;

    text = text.replace(/\s{2,}/g, " ").trim();
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    return { cleaned: text, corrections, detectedCommand };
  }

  /**
   * 4. Simulate 20-turn cumulative context window token and API cost savings.
   *    In multi-turn coding sessions (Cursor Composer / Claude Code), every turn re-sends
   *    prior prompt history: Turn 1 + Turn 2 + ... + Turn N = N*(N+1)/2 multiplier.
   */
  public static simulateMultiTurnSavings(rawPrompt: string, tokenSavingsPercent: number): CostSimulation {
    const rawWords = (rawPrompt || "").trim() ? rawPrompt.trim().split(/\s+/).length : 120;
    const origTokens = Math.max(80, Math.round(rawWords * 1.35));
    const savingsRatio = Math.max(0.18, Math.min(0.65, (tokenSavingsPercent || 35) / 100));
    const optTokens = Math.max(40, Math.round(origTokens * (1 - savingsRatio)));

    const turns = 20;
    // Cumulative re-read across 20 agent turns + reduced retry rounds (average 1.8 fewer retries)
    const cumulativeMultiplier = (turns * (turns + 1)) / 2;
    const savedTokens = Math.round((origTokens - optTokens) * cumulativeMultiplier + origTokens * 8);

    const claudeSaved = (savedTokens / 1_000_000) * 15.0; // $15 / 1M output+cached context equivalent
    const o3Saved = (savedTokens / 1_000_000) * 20.0;
    const gpt4oSaved = (savedTokens / 1_000_000) * 10.0;

    return {
      originalTokensPerTurn: origTokens,
      optimizedTokensPerTurn: optTokens,
      turnsSimulated: turns,
      cumulativeTokensSaved: savedTokens,
      claudeSonnetSavedUsd: claudeSaved.toFixed(3),
      openaiO3SavedUsd: o3Saved.toFixed(3),
      gpt4oSavedUsd: gpt4oSaved.toFixed(3)
    };
  }
}
