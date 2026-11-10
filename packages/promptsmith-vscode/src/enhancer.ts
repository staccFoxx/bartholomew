/**
 * PromptSmith - Precision Multi-Model & Autonomous Bot Prompt Transformation Engine
 * Optimizes prompts across 18 distinct profiles tailored to:
 * - 8 Frontier Intelligence Models (Claude 3.7/3.5, o3/o1, GPT-4o/4.5, Gemini 2.0, DeepSeek R1, Grok 3, Llama 3.3, Qwen 2.5 Coder)
 * - 7 Autonomous Coding Bots (Cursor Composer, Windsurf Cascade, Claude Code CLI, Copilot Edits, Aider, Devin, Cline / Roo Code)
 * - Universal Precision, Adversarial Red-Teaming, and Executive Conversion
 */

import { KnowledgeBase, DomainRule } from "./knowledge_base";
import { CognitivePatternEngine, CognitiveAnalysis, CognitiveAudience } from "./learner";
import { OmniEqualizerEngine, DisciplinaryLens } from "./equalizer";
import { OrthogonalPathfinder } from "./orthogonal";
import { PreemptiveFutureEngine } from "./preemptive";

export type EnhancementProfile =
  | "precision"
  | "claude_xml"
  | "openai_o"
  | "gpt4o_schema"
  | "gemini_context"
  | "deepseek_r1"
  | "grok_direct"
  | "llama_system"
  | "qwen_coder"
  | "cursor_composer"
  | "windsurf_cascade"
  | "claude_code"
  | "copilot_edits"
  | "aider_diff"
  | "devin_fullstack"
  | "cline_mcp"
  | "adversarial"
  | "executive"
  | "future_deep_reasoner"
  | "future_agent_swarm"
  | "future_formal_verifier"
  | "future_infinite_context"
  | "orthogonal_brainstorm";

export class PromptEnhancer {
  public static enhance(
    prompt: string,
    profile: EnhancementProfile = "precision",
    targetRuntime = "Cursor / Claude Code",
    audienceOverride?: CognitiveAudience,
    disciplineOverride?: DisciplinaryLens
  ): string {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return "";

    const domainRule = KnowledgeBase.getDomainEnrichment(cleanPrompt);
    const domainName = domainRule ? domainRule.domain : "General";
    
    // Cognitive Scaffolding Analysis
    const cognitive = CognitivePatternEngine.analyzeCognitivePattern(cleanPrompt, domainName);
    const activeAudience = audienceOverride || cognitive.audience;
    const scaffoldingDirectives = this.getScaffoldingBlock(activeAudience);

    // Omni-Disciplinary Equalizer Analysis
    const activeLens = disciplineOverride || OmniEqualizerEngine.detectDisciplinaryLens(cleanPrompt);
    const equalizerBlock = OmniEqualizerEngine.getEqualizerBlock(activeLens, true);

    let compiled = "";
    switch (profile) {
      // Frontier Foundation Models
      case "claude_xml":
        compiled = this.enhanceClaudeXml(cleanPrompt, targetRuntime, domainRule); break;
      case "openai_o":
        compiled = this.enhanceOpenAiReasoning(cleanPrompt, targetRuntime, domainRule); break;
      case "gpt4o_schema":
        compiled = this.enhanceGpt4oSchema(cleanPrompt, targetRuntime, domainRule); break;
      case "gemini_context":
        compiled = this.enhanceGeminiContext(cleanPrompt, targetRuntime, domainRule); break;
      case "deepseek_r1":
        compiled = this.enhanceDeepSeekR1(cleanPrompt, targetRuntime, domainRule); break;
      case "grok_direct":
        compiled = this.enhanceGrokDirect(cleanPrompt, targetRuntime, domainRule); break;
      case "llama_system":
        compiled = this.enhanceLlamaSystem(cleanPrompt, targetRuntime, domainRule); break;
      case "qwen_coder":
        compiled = this.enhanceQwenCoder(cleanPrompt, targetRuntime, domainRule); break;

      // Autonomous Coding Bots & Agents
      case "cursor_composer":
        compiled = this.enhanceCursorComposer(cleanPrompt, targetRuntime, domainRule); break;
      case "windsurf_cascade":
        compiled = this.enhanceWindsurfCascade(cleanPrompt, targetRuntime, domainRule); break;
      case "claude_code":
        compiled = this.enhanceClaudeCode(cleanPrompt, targetRuntime, domainRule); break;
      case "copilot_edits":
        compiled = this.enhanceCopilotEdits(cleanPrompt, targetRuntime, domainRule); break;
      case "aider_diff":
        compiled = this.enhanceAiderDiff(cleanPrompt, targetRuntime, domainRule); break;
      case "devin_fullstack":
        compiled = this.enhanceDevinFullstack(cleanPrompt, targetRuntime, domainRule); break;
      case "cline_mcp":
        compiled = this.enhanceClineMcp(cleanPrompt, targetRuntime, domainRule); break;

      // Specialized
      case "precision":
        compiled = this.enhancePrecision(cleanPrompt, targetRuntime, domainRule); break;
      case "adversarial":
        compiled = this.enhanceAdversarial(cleanPrompt, targetRuntime, domainRule); break;
      case "executive":
        compiled = this.enhanceExecutive(cleanPrompt, domainRule);
        break;
      case "orthogonal_brainstorm":
        compiled = OrthogonalPathfinder.synthesizeBrainstorm(cleanPrompt).masterBrainstormPrompt;
        break;
      case "future_deep_reasoner":
        compiled = this.enhanceFutureReasoner(cleanPrompt); break;
      case "future_agent_swarm":
        compiled = this.enhanceFutureSwarm(cleanPrompt); break;
      case "future_formal_verifier":
        compiled = this.enhanceFutureVerifier(cleanPrompt); break;
      case "future_infinite_context":
        compiled = this.enhanceFutureInfinite(cleanPrompt); break;
      default:
        compiled = this.enhancePrecision(cleanPrompt, targetRuntime, domainRule);
        break;
    }

    // Inject Omni-Disciplinary Equalizer (Cross-pollination across Design & Systems Architecture)
    if (equalizerBlock && !compiled.includes("### Disciplinary Equalizer")) {
      if (profile === "claude_xml") {
        compiled += `\n\n<disciplinary_equalizer>\n${equalizerBlock}\n</disciplinary_equalizer>`;
      } else {
        compiled += `\n\n${equalizerBlock}`;
      }
    }

    // Inject Cognitive Scaffolding based on User Comprehension Profile
    if (activeAudience === "explorer") {
      if (profile === "claude_xml") {
        compiled += `\n\n<audience_scaffolding>\n${scaffoldingDirectives}\n</audience_scaffolding>`;
      } else {
        compiled += `\n\n${scaffoldingDirectives}`;
      }
    } else if (activeAudience === "architect" && profile !== "openai_o" && profile !== "deepseek_r1") {
      compiled += `\n\n${scaffoldingDirectives}`;
    } else if (activeAudience === "executive" && profile !== "executive") {
      compiled += `\n\n${scaffoldingDirectives}`;
    }

    return compiled;
  }


  private static resolveSystemRole(domainRule: DomainRule | null, targetRuntime: string): string {
    if (!domainRule) {
      return `Frontier Software Architect & Empirical Systems Verifier operating in ${targetRuntime}`;
    }
    if (domainRule.domain.includes("Meta-Prompt")) {
      return `Frontier Prompt Architect & Agent Specification Engineer operating in ${targetRuntime}`;
    }
    if (domainRule.category === "science" || domainRule.domain.includes("Physics")) {
      return `Theoretical & Applied Physicist / Empirical Systems Scientist operating in ${targetRuntime}`;
    }
    if (domainRule.domain.includes("Mathematical")) {
      return `Pure & Applied Mathematician / Formal Logic Verifier operating in ${targetRuntime}`;
    }
    if (domainRule.category === "operations" || domainRule.domain.includes("Real-World")) {
      return `Principal Operations Commander & Crisis Response Strategist operating in ${targetRuntime}`;
    }
    if (domainRule.domain.includes("Human Communication")) {
      return `Master Communicator & Cognitive Scaffolding Strategist operating in ${targetRuntime}`;
    }
    if (domainRule.category === "business") {
      return `Principal Strategy Architect & Quantitative Financial Modeler operating in ${targetRuntime}`;
    }
    if (domainRule.category === "legal") {
      return `Senior Commercial Counsel & Regulatory Compliance Specialist operating in ${targetRuntime}`;
    }
    return `Senior Staff Architect & Systems Verifier operating in ${targetRuntime}. Specialization: ${domainRule.domain}`;
  }

  private static resolveOutputSpec(domainRule: DomainRule | null): string {
    if (!domainRule) {
      return "Deliver self-contained, fully resolved technical artifacts followed by an explicit verification test suite.";
    }
    return domainRule.recommendedOutputFormat;
  }

  private static stripFiller(text: string): string {
    return text
      .replace(/\b(can you please|could you please|please kindly|i would like you to|i want you to)\b/gi, "")
      .replace(/\b(as an ai language model|as a helpful assistant|in order to help me)\b/gi, "")
      .replace(/\b(feel free to|make sure that you|try your best to)\b/gi, "")
      .replace(/\b(basically|essentially|actually|obviously|literally)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 1. Universal Precision
  private static enhancePrecision(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    const role = this.resolveSystemRole(domainRule, targetRuntime);
    const outputFormat = this.resolveOutputSpec(domainRule);
    const domainConstraints = domainRule
      ? domainRule.injectedConstraints.map(c => `- [${domainRule.domain}] ${c}`).join("\n")
      : "";

    return `<context>
You are ${role}. Execute the directive with deterministic precision, grounded empirical correctness, and strict adherence to physical, mathematical, and domain constraints.
</context>

<task>
${core}
</task>

<constraints>
- Maintain production-grade correctness with zero unverified assumptions or unstated mock implementations.
- Obey all governing physical conservation laws, mathematical axioms, and operational realities.
- Provide self-contained, drop-in deliverables with explicit error-handling and boundary edge cases.
- NEVER include meta-commentary, apology preambles, or conversational transitions before or after deliverables.
${domainConstraints ? domainConstraints + "\n" : ""}- Test and verify all assertions internally before labeling any solution correct.
</constraints>

<output_format>
${outputFormat}
</output_format>`;
  }

  // 2. Anthropic Claude 3.7 / 3.5 Sonnet XML
  private static enhanceClaudeXml(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    const role = this.resolveSystemRole(domainRule, targetRuntime);
    const outputSpec = this.resolveOutputSpec(domainRule);
    const domainConstraints = domainRule
      ? domainRule.injectedConstraints.map(c => `  * ${c}`).join("\n")
      : "";

    return `<system_role>
${role}
</system_role>

<scratchpad>
Before outputting deliverables:
1. Deconstruct the prompt requirements, physical laws, and invariant constraints.
2. Verify dimensional homogeneity and mathematical consistency.
3. Formulate edge-case boundary conditions and falsification tests.
4. Verify all components internally before certifying the solution.
</scratchpad>

<instructions>
${core}
</instructions>

<rules>
- Adhere strictly to provided specifications without conversational introductions or meta-commentary.
- Enclose all production deliverables in clean, delimited syntax blocks.
${domainConstraints ? domainConstraints + "\n" : ""}- If edge-case ambiguities exist, implement the most resilient industry-standard pattern and document invariants.
</rules>

<output_specification>
${outputSpec}
</output_specification>`;
  }

  // 3. OpenAI o3 / o3-mini / o1 Autonomous Problem Spec
  private static enhanceOpenAiReasoning(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = prompt
      .replace(/\b(think step by step|walk through step by step|let's think step by step|explain your reasoning step by step)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const role = this.resolveSystemRole(domainRule, targetRuntime);
    const outputSpec = this.resolveOutputSpec(domainRule);

    return `### Problem Specification
${core}

### Domain Jurisdiction & Invariants
- Role Context: ${role}
${domainRule ? `- Domain: ${domainRule.domain}\n` + domainRule.injectedConstraints.map(c => `  - ${c}`).join("\n") : ""}
- Invariant Criteria: Deterministic correctness across all physical, mathematical, and operational edge cases.
- Grounded Execution: Do NOT provide superficial pseudocode or speculative statements; provide fully realized, verified artifacts.

### Formal Acceptance & Falsification Verification
- Target Format: ${outputSpec}
- Provide 3 rigorous verification assertions testing:
  1. Nominal baseline state.
  2. Boundary threshold / singularity limit.
  3. Falsification stress test attempting to break the hypothesis or constraints.`;
  }

  // 4. OpenAI GPT-4o / GPT-4.5 Structured Markdown & Schema
  private static enhanceGpt4oSchema(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `## Objective & System Context
Act as a Senior Staff Engineer in ${targetRuntime}. Execute the objective with high token efficiency and structured markdown output.

## Input Prompt
${core}

## Hard Constraints
- Output must be structured under clean markdown headings (## Architecture, ## Implementation, ## Verification).
- Code snippets must include language tags and complete variable types.
- Zero markdown backticks surrounding non-code conversational text.
${domainRule ? domainRule.injectedConstraints.map(c => `- ${c}`).join("\n") : ""}

## Few-Shot Demonstration Pattern
Input: Calculate verified hash digest of payload
Output: 
\`\`\`typescript
import * as crypto from 'crypto';
export function hashPayload(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
\`\`\``;
  }

  // 5. Google Gemini 2.0 Flash / Pro Context Anchoring
  private static enhanceGeminiContext(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `[SYSTEM INSTRUCTION: FRONTIER GEMINI RUNTIME]
You are operating within ${targetRuntime}. You possess multi-modal context understanding and high-throughput recall.
${domainRule ? `Domain Context: ${domainRule.domain}` : ""}

============================= BEGIN REFERENCE CONTEXT =============================
Environment: Production Workspace (${targetRuntime})
Knowledge Rules: ${domainRule ? domainRule.injectedConstraints.join("; ") : "Production standard compliance"}
============================== END REFERENCE CONTEXT ==============================

[ACTIONABLE OBJECTIVE]
${core}

[STRICT DELIVERABLE FORMAT]
- Deliver self-contained, fully resolved implementations.
- Ground all assertions directly in technical specifications.
- Avoid repetitive disclaimers or speculative non-answers.`;
  }

  // 6. DeepSeek R1 / V3 Algorithmic Invariants & Verification
  private static enhanceDeepSeekR1(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = prompt
      .replace(/\b(think step by step|walk through step by step|let's think step by step)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return `### Mathematical & Algorithmic Contract
Target Runtime: ${targetRuntime}
${domainRule ? `Domain Specialization: ${domainRule.domain}` : ""}

### Formal Problem Statement
${core}

### Invariant Equations & Safety Bounds
1. Input preconditions: All parameters must be strictly typed, validated at boundary, and sanitised against degenerate/null inputs.
2. Computational invariants: Guarantee termination, deterministic memory allocation, and idempotent execution.
3. State transitions: Maintain consistent state across asynchronous concurrency and unexpected exceptions.

### Verification Harness
Deliver full runnable code followed by an explicit test harness verifying:
- Happy path baseline execution
- Extreme boundary condition (minimum, maximum, empty set)
- Adversarial fault injection and recovery`;
  }

  // 7. xAI Grok 3 Technical Direct & High Signal
  private static enhanceGrokDirect(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `### MISSION DIRECTIVE (ZERO FLUFF)
Environment: ${targetRuntime}
Command: ${core}

### EMPIRICAL EXECUTION RULES
- Deliver direct, unhedged technical solutions backed by empirical evidence and ground truth.
- Zero corporate boilerplate, safety disclaimers, or introductory fluff.
- If existing code or assumptions are flawed, state the exact flaw bluntly and provide the working replacement.
${domainRule ? `- Anchor in domain truth: ${domainRule.injectedConstraints.join("; ")}` : ""}

### DELIVERABLE
Production-ready code and exact execution verification steps.`;
  }

  // 8. Meta Llama 3.3 70B Steered System Framework
  private static enhanceLlamaSystem(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an expert autonomous software engineer operating inside ${targetRuntime}.
You strictly adhere to operational constraints and output concise, well-structured, bug-free implementations.
${domainRule ? `Domain Context: ${domainRule.domain}. Rules: ${domainRule.injectedConstraints.join(", ")}` : ""}
<|eot_id|><|start_header_id|>user<|end_header_id|>
Execute the following task with high precision:

${core}

Requirements:
1. Provide the complete implementation with zero placeholders or omissions.
2. Include type definitions, error boundaries, and defensive checks.
3. Deliver a brief validation snippet confirming functionality.
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
  }

  // 9. Alibaba Qwen 2.5 Coder Clean Synthesis
  private static enhanceQwenCoder(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `// Target: ${targetRuntime}
// Domain: ${domainRule ? domainRule.domain : "General Engineering"}
// Instruction: Implement the following specification in production-ready code with complete imports, strict types, and unit tests.

/* SPECIFICATION
${core}
*/

// REQUIREMENTS
// 1. Drop-in replacement with zero omitted logic (no '// TODO' or 'implement here').
// 2. Strict type annotations and robust error propagation.
// 3. Include a runnable test suite asserting all boundary invariants.`;
  }

  // 10. Cursor Composer Multi-File Edit Spec
  private static enhanceCursorComposer(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `### Cursor Composer Multi-File Task
Target Workspace: ${targetRuntime}

### Request Summary
${core}

### Modification Guidelines
- Edit only the targeted files and symbols required for this task.
- Preserve existing project style, comments, and conventions.
- Format all code changes as full, drop-in replacement blocks or unambiguous edits.
${domainRule ? `- Enforce domain constraints: ${domainRule.injectedConstraints.join("; ")}` : ""}

### Verification Step
Run local workspace tests or compilation checks to verify zero regression.`;
  }

  // 11. Windsurf Cascade Flow & Tool Directives
  private static enhanceWindsurfCascade(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `### Cascade Flow Task Plan
Context: Operating within Windsurf IDE (${targetRuntime})

### Task Objective
${core}

### Cascade Execution Sequence
Step 1: Inspect relevant files and dependency manifests in the workspace.
Step 2: Implement the requested functionality with atomic, verified file edits.
Step 3: Execute workspace terminal checks to confirm zero lint, type, or runtime errors.

### Constraints
- Zero conversational filler; proceed directly with tool actions.
- Document any modified exported interfaces cleanly.`;
  }

  // 12. Claude Code CLI Terminal Pipeline & Test Harness
  private static enhanceClaudeCode(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `Task for Claude Code CLI:
${core}

Operational Directives:
- Inspect the codebase using ripgrep and file read tools before modifying files.
- Apply surgical edits to files using standard diff-compatible modifications.
- Run the project test suite (e.g. npm test, cargo test, pytest) to verify changes pass cleanly.
- Keep terminal output concise and commit-ready.`;
  }

  // 13. GitHub Copilot Edits Scoped Patch
  private static enhanceCopilotEdits(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `Scope: Tightly focused inline edit in active editor context (${targetRuntime})

Task:
${core}

Guidelines:
- Modify only the required functions/lines in the active files.
- Do NOT refactor or reformat unrelated code.
- Match existing naming, indentation, and docstring conventions.`;
  }

  // 14. Aider Git Pair Programming & Commit Spec
  private static enhanceAiderDiff(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `Aider Session Directive:
${core}

Rules for Git Commit:
1. Make complete, working changes to the relevant files.
2. Run test verification command before completing.
3. Formulate a concise, imperative Git commit message summarizing the change (e.g. 'feat: implement ...' or 'fix: resolve ...').`;
  }

  // 15. Devin Autonomous Full-Lifecycle Spec
  private static enhanceDevinFullstack(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `### Devin Autonomous Engineering Specification
Project Environment: ${targetRuntime}

### Milestone 1: Requirement Analysis & Investigation
${core}

### Milestone 2: Implementation & File Edits
- Implement all required changes across backend, frontend, and configuration files.
- Ensure all environment variables and secrets are handled securely without hardcoding.

### Milestone 3: End-to-End Verification
- Launch local test server or test suite in shell.
- Verify browser or API response contracts match expectations.
- Document any setup instructions in README if dependencies were added.`;
  }

  // 16. Cline / Roo Code MCP Tool Plan
  private static enhanceClineMcp(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const core = this.stripFiller(prompt);
    return `Cline Agent MCP Execution Directive:
Task: ${core}

MCP Tool Execution Protocol:
1. Use file read tools to inspect exact line numbers before editing.
2. Apply atomic write_to_file or apply_diff tool calls.
3. Use execute_command to run build/lint checks after edits.
4. Stop and report when all acceptance criteria are verified.`;
  }

  // 17. Adversarial / RLHF Red-Teaming
  private static enhanceAdversarial(prompt: string, targetRuntime: string, domainRule: DomainRule | null): string {
    const checklist = domainRule
      ? domainRule.reasoningChecklist.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "1. Negative Constraint Adherence\n2. Fact-Checking & Grounding\n3. Edge-Case Boundaries";

    return `<system_identity>
Frontier Reasoning & Empirical Verification Evaluator (${targetRuntime})
${domainRule ? `Domain Specialization: ${domainRule.domain}` : ""}
</system_identity>

<objective>
Execute a rigorous multi-turn evaluation of the following scenario, proactively testing for subtle failure modes, boundary contradictions, and hallucination vectors:
</objective>

<scenario_prompt>
${prompt}
</scenario_prompt>

<adversarial_rubric>
1. Constraint Adherence: Verify that every negative constraint, formatting instruction, and length requirement is strictly followed without drift.
2. Fact-Checking & Semantic Grounding: Expose any historical, mathematical, or accounting hallucinations.
3. Domain-Specific Verification Checklist:
${checklist}
4. Failure Classification: If a failure is elicited, classify the root cause (Instruction Neglect, Parametric Hallucination, Semantic Homonym Trap, or Logic Inversion).
</adversarial_rubric>

<required_output>
Provide an unsparing, analytical assessment backed by explicit mathematical or textual evidence. Quote exact offending phrases before delivering the remediated ground-truth answer.
</required_output>`;
  }

  // 18. Executive & Commercial High-Yield Conversion
  private static enhanceExecutive(prompt: string, domainRule: DomainRule | null): string {
    return `### Context & Strategic Objective
${prompt}

### Constraints & Commercial Parameters
- Audience: Enterprise Technical Decision-Maker / Principal Architect / Managing Director.
- Format: Strict 3-sentence high-signal conversion framework:
  1. Proven Technical Capability & Value Wedge (backed by verifiable benchmark data).
  2. Frictionless Integration Path (zero migration overhead, drop-in SDK/MCP).
  3. Low-Commitment Concrete Call-to-Action (pilot activation link or 15-minute verification sandbox).
- Tone: Crisp, commanding, professional, zero marketing hyperbole.
${domainRule ? `- Industry Anchor: ${domainRule.domain}` : ""}`;
  }

  private static getScaffoldingBlock(audience: CognitiveAudience): string {
    switch (audience) {
      case "explorer":
        return `### Audience Scaffolding: Young Student & Beginner Friendly (All Ages)
- Anchor key concepts in an intuitive real-world analogy before presenting any code or technical answers.
- Break down the solution into bite-sized, friendly, numbered checkpoints with clear explanations.
- Define any technical jargon simply in plain English; ensure zero patronizing tone or gatekeeping.
- Code blocks must be completely runnable, fully commented, and free of hidden assumptions.`;

      case "architect":
        return `### Audience Scaffolding: Staff Systems Architect & Formal Verification
- Maximize token-to-signal density; omit all conversational preamble, transitions, and pleasantries.
- State formal computational invariants, memory safety constraints, and asymptotic complexity (Time/Space).
- Deliver self-contained production artifacts with automated unit/integration test assertions.`;

      case "executive":
        return `### Audience Scaffolding: Executive Strategic Decision-Maker
- Provide an Executive Summary highlighting business ROI, feasibility, and architecture trade-offs.
- Structure technical comparisons in clear Markdown trade-off tables.
- Outline risk mitigation strategies, resource requirements, and next immediate milestone.`;

      case "practitioner":
      default:
        return `### Audience Scaffolding: Professional Practitioner
- Deliver production-grade idiomatic code with robust error handling and type definitions.
- Warn against common edge cases, boundary failures, and concurrency hazards.`;
    }
  }

}
