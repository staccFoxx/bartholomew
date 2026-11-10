/**
 * PromptSmith - Frontier Model & Autonomous Coding Bot Benchmark Engine
 * Evaluates, scores, and benchmarks prompts across:
 * - 8 Frontier Intelligence Models: Claude 3.7/3.5, OpenAI o3/o1, GPT-4o/4.5, Gemini 2.0, DeepSeek R1, Grok 3, Llama 3.3, Qwen 2.5 Coder
 * - 7 Autonomous Coding Bots: Cursor Composer, Windsurf Cascade, Claude Code CLI, GitHub Copilot Edits, Aider, Devin, Cline / Roo Code
 */

import { EnhancementProfile } from "./enhancer";

export interface BenchmarkTarget {
  id: string;
  name: string;
  category: "model" | "bot" | "future";
  provider: string;
  badgeColor: string;
  compatibilityScore: number;
  latencyRating: "Ultra Fast" | "Fast" | "Reasoning Delay" | "Autonomous Multi-Step";
  tokenEstimate: number;
  costEstimatePer1k: string;
  profileKey: EnhancementProfile;
  recommendations: string[];
  warnings: string[];
  keyStrengths: string[];
}

export class ModelBenchmarkEngine {
  public static benchmarkPrompt(prompt: string): BenchmarkTarget[] {
    const text = prompt.trim();
    if (!text) {
      return this.emptyBenchmarks();
    }

    const words = text.split(/\s+/).filter(Boolean);
    const estTokens = Math.ceil(words.length * 1.33);

    // Structural pattern detection heuristics
    const hasXmlTags = /<\/?[a-z_]+>/i.test(text);
    const hasScratchpad = /<(scratchpad|thinking|antthinking)>/i.test(text);
    const hasStepByStep = /\b(step[- ]by[- ]step|think step by step|walk through step by step|let's think step by step)\b/i.test(text);
    const hasJsonSchema = /\b(json schema|output format: json|pydantic|\{[^{}]*"\w+"\s*:)/i.test(text);
    const hasDelimitedContext = /(---\s*BEGIN|```context|<context>|###\s*Context|BEGIN REFERENCE)/i.test(text);
    const hasNegativeConstraints = /\b(do not|never|must not|avoid|strictly|prohibited)\b/i.test(text);
    const hasFewShot = /\b(example\s*\d*:|input:[\s\S]*output:)/i.test(text);
    const hasPoliteFiller = /\b(can you please|could you please|as an ai|i would like you to|please kindly)\b/i.test(text);
    const hasFilePaths = /\b([a-zA-Z0-9_\-\.\/]+\.(ts|js|py|json|html|css|rs|go|cpp|c|md|sql))\b/i.test(text) || /@\w+/.test(text);
    const hasTestAssertions = /\b(test|assert|verify|validation|spec|unit test)\b/i.test(text);
    const hasDiffOrPatch = /\b(diff|patch|before\/after|\+ |\- |replace)\b/i.test(text);
    const hasTerminalCommand = /\b(npm|pnpm|cargo|pytest|pip|python|git|docker|curl|bash)\b/i.test(text);
    const hasMcpTools = /\b(mcp|tool_call|function_call|call_tool)\b/i.test(text);

    // ==========================================
    // 8 FRONTIER FOUNDATION MODELS
    // ==========================================

    // 1. Anthropic Claude 3.7 / 3.5 Sonnet
    let claudeScore = 75;
    const claudeRecs: string[] = [];
    const claudeWarns: string[] = [];
    if (hasXmlTags) claudeScore += 15;
    else claudeRecs.push("Enclose task and constraints in XML tags (<task>, <constraints>) for strict instruction adherence.");
    if (hasScratchpad) claudeScore += 10;
    else if (words.length > 40) claudeRecs.push("Include a <scratchpad> or <thinking> block to maximize Claude's complex architectural reasoning.");
    if (hasPoliteFiller) {
      claudeScore -= 12;
      claudeWarns.push("Conversational preamble degrades Claude's system prompt signal.");
    }
    claudeScore = Math.min(100, Math.max(25, claudeScore));

    // 2. OpenAI o3 / o3-mini / o1
    let oReasoningScore = 80;
    const oRecs: string[] = [];
    const oWarns: string[] = [];
    if (hasStepByStep) {
      oReasoningScore -= 28;
      oWarns.push("CRITICAL: Remove 'think step-by-step'. Micromanaging o1/o3 reasoning heuristics degrades test-time compute performance.");
    } else {
      oReasoningScore += 10;
      oRecs.push("Optimal: Autonomous reasoning enabled without micromanaging internal thinking steps.");
    }
    if (hasNegativeConstraints) oReasoningScore += 10;
    else oRecs.push("Specify strict edge-case acceptance criteria and boundary invariants.");
    oReasoningScore = Math.min(100, Math.max(25, oReasoningScore));

    // 3. OpenAI GPT-4o / GPT-4.5
    let gpt4oScore = 72;
    const gptRecs: string[] = [];
    const gptWarns: string[] = [];
    if (hasJsonSchema) gpt4oScore += 18;
    else gptRecs.push("Define deterministic JSON schema with explicit property types for reliable tool invocation.");
    if (hasFewShot) gpt4oScore += 10;
    else gptRecs.push("Provide 1 concrete few-shot demonstration example to lock formatting precision.");
    if (!hasNegativeConstraints) gptRecs.push("Add explicit negative constraints to eliminate hallucinations.");
    gpt4oScore = Math.min(100, Math.max(25, gpt4oScore));

    // 4. Google Gemini 2.0 Flash / Pro
    let geminiScore = 74;
    const geminiRecs: string[] = [];
    const geminiWarns: string[] = [];
    if (hasDelimitedContext) geminiScore += 16;
    else geminiRecs.push("Demarcate reference documents from actionable tasks using clear block headers.");
    if (words.length < 30) geminiRecs.push("Gemini excels with rich background context; anchor the user persona and target outcome.");
    geminiScore = Math.min(100, Math.max(25, geminiScore));

    // 5. DeepSeek R1 / V3
    let deepseekScore = 75;
    const dsRecs: string[] = [];
    const dsWarns: string[] = [];
    if (hasNegativeConstraints) deepseekScore += 15;
    else dsRecs.push("Define strict algorithmic boundaries and computational invariants.");
    if (hasStepByStep) {
      deepseekScore -= 18;
      dsWarns.push("DeepSeek R1 self-reflects autonomously; omit manual step-by-step guidance in favor of verification tests.");
    }
    deepseekScore = Math.min(100, Math.max(25, deepseekScore));

    // 6. xAI Grok 3
    let grokScore = 73;
    const grokRecs: string[] = [];
    const grokWarns: string[] = [];
    if (!hasPoliteFiller) grokScore += 12;
    else grokWarns.push("Grok 3 delivers highest signal when given unfiltered, imperative commands.");
    if (hasNegativeConstraints) grokScore += 15;
    else grokRecs.push("Anchor hard real-world ground truth constraints and verification criteria.");
    grokScore = Math.min(100, Math.max(25, grokScore));

    // 7. Meta Llama 3.3 70B
    let llamaScore = 71;
    const llamaRecs: string[] = [];
    const llamaWarns: string[] = [];
    if (hasDelimitedContext || hasXmlTags) llamaScore += 14;
    else llamaRecs.push("Provide explicit system persona and structured markdown sections.");
    if (words.length < 25) llamaRecs.push("Llama 3.3 benefits from detailed operational guidelines and explicit format contracts.");
    llamaScore = Math.min(100, Math.max(25, llamaScore));

    // 8. Qwen 2.5 Coder 32B
    let qwenScore = 76;
    const qwenRecs: string[] = [];
    const qwenWarns: string[] = [];
    if (hasFilePaths || hasTestAssertions) qwenScore += 16;
    else qwenRecs.push("Provide explicit language type annotations and test assertion harness.");
    if (hasNegativeConstraints) qwenScore += 8;
    qwenScore = Math.min(100, Math.max(25, qwenScore));

    // ==========================================
    // 7 AUTONOMOUS CODING BOTS & RUNTIMES
    // ==========================================

    // 1. Cursor Composer / Agent
    let cursorScore = 72;
    const cursorRecs: string[] = [];
    const cursorWarns: string[] = [];
    if (hasFilePaths) {
      cursorScore += 18;
      cursorRecs.push("Optimal: File paths identified for multi-file shadow workspace edits.");
    } else {
      cursorRecs.push("Reference specific file paths (e.g. src/auth.ts) to guide Cursor Composer's multi-file index.");
    }
    if (hasDiffOrPatch) cursorScore += 10;
    cursorScore = Math.min(100, Math.max(25, cursorScore));

    // 2. Windsurf Cascade
    let windsurfScore = 74;
    const windsurfRecs: string[] = [];
    const windsurfWarns: string[] = [];
    if (hasFilePaths && hasTestAssertions) windsurfScore += 16;
    else windsurfRecs.push("Specify workspace checkpoints and tool execution sequences for Cascade Flow.");
    windsurfScore = Math.min(100, Math.max(25, windsurfScore));

    // 3. Claude Code CLI
    let claudeCodeScore = 73;
    const ccRecs: string[] = [];
    const ccWarns: string[] = [];
    if (hasTerminalCommand) {
      claudeCodeScore += 15;
      ccRecs.push("Optimal: Command-line verification commands provided for terminal tool loops.");
    } else {
      ccRecs.push("Specify build or test commands (e.g. npm test, pytest) for Claude Code's verification loop.");
    }
    if (hasPoliteFiller) {
      claudeCodeScore -= 10;
      ccWarns.push("Terminal CLI agents perform best with concise, imperative task directives.");
    }
    claudeCodeScore = Math.min(100, Math.max(25, claudeCodeScore));

    // 4. GitHub Copilot Edits
    let copilotScore = 70;
    const copilotRecs: string[] = [];
    const copilotWarns: string[] = [];
    if (words.length <= 40 && hasFilePaths) copilotScore += 18;
    else if (words.length > 80) copilotWarns.push("Keep Copilot Edits instructions scoped and concise to avoid diffuse editor diffs.");
    else copilotRecs.push("Scope instructions to specific functions or symbols for clean inline edits.");
    copilotScore = Math.min(100, Math.max(25, copilotScore));

    // 5. Aider Pair Programmer
    let aiderScore = 72;
    const aiderRecs: string[] = [];
    const aiderWarns: string[] = [];
    if (hasFilePaths && (hasDiffOrPatch || hasTestAssertions)) {
      aiderScore += 18;
      aiderRecs.push("Optimal: Git-diff targets and validation commands identified.");
    } else {
      aiderRecs.push("State files to add to git session and test command to auto-commit on pass.");
    }
    aiderScore = Math.min(100, Math.max(25, aiderScore));

    // 6. Devin Autonomous Engineer
    let devinScore = 75;
    const devinRecs: string[] = [];
    const devinWarns: string[] = [];
    if (hasTestAssertions && words.length >= 35) devinScore += 15;
    else devinRecs.push("Define full-lifecycle acceptance criteria, API endpoints, and browser test requirements.");
    devinScore = Math.min(100, Math.max(25, devinScore));

    // 7. Cline / Roo Code Agent
    let clineScore = 73;
    const clineRecs: string[] = [];
    const clineWarns: string[] = [];
    if (hasMcpTools || hasFilePaths) clineScore += 16;
    else clineRecs.push("Specify explicit tool call permissions, target files, and terminal confirmation boundaries.");
    clineScore = Math.min(100, Math.max(25, clineScore));

    return [
      // Models
      {
        id: "claude-3-7-sonnet",
        name: "Claude 3.7 / 3.5 Sonnet",
        category: "model",
        provider: "Anthropic",
        badgeColor: "#d97706",
        compatibilityScore: claudeScore,
        latencyRating: "Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.003",
        profileKey: "claude_xml",
        recommendations: claudeRecs,
        warnings: claudeWarns,
        keyStrengths: ["Hierarchical XML parsing", "Scratchpad reasoning", "Zero-preamble steering"]
      },
      {
        id: "openai-o3-o1",
        name: "o3 / o3-mini / o1",
        category: "model",
        provider: "OpenAI",
        badgeColor: "#10b981",
        compatibilityScore: oReasoningScore,
        latencyRating: "Reasoning Delay",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.015",
        profileKey: "openai_o",
        recommendations: oRecs,
        warnings: oWarns,
        keyStrengths: ["Autonomous test-time compute", "Formal invariant solving", "Mathematical proofs"]
      },
      {
        id: "gpt-4o",
        name: "GPT-4o / GPT-4.5",
        category: "model",
        provider: "OpenAI",
        badgeColor: "#0ea5e9",
        compatibilityScore: gpt4oScore,
        latencyRating: "Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.0025",
        profileKey: "gpt4o_schema",
        recommendations: gptRecs,
        warnings: gptWarns,
        keyStrengths: ["Structured JSON outputs", "Multimodal inputs", "Strict schema contracts"]
      },
      {
        id: "gemini-2-flash",
        name: "Gemini 2.0 Flash / Pro",
        category: "model",
        provider: "Google",
        badgeColor: "#8b5cf6",
        compatibilityScore: geminiScore,
        latencyRating: "Ultra Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.0001",
        profileKey: "gemini_context",
        recommendations: geminiRecs,
        warnings: geminiWarns,
        keyStrengths: ["2M+ context window", "Ultra-low latency", "Rich reference grounding"]
      },
      {
        id: "deepseek-r1",
        name: "DeepSeek R1 / V3",
        category: "model",
        provider: "DeepSeek",
        badgeColor: "#3b82f6",
        compatibilityScore: deepseekScore,
        latencyRating: "Reasoning Delay",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.00055",
        profileKey: "deepseek_r1",
        recommendations: dsRecs,
        warnings: dsWarns,
        keyStrengths: ["Open-weights frontier reasoning", "Algorithmic synthesis", "Boundary edge testing"]
      },
      {
        id: "grok-3",
        name: "Grok 3",
        category: "model",
        provider: "xAI",
        badgeColor: "#ec4899",
        compatibilityScore: grokScore,
        latencyRating: "Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.002",
        profileKey: "grok_direct",
        recommendations: grokRecs,
        warnings: grokWarns,
        keyStrengths: ["Real-time search integration", "Direct high-signal answers", "Zero bureaucratic hedging"]
      },
      {
        id: "llama-3-3",
        name: "Llama 3.3 70B",
        category: "model",
        provider: "Meta",
        badgeColor: "#6366f1",
        compatibilityScore: llamaScore,
        latencyRating: "Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.0007",
        profileKey: "llama_system",
        recommendations: llamaRecs,
        warnings: llamaWarns,
        keyStrengths: ["System steerability", "Standardized markdown adherence", "Local/private hosting"]
      },
      {
        id: "qwen-2-5-coder",
        name: "Qwen 2.5 Coder 32B",
        category: "model",
        provider: "Alibaba",
        badgeColor: "#14b8a6",
        compatibilityScore: qwenScore,
        latencyRating: "Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "$0.0008",
        profileKey: "qwen_coder",
        recommendations: qwenRecs,
        warnings: qwenWarns,
        keyStrengths: ["Repository-level code synthesis", "Type annotations", "Clean test assertions"]
      },

      // Autonomous Coding Bots
      {
        id: "cursor-composer",
        name: "Cursor Composer / Agent",
        category: "bot",
        provider: "Anysphere",
        badgeColor: "#a855f7",
        compatibilityScore: cursorScore,
        latencyRating: "Autonomous Multi-Step",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Subscription",
        profileKey: "cursor_composer",
        recommendations: cursorRecs,
        warnings: cursorWarns,
        keyStrengths: ["Multi-file shadow workspace edits", "@file index parsing", "Fast iterative diffs"]
      },
      {
        id: "windsurf-cascade",
        name: "Windsurf Cascade",
        category: "bot",
        provider: "Codeium",
        badgeColor: "#06b6d4",
        compatibilityScore: windsurfScore,
        latencyRating: "Autonomous Multi-Step",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Subscription",
        profileKey: "windsurf_cascade",
        recommendations: windsurfRecs,
        warnings: windsurfWarns,
        keyStrengths: ["Flow architecture", "Real-time tool execution", "Workspace state tracking"]
      },
      {
        id: "claude-code-cli",
        name: "Claude Code CLI",
        category: "bot",
        provider: "Anthropic",
        badgeColor: "#f59e0b",
        compatibilityScore: claudeCodeScore,
        latencyRating: "Autonomous Multi-Step",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Token-based",
        profileKey: "claude_code",
        recommendations: ccRecs,
        warnings: ccWarns,
        keyStrengths: ["Unix pipeline integration", "Automated test loops", "Codebase search & replace"]
      },
      {
        id: "copilot-edits",
        name: "GitHub Copilot Edits",
        category: "bot",
        provider: "GitHub / MS",
        badgeColor: "#22c55e",
        compatibilityScore: copilotScore,
        latencyRating: "Fast",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Subscription",
        profileKey: "copilot_edits",
        recommendations: copilotRecs,
        warnings: copilotWarns,
        keyStrengths: ["In-editor localized edits", "Repo context indexing", "Style matching"]
      },
      {
        id: "aider",
        name: "Aider Pair Programmer",
        category: "bot",
        provider: "Open Source",
        badgeColor: "#f43f5e",
        compatibilityScore: aiderScore,
        latencyRating: "Autonomous Multi-Step",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Bring Your Own Key",
        profileKey: "aider_diff",
        recommendations: aiderRecs,
        warnings: aiderWarns,
        keyStrengths: ["Git-commit automation", "Repo map AST analysis", "Automated test recovery"]
      },
      {
        id: "devin",
        name: "Devin Autonomous",
        category: "bot",
        provider: "Cognition",
        badgeColor: "#84cc16",
        compatibilityScore: devinScore,
        latencyRating: "Autonomous Multi-Step",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Enterprise ACU",
        profileKey: "devin_fullstack",
        recommendations: devinRecs,
        warnings: devinWarns,
        keyStrengths: ["Full-lifecycle engineering", "Shell + browser execution", "End-to-end deployment"]
      },
      {
        id: "cline-roo",
        name: "Cline / Roo Code",
        category: "bot",
        provider: "Open Source",
        badgeColor: "#eab308",
        compatibilityScore: clineScore,
        latencyRating: "Autonomous Multi-Step",
        tokenEstimate: estTokens,
        costEstimatePer1k: "Bring Your Own Key",
        profileKey: "cline_mcp",
        recommendations: clineRecs,
        warnings: clineWarns,
        keyStrengths: ["MCP tool protocol", "Atomic file modifications", "Configurable auto-approvals"]
      }
    ];
  }

  private static emptyBenchmarks(): BenchmarkTarget[] {
    const targets = [
      { id: "claude-3-7-sonnet", name: "Claude 3.7 / 3.5 Sonnet", cat: "model" as const, prov: "Anthropic", color: "#d97706", rate: "Fast" as const, cost: "$0.003", prof: "claude_xml" as EnhancementProfile },
      { id: "openai-o3-o1", name: "o3 / o3-mini / o1", cat: "model" as const, prov: "OpenAI", color: "#10b981", rate: "Reasoning Delay" as const, cost: "$0.015", prof: "openai_o" as EnhancementProfile },
      { id: "gpt-4o", name: "GPT-4o / GPT-4.5", cat: "model" as const, prov: "OpenAI", color: "#0ea5e9", rate: "Fast" as const, cost: "$0.0025", prof: "gpt4o_schema" as EnhancementProfile },
      { id: "gemini-2-flash", name: "Gemini 2.0 Flash / Pro", cat: "model" as const, prov: "Google", color: "#8b5cf6", rate: "Ultra Fast" as const, cost: "$0.0001", prof: "gemini_context" as EnhancementProfile },
      { id: "deepseek-r1", name: "DeepSeek R1 / V3", cat: "model" as const, prov: "DeepSeek", color: "#3b82f6", rate: "Reasoning Delay" as const, cost: "$0.00055", prof: "deepseek_r1" as EnhancementProfile },
      { id: "grok-3", name: "Grok 3", cat: "model" as const, prov: "xAI", color: "#ec4899", rate: "Fast" as const, cost: "$0.002", prof: "grok_direct" as EnhancementProfile },
      { id: "llama-3-3", name: "Llama 3.3 70B", cat: "model" as const, prov: "Meta", color: "#6366f1", rate: "Fast" as const, cost: "$0.0007", prof: "llama_system" as EnhancementProfile },
      { id: "qwen-2-5-coder", name: "Qwen 2.5 Coder 32B", cat: "model" as const, prov: "Alibaba", color: "#14b8a6", rate: "Fast" as const, cost: "$0.0008", prof: "qwen_coder" as EnhancementProfile },
      { id: "cursor-composer", name: "Cursor Composer / Agent", cat: "bot" as const, prov: "Anysphere", color: "#a855f7", rate: "Autonomous Multi-Step" as const, cost: "Subscription", prof: "cursor_composer" as EnhancementProfile },
      { id: "windsurf-cascade", name: "Windsurf Cascade", cat: "bot" as const, prov: "Codeium", color: "#06b6d4", rate: "Autonomous Multi-Step" as const, cost: "Subscription", prof: "windsurf_cascade" as EnhancementProfile },
      { id: "claude-code-cli", name: "Claude Code CLI", cat: "bot" as const, prov: "Anthropic", color: "#f59e0b", rate: "Autonomous Multi-Step" as const, cost: "Token-based", prof: "claude_code" as EnhancementProfile },
      { id: "copilot-edits", name: "GitHub Copilot Edits", cat: "bot" as const, prov: "GitHub / MS", color: "#22c55e", rate: "Fast" as const, cost: "Subscription", prof: "copilot_edits" as EnhancementProfile },
      { id: "aider", name: "Aider Pair Programmer", cat: "bot" as const, prov: "Open Source", color: "#f43f5e", rate: "Autonomous Multi-Step" as const, cost: "BYOK", prof: "aider_diff" as EnhancementProfile },
      { id: "devin", name: "Devin Autonomous", cat: "bot" as const, prov: "Cognition", color: "#84cc16", rate: "Autonomous Multi-Step" as const, cost: "Enterprise", prof: "devin_fullstack" as EnhancementProfile },
            { id: "future-deep-reasoner", name: "Next-Gen Deep Reasoner (o3+ / Claude 4 / Gemini 3)", cat: "future" as const, prov: "Frontier AGIs", color: "#ec4899", rate: "Reasoning Delay" as const, cost: "Adaptive Compute", prof: "future_deep_reasoner" as EnhancementProfile },
      { id: "future-agent-swarm", name: "Autonomous Agent Swarm (Multi-Agent AGI)", cat: "future" as const, prov: "Autonomous Swarms", color: "#8b5cf6", rate: "Autonomous Multi-Step" as const, cost: "Swarm Compute", prof: "future_agent_swarm" as EnhancementProfile },
      { id: "future-formal-verifier", name: "Neuro-Symbolic Verifier (Lean 4 / Z3 SAT AI)", cat: "future" as const, prov: "Formal Solvers", color: "#10b981", rate: "Fast" as const, cost: "SAT Compute", prof: "future_formal_verifier" as EnhancementProfile },
      { id: "future-infinite-context", name: "Infinite-Context Engine (10M+ Streamer)", cat: "future" as const, prov: "Streaming AGIs", color: "#06b6d4", rate: "Ultra Fast" as const, cost: "Linear Attention", prof: "future_infinite_context" as EnhancementProfile },
      { id: "cline-roo", name: "Cline / Roo Code", cat: "bot" as const, prov: "Open Source", color: "#eab308", rate: "Autonomous Multi-Step" as const, cost: "BYOK", prof: "cline_mcp" as EnhancementProfile }
    ];

    return targets.map(t => ({
      id: t.id,
      name: t.name,
      category: t.cat,
      provider: t.prov,
      badgeColor: t.color,
      compatibilityScore: 0,
      latencyRating: t.rate,
      tokenEstimate: 0,
      costEstimatePer1k: t.cost,
      profileKey: t.prof,
      recommendations: ["Provide input prompt to benchmark"],
      warnings: [],
      keyStrengths: ["Benchmark pending input"]
    }));
  }
}
