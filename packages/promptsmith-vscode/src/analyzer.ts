/**
 * PromptSmith - Analytical Prompt Intelligence & Cognitive Analytics Engine
 * Evaluates prompt quality, constraint density, token efficiency, multi-model benchmarking,
 * and cognitive learning pattern analytics (CLT, ZPD, Bloom's Taxonomy, Flesch-Kincaid).
 */

import { KnowledgeBase } from "./knowledge_base";
import { ModelBenchmarkEngine, BenchmarkTarget } from "./benchmarks";
import { CognitivePatternEngine, CognitiveAnalysis } from "./learner";
import { OmniEqualizerEngine, DisciplinaryLens, EqualizerProfile } from "./equalizer";
import { OrthogonalPathfinder, BrainstormSynthesis } from "./orthogonal";
import { PreemptiveFutureEngine, FutureHorizonAnalysis } from "./preemptive";

export interface PromptMetrics {
  iqScore: number;
  wordCount: number;
  estimatedTokens: number;
  optimizedTokens: number;
  tokenSavingsPercent: number;
  constraintScore: number;
  roleScore: number;
  schemaScore: number;
  evasionScore: number;
  efficiencyScore: number;
  detectedDomain: string;
  targetRuntime: string;
  strengths: string[];
  weaknesses: string[];
  missingElements: string[];
  benchmarks: BenchmarkTarget[];
  cognitive: CognitiveAnalysis;
  discipline: DisciplinaryLens;
  equalizer: EqualizerProfile;
  brainstorm: BrainstormSynthesis;
  future: FutureHorizonAnalysis;
}

export class PromptAnalyzer {
  private static FILLER_PATTERNS = [
    /\b(can you please|could you please|please kindly|i would like you to|i want you to)\b/gi,
    /\b(as an ai language model|as a helpful assistant|in order to help me)\b/gi,
    /\b(feel free to|make sure that you|try your best to)\b/gi,
    /\b(basically|essentially|actually|obviously|literally)\b/gi,
  ];

  private static ROLE_PATTERNS = [
    /\b(you are (a|an)|act as (a|an)|your role is|expert in|specialist in)\b/i,
    /<role>[\s\S]*?<\/role>/i,
    /### Role/i
  ];

  private static CONSTRAINT_PATTERNS = [
    /\b(do not|never|must not|only|strictly|ensure|avoid|limit to|maximum of|minimum of)\b/gi,
    /<constraints>[\s\S]*?<\/constraints>/i,
    /### Constraints/i
  ];

  private static SCHEMA_PATTERNS = [
    /\b(json|yaml|xml|markdown|table|schema|format as|output format)\b/i,
    /<output_format>[\s\S]*?<\/output_format>/i,
    /```(json|yaml|markdown|csv)/i
  ];

  private static REASONING_PATTERNS = [
    /\b(step[- ]by[- ]step|think|reason|verify|analyze|deliberate|chain[- ]of[- ]thought)\b/i,
    /<thinking>[\s\S]*?<\/thinking>/i
  ];

  public static analyze(prompt: string, targetRuntime = "Cursor / Claude Code"): PromptMetrics {
    const text = prompt.trim();
    if (!text) {
      return this.emptyMetrics();
    }

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const estimatedTokens = Math.ceil(wordCount * 1.33);

    // 1. Role Score (0-20)
    let roleScore = 0;
    if (this.ROLE_PATTERNS.some(p => p.test(text))) {
      roleScore = 20;
    } else if (/\b(senior|engineer|architect|auditor|specialist)\b/i.test(text)) {
      roleScore = 12;
    }

    // 2. Constraint Score (0-25)
    let constraintScore = 0;
    const constraintMatches = text.match(new RegExp(this.CONSTRAINT_PATTERNS[0], "gi")) || [];
    if (constraintMatches.length >= 3) {
      constraintScore = 25;
    } else if (constraintMatches.length > 0) {
      constraintScore = constraintMatches.length * 8;
    }

    // 3. Schema & Formatting Score (0-20)
    let schemaScore = 0;
    if (this.SCHEMA_PATTERNS.some(p => p.test(text))) {
      schemaScore = 20;
    } else if (/\b(list|bullet|code|diff)\b/i.test(text)) {
      schemaScore = 10;
    }

    // 4. Evasion / Boundary Score (0-15)
    let evasionScore = 0;
    if (this.REASONING_PATTERNS.some(p => p.test(text))) {
      evasionScore += 10;
    }
    if (/\b(if unsure|edge case|exception|boundary|fallback)\b/i.test(text)) {
      evasionScore += 5;
    }

    // 5. Token Efficiency Score (0-20)
    let fillerCount = 0;
    for (const pattern of this.FILLER_PATTERNS) {
      const m = text.match(pattern);
      if (m) fillerCount += m.length;
    }
    const efficiencyScore = Math.max(0, 20 - fillerCount * 4);

    // Calculate Estimated Optimized Tokens
    const fillerWordEstimate = fillerCount * 3;
    const optimizedTokens = Math.max(15, estimatedTokens - fillerWordEstimate);
    const tokenSavingsPercent = Math.max(0, Math.round(((estimatedTokens - optimizedTokens) / estimatedTokens) * 100));

    // Calculate Total IQ Score (0-100)
    const iqScore = Math.min(100, Math.max(10, roleScore + constraintScore + schemaScore + evasionScore + efficiencyScore));

    // Detect Domain from KnowledgeBase
    const domainRule = KnowledgeBase.getDomainEnrichment(text);
    const detectedDomain = domainRule ? domainRule.domain : "General Reasoning & Code";

    // Strengths & Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingElements: string[] = [];

    if (domainRule) {
      strengths.push(`Recognized ${domainRule.domain} domain patterns`);
    }

    if (roleScore >= 15) strengths.push("Strong persona & system identity");
    else missingElements.push("Explicit System Persona / Role Boundary");

    if (constraintScore >= 18) strengths.push("Well-defined operational boundaries");
    else weaknesses.push("Vulnerable to scope-drift (insufficient negative constraints)");

    if (schemaScore >= 15) strengths.push("Explicit output schema defined");
    else missingElements.push("Deterministic Output Schema (JSON/Markdown tags)");

    if (efficiencyScore < 14) weaknesses.push(`Contains ${fillerCount} conversational filler phrases`);
    else strengths.push("High token-to-signal density");

    // Cognitive Pattern Recognition
    const cognitive = CognitivePatternEngine.analyzeCognitivePattern(text, detectedDomain);
    strengths.push(`Cognitive calibration: ${cognitive.audienceLabel} (Grade ${cognitive.fleschKincaidGrade})`);

    // Disciplinary Equalizer Analysis
    const discipline = OmniEqualizerEngine.detectDisciplinaryLens(text);
    const equalizer = OmniEqualizerEngine.PROFILES[discipline];
    strengths.push(`Equalizer Lens: ${equalizer.title} (${equalizer.primaryDomainFocus})`);

    // Multi-Model Benchmarks
    const benchmarks = ModelBenchmarkEngine.benchmarkPrompt(text);
    const brainstorm = OrthogonalPathfinder.synthesizeBrainstorm(text);
    const future = PreemptiveFutureEngine.analyzeFutureReadiness(text);

    return {
      iqScore,
      wordCount,
      estimatedTokens,
      optimizedTokens,
      tokenSavingsPercent,
      constraintScore,
      roleScore,
      schemaScore,
      evasionScore,
      efficiencyScore,
      detectedDomain,
      targetRuntime,
      strengths,
      weaknesses,
      missingElements,
      benchmarks,
      cognitive,
      discipline,
      equalizer,
      brainstorm,
      future
    };
  }

  private static emptyMetrics(): PromptMetrics {
    return {
      iqScore: 0,
      wordCount: 0,
      estimatedTokens: 0,
      optimizedTokens: 0,
      tokenSavingsPercent: 0,
      constraintScore: 0,
      roleScore: 0,
      schemaScore: 0,
      evasionScore: 0,
      efficiencyScore: 0,
      detectedDomain: "None",
      targetRuntime: "Cursor / Claude Code",
      strengths: [],
      weaknesses: ["Prompt is empty"],
      missingElements: ["All core components"],
      benchmarks: ModelBenchmarkEngine.benchmarkPrompt(""),
      cognitive: CognitivePatternEngine.analyzeCognitivePattern(""),
      discipline: "creator",
      equalizer: OmniEqualizerEngine.PROFILES["creator"],
      brainstorm: OrthogonalPathfinder.synthesizeBrainstorm(""),
      future: PreemptiveFutureEngine.analyzeFutureReadiness("")
    };
  }
}
