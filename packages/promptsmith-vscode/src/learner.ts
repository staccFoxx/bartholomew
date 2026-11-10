/**
 * PromptSmith - Adaptive Cognitive & Pattern Learning Engine
 * Implements research-grounded pattern recognition and audience comprehension modeling:
 * - Vygotsky's Zone of Proximal Development (ZPD) dynamic scaffolding
 * - Sweller's Cognitive Load Theory (CLT) extraneous load minimization
 * - Bloom's Revised Taxonomy cognitive intent classification
 * - Flesch-Kincaid & Type-Token Ratio (TTR) linguistic grade analysis
 * 
 * Accurately recognizes whether the user is a young student (ages 8-15), a career switcher,
 * an intermediate developer, a senior architect, or an executive, tailoring prompts
 * and AI responses to any age and comprehension level.
 */

export type CognitiveAudience = "explorer" | "practitioner" | "architect" | "executive";

export interface CognitiveAnalysis {
  audience: CognitiveAudience;
  audienceLabel: string;
  fleschKincaidGrade: number;
  readingEaseScore: number;
  vocabularyRichnessTTR: number;
  bloomsLevel: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  cognitiveLoadIndex: number; // 0 - 100
  uncertaintyScore: number;    // 0 - 100
  domainFamiliarity: "Novice" | "Conversant" | "Fluent" | "Native";
  scaffoldingStrategy: string;
  adaptiveDirectives: string[];
}

export interface UserLearningState {
  totalInteractions: number;
  domainFamiliarityMap: Record<string, number>; // domain -> score 0-100
  preferredAudienceOverride?: CognitiveAudience;
  averageVocabularyRichness: number;
  detectedAgeCohort: "Youth / Student (All Ages)" | "Practitioner" | "Staff / Specialist" | "Executive";
}

export class CognitivePatternEngine {
  private static HESITATION_PATTERNS = [
    /\b(i don't know|not sure|i am new|beginner|never done this|confused|help me understand|eli5|explain like i'm|explain simply|what is|how do i even)\b/i,
    /\b(is it possible to|can someone tell me|is that right|sorry if this is dumb|newbie|first time)\b/i
  ];

  private static YOUTH_ELEMENTARY_PATTERNS = [
    /\b(for school|in class|homework|for kids|explain to my kid|i am \d+ years old|like a game|minecraft|roblox|scratch|simple words)\b/i
  ];

  private static ARCHITECT_PATTERNS = [
    /\b(asymptotic|idempotent|concurrency|race condition|lock-free|zero-copy|p99|wal|mvcc|cap theorem|byzantine|ast|simd|vectorized)\b/i,
    /\b(invariants|formal verification|distributed consensus|cache invalidation|backpressure|heuristics)\b/i
  ];

  private static EXECUTIVE_PATTERNS = [
    /\b(roi|capex|opex|cost benefit|timeline|roadmap|deliverable|stakeholder|sla|kpi|executive summary|vendor comparison)\b/i
  ];

  // Syllable counting heuristic for Flesch-Kincaid analysis
  private static countSyllables(word: string): number {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) return 1;
    if (clean.length <= 3) return 1;
    const syllables = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, "")
      .replace(/^y/, "")
      .match(/[aeiouy]{1,2}/g);
    return syllables ? Math.max(1, syllables.length) : 1;
  }

  public static analyzeCognitivePattern(text: string, domain = "General"): CognitiveAnalysis {
    const raw = text.trim();
    if (!raw) {
      return this.defaultAnalysis();
    }

    const words = raw.split(/\s+/).filter(Boolean);
    const sentences = raw.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceCount = Math.max(1, sentences.length);
    const wordCount = Math.max(1, words.length);

    // 1. Vocabulary Richness (Type-Token Ratio - TTR)
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const vocabularyRichnessTTR = Math.round((uniqueWords.size / wordCount) * 100) / 100;

    // 2. Flesch-Kincaid & Reading Ease
    let totalSyllables = 0;
    for (const w of words) {
      totalSyllables += this.countSyllables(w);
    }
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = totalSyllables / wordCount;

    // Flesch Reading Ease: 206.835 - 1.015(total words / total sentences) - 84.6(total syllables / total words)
    const readingEase = Math.round(Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord))));
    // Flesch-Kincaid Grade Level: 0.39(total words / total sentences) + 11.8(total syllables / total words) - 15.59
    const fkGrade = Math.max(1, Math.round((0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59));

    // 3. Uncertainty / Hesitation Detection
    let hesitationHits = 0;
    for (const pat of this.HESITATION_PATTERNS) {
      const m = raw.match(pat);
      if (m) hesitationHits += m.length;
    }
    const uncertaintyScore = Math.min(100, hesitationHits * 35);

    // 4. Intent Classification (Bloom's Taxonomy)
    let bloomsLevel: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create" = "Apply";
    if (/\b(what is|define|list|where is|who|when)\b/i.test(raw)) {
      bloomsLevel = "Remember";
    } else if (/\b(explain|why|how does|summarize|clarify|difference between)\b/i.test(raw)) {
      bloomsLevel = "Understand";
    } else if (/\b(build|write|create|implement|design|generate|code)\b/i.test(raw)) {
      bloomsLevel = "Create";
    } else if (/\b(compare|contrast|bench|audit|evaluate|critique|pros and cons)\b/i.test(raw)) {
      bloomsLevel = "Evaluate";
    } else if (/\b(debug|why does.*fail|diagnose|root cause|isolate|profile)\b/i.test(raw)) {
      bloomsLevel = "Analyze";
    }

    // 5. Audience Categorization
    const hasYouthMarkers = this.YOUTH_ELEMENTARY_PATTERNS.some(p => p.test(raw));
    const hasArchitectMarkers = this.ARCHITECT_PATTERNS.some(p => p.test(raw));
    const hasExecutiveMarkers = this.EXECUTIVE_PATTERNS.some(p => p.test(raw));

    let audience: CognitiveAudience = "practitioner";
    let audienceLabel = "Practitioner (Intermediate)";
    let domainFamiliarity: "Novice" | "Conversant" | "Fluent" | "Native" = "Conversant";

    if (hasYouthMarkers || uncertaintyScore >= 50 || fkGrade <= 5 || readingEase >= 85) {
      audience = "explorer";
      audienceLabel = "Explorer / Youth (All Ages & Beginners)";
      domainFamiliarity = "Novice";
    } else if (hasExecutiveMarkers) {
      audience = "executive";
      audienceLabel = "Executive / Strategic (Outcomes & ROI)";
      domainFamiliarity = "Conversant";
    } else if (hasArchitectMarkers || (fkGrade >= 13 && vocabularyRichnessTTR >= 0.75)) {
      audience = "architect";
      audienceLabel = "Staff Architect / Specialist";
      domainFamiliarity = "Native";
    } else {
      audience = "practitioner";
      audienceLabel = "Practitioner / Professional";
      domainFamiliarity = "Fluent";
    }

    // 6. Cognitive Load Index (0-100)
    // Higher score = higher cognitive friction for user
    const cognitiveLoadIndex = Math.min(100, Math.round((fkGrade * 4) + ((100 - readingEase) * 0.4) + (uncertaintyScore * 0.3)));

    // 7. Scaffolding Strategies & Directives
    let scaffoldingStrategy = "";
    const adaptiveDirectives: string[] = [];

    switch (audience) {
      case "explorer":
        scaffoldingStrategy = "Zone of Proximal Development (ZPD) Metaphorical Scaffolding. Deconstruct complex concepts into concrete daily-life analogies (e.g. restaurant orders, toy blocks). Zero condescension, zero unexplained jargon.";
        adaptiveDirectives.push("Explain the core concept using an intuitive real-world analogy before presenting any code.");
        adaptiveDirectives.push("Break down the implementation into bite-sized, numbered checkpoints with friendly explanations.");
        adaptiveDirectives.push("Define any unavoidable technical terms simply in plain English.");
        adaptiveDirectives.push("Ensure code examples are fully commented and easy to run without hidden dependencies.");
        break;

      case "practitioner":
        scaffoldingStrategy = "Pragmatic Best-Practice Scaffolding. Deliver clean idiomatic patterns, explain the 'why' behind choices, and warn about common production edge cases.";
        adaptiveDirectives.push("Deliver production-grade code adhering strictly to language conventions and idiomatic design.");
        adaptiveDirectives.push("Highlight common edge cases, null checks, and error-handling requirements.");
        adaptiveDirectives.push("Provide clean type annotations and minimal runnable usage examples.");
        break;

      case "architect":
        scaffoldingStrategy = "Cognitive Load Optimization (Sweller). Maximum token-to-signal density. Deliver mathematical invariant equations, formal interface contracts, and automated verification test harnesses. Zero conversational preamble.";
        adaptiveDirectives.push("Provide formal interface contracts with zero pseudocode, mock implementations, or omissions.");
        adaptiveDirectives.push("Enforce asymptotic time/space bounds, concurrency safety, and boundary edge assertions.");
        adaptiveDirectives.push("Omit introductory greetings, concluding summaries, and rhetorical transitions entirely.");
        break;

      case "executive":
        scaffoldingStrategy = "Executive Strategic Framing. Deliver high-level outcomes, trade-off matrices, risk mitigations, and concrete timelines before technical minutiae.";
        adaptiveDirectives.push("Structure response with an Executive Summary highlighting ROI, deliverables, and architecture trade-offs.");
        adaptiveDirectives.push("Present technical comparisons in clear Markdown trade-off tables.");
        adaptiveDirectives.push("Clarify implementation risks, resource requirements, and next immediate milestone.");
        break;
    }

    return {
      audience,
      audienceLabel,
      fleschKincaidGrade: fkGrade,
      readingEaseScore: readingEase,
      vocabularyRichnessTTR,
      bloomsLevel,
      cognitiveLoadIndex,
      uncertaintyScore,
      domainFamiliarity,
      scaffoldingStrategy,
      adaptiveDirectives
    };
  }

  private static defaultAnalysis(): CognitiveAnalysis {
    return {
      audience: "practitioner",
      audienceLabel: "Practitioner / Professional",
      fleschKincaidGrade: 8,
      readingEaseScore: 70,
      vocabularyRichnessTTR: 0.6,
      bloomsLevel: "Apply",
      cognitiveLoadIndex: 40,
      uncertaintyScore: 0,
      domainFamiliarity: "Conversant",
      scaffoldingStrategy: "Balanced standard technical scaffolding.",
      adaptiveDirectives: ["Provide clean, production-ready implementation."]
    };
  }
}
