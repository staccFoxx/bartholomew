/**
 * PromptSmith - Omni-Disciplinary Equalizer Engine
 * Levels the playing field across:
 * - Systems Architects (Distributed systems, concurrency, idempotency, security)
 * - UI/UX & Product Designers (Design tokens, spring animations, WCAG AAA, spatial UI)
 * - Data & Intelligence Analysts (SQL, ETL, statistical inference, visualization contracts)
 * - Everyday Creators & Domain Specialists (Zero technical barrier, plain English to elite spec)
 * 
 * Features Cross-Pollination Synthesis: bridges design empathy into backend code,
 * and robust engineering architecture into creative and visual specifications.
 */

export type DisciplinaryLens = "architect" | "designer" | "analyst" | "creator";

export interface EqualizerProfile {
  lens: DisciplinaryLens;
  title: string;
  subtitle: string;
  badgeColor: string;
  primaryDomainFocus: string;
  equalizerDirectives: string[];
  crossPollinationDirectives: string[];
}

export class OmniEqualizerEngine {
  public static readonly PROFILES: Record<DisciplinaryLens, EqualizerProfile> = {
    // 1. Systems & Cloud Architects
    architect: {
      lens: "architect",
      title: "Systems Architect",
      subtitle: "High-Availability, Concurrency & Invariant Security",
      badgeColor: "#38bdf8",
      primaryDomainFocus: "Distributed Systems & Infrastructure",
      equalizerDirectives: [
        "Enforce formal computational invariants, boundary threshold recovery, and crash-only idempotency.",
        "Require explicit failure modes (network partition, thread starvation, connection pool exhaustion).",
        "State asymptotic time and memory space complexity (Big-O) for all algorithms.",
        "Deliver self-contained production code with zero unstated mock implementations."
      ],
      crossPollinationDirectives: [
        "Include ergonomic developer-experience (DX): clear error codes, actionable logs, and clean API contracts that frontend designers can consume effortlessly.",
        "Provide a minimal visual architecture flowchart or ASCII state transition diagram."
      ]
    },

    // 2. UI/UX & Product Designers
    designer: {
      lens: "designer",
      title: "Product & UI/UX Designer",
      subtitle: "Design Systems, Motion Ergonomics & WCAG AAA",
      badgeColor: "#ec4899",
      primaryDomainFocus: "Design Tokens, Spatial UI & Accessibility",
      equalizerDirectives: [
        "Structure all visual styling around cohesive Design Tokens: typography scale, 4px/8px spacing grid, color contrast, and elevation shadows.",
        "Enforce strict WCAG 2.2 AAA accessibility: ARIA landmarks, focus rings, keyboard tab-order, and high-contrast color ratios.",
        "Implement fluid spring physics and micro-interactions with graceful prefers-reduced-motion fallbacks.",
        "Ensure 100% responsive fluid breakpoints across mobile, tablet, desktop, and ultra-wide viewports."
      ],
      crossPollinationDirectives: [
        "Inject full engineering state management (idle, loading, error, success, empty states) with TypeScript prop interfaces.",
        "Define deterministic API contracts and mock payloads so backend engineers can implement the design immediately without ambiguity."
      ]
    },

    // 3. Data & Intelligence Analysts
    analyst: {
      lens: "analyst",
      title: "Data & Intelligence Analyst",
      subtitle: "Deterministic Queries, Statistical Rigor & Visual Contracts",
      badgeColor: "#10b981",
      primaryDomainFocus: "Data Pipelines, Statistics & Insights",
      equalizerDirectives: [
        "Structure SQL and data transformations with deterministic idempotency, partition pruning, and index optimization.",
        "Enforce statistical validity: report sample sizes, confidence intervals, and hypothesis test criteria (p-values, effect size).",
        "Specify exact visualization data contracts: chart axes, scales, aggregations, tooltips, and legend hierarchies.",
        "Handle nulls, NaN values, data skew, and time-zone conversions defensively."
      ],
      crossPollinationDirectives: [
        "Deliver intuitive executive summaries explaining statistical insights in plain English for non-technical stakeholders.",
        "Include actionable business takeaways and risk thresholds alongside quantitative figures."
      ]
    },

    // 4. Everyday Creators, Students & Domain Specialists
    creator: {
      lens: "creator",
      title: "Everyday Creator & Specialist",
      subtitle: "Zero Technical Barrier & Universal Idea Synthesis",
      badgeColor: "#eab308",
      primaryDomainFocus: "Universal Plain English to Elite Engineering Spec",
      equalizerDirectives: [
        "Deconstruct ideas into clean, welcoming step-by-step milestones with zero intimidating technical jargon.",
        "Use concrete, relatable everyday analogies so the logic is intuitive and transparent to any age group.",
        "Guarantee that all generated code or instructions are 100% complete, runnable, and explained simply.",
        "Encourage creative exploration while silently infusing production-grade engineering best practices under the hood."
      ],
      crossPollinationDirectives: [
        "Silently inject production-grade error-handling and security safeguards so the user's project is enterprise-ready from day one.",
        "Provide a clear 'Next Steps' checklist so the creator knows exactly how to test and run their creation."
      ]
    }
  };

  /**
   * Synthesizes Equalizer Scaffolding that bridges technical rigor and design empathy
   */
  public static getEqualizerBlock(lens: DisciplinaryLens, enableCrossPollination = true): string {
    const profile = this.PROFILES[lens] || this.PROFILES.creator;

    let block = `### Disciplinary Equalizer: ${profile.title} (${profile.subtitle})\n`;
    block += profile.equalizerDirectives.map(d => `- ${d}`).join("\n");

    if (enableCrossPollination) {
      block += `\n\n### Cross-Pollination Bridge (Leveling the Field across Design & Engineering)\n`;
      block += profile.crossPollinationDirectives.map(d => `- ${d}`).join("\n");
    }

    return block;
  }

  /**
   * Automatically detects the most relevant disciplinary lens based on vocabulary patterns
   */
  public static detectDisciplinaryLens(prompt: string): DisciplinaryLens {
    const text = prompt.toLowerCase();

    // Designer patterns
    const designerHits = (text.match(/\b(design|ui|ux|color|font|typography|spacing|padding|button|card|modal|css|tailwind|figma|animation|framer|motion|accessible|aria|theme|layout|responsive)\b/g) || []).length;

    // Architect patterns
    const architectHits = (text.match(/\b(architecture|backend|microservice|distributed|concurrency|thread|database|postgres|kafka|redis|api|grpc|latency|scale|docker|kubernetes|security|auth)\b/g) || []).length;

    // Analyst patterns
    const analystHits = (text.match(/\b(data|sql|query|table|dataset|analytics|metrics|dashboard|chart|visualization|statistics|model|regression|correlation|pipeline|etl|pandas)\b/g) || []).length;

    // Everyday creator indicators (hesitation, general words, high accessibility need)
    const creatorHits = (text.match(/\b(help me|how to|i want to make|simple|beginner|explain|student|homework|kids|story|recipe|idea|plain english)\b/g) || []).length;

    if (designerHits > architectHits && designerHits > analystHits && designerHits >= 2) {
      return "designer";
    }
    if (analystHits > architectHits && analystHits >= 2) {
      return "analyst";
    }
    if (architectHits >= 2) {
      return "architect";
    }
    if (creatorHits >= 1 || (designerHits === 0 && architectHits === 0 && analystHits === 0)) {
      return "creator";
    }

    return "architect";
  }
}
