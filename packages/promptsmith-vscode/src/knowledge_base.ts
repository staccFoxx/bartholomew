/**
 * PromptSmith - Universal Domain Intelligence Engine
 * Comprehensive knowledge corpus spanning 16 foundational domains with dynamic
 * first-principles invariant synthesis for any arbitrary subject matter or context.
 */

export interface DomainRule {
  domain: string;
  category: "engineering" | "science" | "business" | "creative" | "legal" | "operations";
  matchPattern: RegExp;
  injectedConstraints: string[];
  recommendedOutputFormat: string;
  reasoningChecklist: string[];
}

export class KnowledgeBase {
  public static readonly DOMAIN_RULES: DomainRule[] = [
    // 1. AI Agents & Security
    {
      domain: "AI Agent Architecture & Tool-Calling Security",
      category: "engineering",
      matchPattern: /\b(agent|tool|shell|subprocess|bash|mcp|exec|command|spawn|curl|guardrail|injection)\b/i,
      injectedConstraints: [
        "Enforce strict parameterized subprocess execution; never use shell=True or unescaped pipe strings.",
        "Implement mandatory credential masking across stdout/stderr streams (mask sk-*, ghp_*, AKIA*).",
        "Enforce hard execution timeouts and bounded retry limits to prevent runaway reasoning loops.",
        "Block SSRF targeting cloud metadata endpoints (169.254.169.254, AWS IMDSv2, GCP metadata)."
      ],
      recommendedOutputFormat: "Structured tool-call JSON schema with explicit invariant validations and rollback logic.",
      reasoningChecklist: [
        "Are subshells isolated with fail-closed error handling?",
        "Is destructive disk/network action bounded by explicit user confirmation?",
        "Are all error traces scrubbed of sensitive environment variables?"
      ]
    },

    // 2. Finance & Valuation
    {
      domain: "Corporate Finance, Accounting & Valuation",
      category: "business",
      matchPattern: /\b(ebitda|fcff|lbo|dcf|wacc|valuation|ifrs|asc|balance sheet|working capital|covenants|revolver|moic|irr)\b/i,
      injectedConstraints: [
        "Under IFRS 16 / ASC 842, ensure operating lease liabilities deducted in Enterprise-to-Equity bridges are not simultaneously double-counted in operating cash flows.",
        "Relever and unlever asset betas strictly via Hamada's equation: beta_L = beta_U * [1 + (1 - Tax) * (Debt / Equity)].",
        "Present dynamic Monte Carlo or two-way sensitivity data tables across WACC and terminal exit multiples.",
        "Reconcile free cash flow to firm (FCFF) from NOPAT = EBIT * (1 - Tax), adding back D&A, deducting CapEx, and adjusting for Delta NWC."
      ],
      recommendedOutputFormat: "Three-statement linked financial model schedule with explicit cell formulas, assumptions block, and sensitivity matrix.",
      reasoningChecklist: [
        "Is lease interest expense properly segregated from operating expenses?",
        "Does the terminal growth rate stay below long-term GDP growth (max 2.0% - 2.5%)?",
        "Are debt service coverage ratios (DSCR) verified against default covenants?"
      ]
    },

    // 3. Frontend & UI Engineering
    {
      domain: "Fullstack Architecture & Modern React/TypeScript",
      category: "engineering",
      matchPattern: /\b(react|typescript|component|hook|state|frontend|tailwind|nextjs|vite|css|html|ui|ux)\b/i,
      injectedConstraints: [
        "Produce 100% type-safe TypeScript with strict null checks and zero 'any' casts.",
        "Ensure all interactive components adhere to WCAG 2.1 AA accessibility standards (ARIA roles, keyboard focus, screen-reader labels).",
        "Implement resilient client-side error boundaries with graceful offline fallback states.",
        "Avoid unnecessary re-renders; leverage memoization, React 19 compiler patterns, or atomic state primitives."
      ],
      recommendedOutputFormat: "Self-contained modular React components (.tsx) with typed props interface, CSS token styling, and interactive unit test.",
      reasoningChecklist: [
        "Is component state hydrated without layout shifts?",
        "Are event listeners cleanly unmounted in cleanup functions?",
        "Are touch and keyboard interactions accessible across mobile and desktop?"
      ]
    },

    // 4. Backend & Distributed Systems
    {
      domain: "Backend Services & Distributed Systems",
      category: "engineering",
      matchPattern: /\b(backend|api|fastapi|express|grpc|rest|kafka|rabbitmq|distributed|microservice|redis|concurrency)\b/i,
      injectedConstraints: [
        "Design idempotent API endpoints supporting atomic transactional state transitions.",
        "Incorporate distributed tracing (OpenTelemetry traceparent), request ID propagation, and structured JSON logs.",
        "Implement circuit breakers, exponential backoff with jitter, and dead-letter queues for asynchronous workers.",
        "Enforce strict schema validation and payload size ceilings on all inbound request bodies."
      ],
      recommendedOutputFormat: "Production backend router/controller with typed request/response contracts, middleware authentication, and health probes.",
      reasoningChecklist: [
        "Are all database transactions committed inside an explicit rollback block?",
        "Is connection pooling bounded to prevent thread starvation?",
        "Are rate-limiting headers returned on 429 status codes?"
      ]
    },

    // 5. Data Pipelines & SQL
    {
      domain: "Data Pipelines, Warehousing & BigQuery/SQL",
      category: "engineering",
      matchPattern: /\b(sql|bigquery|dataform|dbt|etl|elt|partition|clustering|snowflake|postgres|database)\b/i,
      injectedConstraints: [
        "Optimize partition and clustering keys to avoid costly full-table scans in analytics warehouses.",
        "Adhere to deterministic idempotent merges (MERGE INTO ... WHEN MATCHED THEN UPDATE WHEN NOT MATCHED THEN INSERT).",
        "Avoid SELECT *; project only explicit columns required by downstream transforms.",
        "Enforce schema evolution safety: backward-compatible column additions only, never destructive drops."
      ],
      recommendedOutputFormat: "Parameterized SQL or Dataform/dbt model with audit metadata, source declarations, and automated quality assertions.",
      reasoningChecklist: [
        "Are join keys clustered and indexed to prevent memory spill-to-disk?",
        "Are null checks explicitly handled in aggregates?",
        "Is the query cost bounded by partition pruning?"
      ]
    },

    // 6. Machine Learning & AI Engineering
    {
      domain: "Machine Learning, RAG & Vector Systems",
      category: "engineering",
      matchPattern: /\b(ml|machine learning|pytorch|tensorflow|rag|embedding|vector|fine-tuning|loss|transformer|tokens|llm)\b/i,
      injectedConstraints: [
        "Prevent data leakage by strictly computing scaling, normalization, and token statistics on the train split only.",
        "Incorporate hybrid dense/sparse vector retrieval with cross-encoder re-ranking for RAG pipelines.",
        "State explicit loss functions, learning rate schedules (warmup + cosine decay), and gradient clipping thresholds.",
        "Track evaluation metrics beyond accuracy: precision/recall AUC, calibration error, and inference latency per token."
      ],
      recommendedOutputFormat: "Modular PyTorch/Python pipeline with dataset loaders, training loop, validation metrics, and export checkpoints.",
      reasoningChecklist: [
        "Are random seeds set across numpy, torch, and Python runtime for reproducibility?",
        "Are embeddings normalized before cosine distance calculation?",
        "Are out-of-memory (OOM) guards and batch size auto-scaling implemented?"
      ]
    },

    // 7. Mathematics, Logic & STEM
    {
      domain: "Mathematical Proofs, Algorithms & Symbolic Logic",
      category: "science",
      matchPattern: /\b(math|proof|theorem|algorithm|complexity|calculus|algebra|asymptotic|matrix|combinatorics|differential)\b/i,
      injectedConstraints: [
        "Provide rigorous deductive step-by-step logic; state all axioms, lemmas, and initial boundary conditions explicitly.",
        "State exact asymptotic computational complexity (Big-O, Big-Omega, Big-Theta) for time and space.",
        "Verify edge-case extremes (n=0, n=1, empty sets, negative infinity, limit convergence).",
        "Render multi-term mathematical formulas in KaTeX / LaTeX formatting."
      ],
      recommendedOutputFormat: "Formal mathematical derivation with Theorem -> Proof -> Lemma breakdown and algorithmic complexity statement.",
      reasoningChecklist: [
        "Is the induction base case and inductive step formally proven?",
        "Does the integral/series converge within the stated domain of convergence?",
        "Are division-by-zero and singularity edge cases accounted for?"
      ]
    },

    // 8. Cybersecurity & Penetration Testing
    {
      domain: "Cybersecurity, Reverse Engineering & Zero-Trust",
      category: "engineering",
      matchPattern: /\b(security|vulnerability|exploit|cve|penetration|xss|csrf|buffer overflow|cryptography|tls|hashing)\b/i,
      injectedConstraints: [
        "Adhere to constant-time comparison algorithms for all signature and password verifications to defeat timing attacks.",
        "Use cryptographically secure random number generators (CSPRNG, crypto.randomBytes / secrets).",
        "Enforce strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and SameSite cookie flags.",
        "Never implement custom cryptographic primitives; leverage audited standards (AES-GCM, Ed25519, Argon2id)."
      ],
      recommendedOutputFormat: "Threat model analysis (STRIDE) with reproduction proof-of-concept, CVE mapping, and defensive patch code.",
      reasoningChecklist: [
        "Is user input sanitized against both reflected and DOM-based injection vectors?",
        "Are encryption keys separated from ciphertext and managed in an HSM/KMS?",
        "Does the authentication flow enforce replay protection via nonces?"
      ]
    },

    // 9. Legal, Contracts & Regulatory
    {
      domain: "Legal Drafting, Compliance & IP Licensing",
      category: "legal",
      matchPattern: /\b(legal|contract|agreement|clause|liability|indemnification|license|patent|copyright|gdpr|compliance)\b/i,
      injectedConstraints: [
        "Draft unambiguous, jurisdiction-aware contractual language with defined terms capitalized and cross-referenced.",
        "Include standard commercial protections: mutual indemnification, limitation of liability, severance, and governing law.",
        "Enforce explicit data privacy protections complying with GDPR, CCPA, and industry-standard security safeguards.",
        "State representations and warranties with explicit disclaimers of implied merchantability."
      ],
      recommendedOutputFormat: "Formatted legal agreement schedule with Section -> Clause hierarchy, definitions block, and signature blocks.",
      reasoningChecklist: [
        "Are all defined terms used consistently throughout all provisions?",
        "Is the limitation of liability cap tied to trailing fees paid (e.g. 12 months)?",
        "Are termination-for-cause and transition assistance clauses clearly bounded?"
      ]
    },

    // 10. Creative Writing, Narrative & Copywriting
    {
      domain: "Creative Narrative, Worldbuilding & High-Conversion Copy",
      category: "creative",
      matchPattern: /\b(story|fiction|narrative|copywriting|headline|character|dialogue|poem|sonnet|script|screenplay)\b/i,
      injectedConstraints: [
        "Demonstrate 'Show, Don't Tell' sensory detail; avoid exposition dumps and passive voice.",
        "Maintain strict stylistic tone and character voice consistency across all narrative beats.",
        "For copy: anchor headline around the primary customer pain wedge, establish high-signal social proof, and present a low-friction call-to-action.",
        "If poetic form is requested (sonnet, villanelle, haiku), adhere strictly to meter (iambic pentameter) and rhyming schemes."
      ],
      recommendedOutputFormat: "Polished narrative prose or high-converting copy hierarchy with headline, hook, body, and conversion CTA.",
      reasoningChecklist: [
        "Does the pacing escalate naturally toward the climactic inflection point?",
        "Are clichés and generic adjectives replaced with vivid, specific imagery?",
        "Is the emotional arc grounded in authentic character motivation?"
      ]
    },

    // 11. Product Management & Strategy
    {
      domain: "Product Management, PRDs & Systems Strategy",
      category: "business",
      matchPattern: /\b(prd|product|roadmap|user story|acceptance criteria|feature|mvp|kpi|churn|retention|persona)\b/i,
      injectedConstraints: [
        "Frame features around user outcomes and metrics (activation, retention, LTV) rather than technical outputs.",
        "Structure user stories using the standard format: As a [persona], I want [action], so that [business value].",
        "Define unambiguous, testable Given-When-Then acceptance criteria for every functional requirement.",
        "Include explicit out-of-scope declarations and risk mitigation trade-offs."
      ],
      recommendedOutputFormat: "Product Requirement Document (PRD) with Problem Statement, User Stories, Acceptance Matrix, and Rollout Strategy.",
      reasoningChecklist: [
        "Are success metrics (leading and lagging KPIs) quantified with baseline targets?",
        "Are edge-case error states specified from the end-user perspective?",
        "Is the feature scoped for rapid incremental iteration?"
      ]
    },

    // 12. Systems Programming (Rust/C++/Go)
    {
      domain: "Systems Programming & Low-Level Concurrency",
      category: "engineering",
      matchPattern: /\b(rust|c\+\+|golang|assembly|memory|pointer|allocator|concurrency|mutex|thread|syscall)\b/i,
      injectedConstraints: [
        "Guarantee memory safety: prevent data races, use-after-free, and double-free conditions.",
        "In Rust, prioritize idiomatic borrow checker semantics; minimize unsafe blocks and document invariants for any raw pointer dereference.",
        "Leverage RAII and smart pointers (std::unique_ptr, Arc/Mutex) for deterministic resource cleanup.",
        "Optimize cache locality (struct-of-arrays vs array-of-structs) for hot performance loops."
      ],
      recommendedOutputFormat: "Idiomatic source code with memory safety annotations, zero-allocation data structures, and benchmark suite.",
      reasoningChecklist: [
        "Are deadlocks prevented by enforcing a global lock ordering hierarchy?",
        "Are resources cleanly closed via Drop/destructor semantics even during panics?",
        "Is memory overhead zero-cost at compile time?"
      ]
    },

    // 13. Cloud, DevOps & Kubernetes
    {
      domain: "Cloud Architecture, DevOps & Infrastructure as Code",
      category: "engineering",
      matchPattern: /\b(aws|gcp|azure|terraform|kubernetes|docker|k8s|helm|ci\/cd|github actions|ingress|iam)\b/i,
      injectedConstraints: [
        "Adhere to least-privilege IAM policies with resource-level scoping and temporary role assumption.",
        "Ensure Infrastructure as Code (Terraform/CDK) is modular, parameterized across environments, and enables state locking.",
        "Configure Kubernetes pods with resource requests/limits, readiness/liveness probes, and non-root security contexts.",
        "Automate zero-downtime deployment strategies (blue-green or rolling updates with health checks)."
      ],
      recommendedOutputFormat: "Declarative IaC template (Terraform/Kubernetes YAML) with variable definitions and automated CI validation workflow.",
      reasoningChecklist: [
        "Are container images signed and scanned for vulnerabilities?",
        "Are sensitive secrets injected via secure vault/secret references rather than plaintext?",
        "Is high availability distributed across multiple availability zones?"
      ]
    },

    // 14. Academic Research & Pedagogy
    {
      domain: "Academic Research, Literature Synthesis & Pedagogy",
      category: "science",
      matchPattern: /\b(research|paper|dissertation|citation|literature review|methodology|hypothesis|academic|journal)\b/i,
      injectedConstraints: [
        "Ground all claims in peer-reviewed empirical evidence; cite seminal authors, publication years, and methodologies.",
        "Critique methodological limitations (selection bias, confounding variables, statistical power).",
        "Structure explanations progressively from intuitive conceptual analogies to formal mathematical rigor.",
        "Distinguish between correlation and verified causal mechanisms."
      ],
      recommendedOutputFormat: "Peer-reviewed journal paper structure: Abstract -> Background -> Methodology -> Findings -> Limitations.",
      reasoningChecklist: [
        "Are alternative rival hypotheses explicitly considered and tested?",
        "Is statistical significance accompanied by practical effect size (Cohen's d)?",
        "Are citations accurately attributed without parametric hallucination?"
      ]
    },

    // 15. Mobile Engineering (iOS/Android/Flutter)
    {
      domain: "Mobile Application Engineering (iOS/Android/Flutter)",
      category: "engineering",
      matchPattern: /\b(ios|swift|swiftui|android|kotlin|jetpack|flutter|react native|mobile|app store|push notification)\b/i,
      injectedConstraints: [
        "Design for memory-constrained mobile environments; release background resources and unbind observers.",
        "Ensure seamless offline operation with local database caching (Room/CoreData/SQLite) and automatic sync on reconnect.",
        "Handle dynamic screen sizes, orientation changes, and system accessibility font scaling.",
        "Execute long-running network and compute tasks strictly on background threads/coroutines without blocking the main UI thread."
      ],
      recommendedOutputFormat: "Clean architecture mobile module (Swift/Kotlin) with ViewModel, UI declaration, and offline repository.",
      reasoningChecklist: [
        "Is 60fps/120fps UI rendering maintained without frame drops?",
        "Are push notification payloads handled gracefully when the app is in the background?",
        "Are runtime permissions requested contextually with clear user rationale?"
      ]
    },

    // 16. Executive Outbound & Commercial Conversion
    {
      domain: "Executive Strategy & Commercial Deal Structuring",
      category: "business",
      matchPattern: /\b(executive|pitch|outbound|sales|partnership|sponsor|enterprise|closing|deal|investor)\b/i,
      injectedConstraints: [
        "Lead with the quantifiable economic wedge ($/time saved, revenue unlocked, risk eliminated) in the opening sentence.",
        "Eliminate apologetic preambles, marketing fluff, and rhetorical clichés.",
        "Provide a zero-friction integration or adoption roadmap with a clear, low-commitment next step.",
        "Anticipate the primary procurement/security objections upfront with concrete proof points."
      ],
      recommendedOutputFormat: "High-impact executive brief: 1. Core Value Wedge -> 2. Verifiable Evidence -> 3. Concrete Action Path.",
      reasoningChecklist: [
        "Is the message tailored directly to the specific decision-maker's incentives?",
        "Does the proposal provide immediate demonstrable ROI?",
        "Is the call to action binary, actionable, and low-friction?"
      ]
    },

    // 17. Meta-Prompt Engineering & System Prompt Architecture
    {
      domain: "Meta-Prompt Engineering & Frontier System Instructions",
      category: "engineering",
      matchPattern: /\b(write a prompt|create a prompt|build a prompt|design a prompt|give me a prompt|prompt for|prompt that can|prompt to help|system prompt|how should i prompt|how do i prompt|better prompt|prompt looking for|craft a prompt|prompt template|agent prompt|meta-prompt)\b/i,
      injectedConstraints: [
        "Output MUST be an executable, production-grade system prompt or meta-prompt architecture with delimited XML/Markdown blocks.",
        "Include explicit system persona, invariant constraints, negative constraints (anti-patterns to reject), input schemas, and few-shot exemplars.",
        "Provide a self-verification checklist so the target AI model tests and verifies its output before returning it.",
        "NEVER generate generic software code when the user is explicitly requesting a prompt or prompt optimization."
      ],
      recommendedOutputFormat: "Production System Prompt Architecture: <system_role>, <context>, <invariants>, <negative_constraints>, <input_schema>, <few_shot_examples>, <verification_rubric>.",
      reasoningChecklist: [
        "Does the synthesized prompt clearly establish the AI's persona, boundaries, and objective?",
        "Are edge cases and anti-hallucination guardrails explicitly defined?",
        "Is the output format strictly specified with verification assertions?"
      ]
    },

    // 18. Laws of Physics, Thermodynamics & Dimensional Mechanics
    {
      domain: "Laws of Physics, Thermodynamics & Dimensional Mechanics",
      category: "science",
      matchPattern: /\b(physics|thermodynamic|entropy|navier-stokes|quantum|maxwell|relativity|conservation of|gravity|mass-energy|joule|watt|kelvin|newton|pascal|momentum|dimensional analysis|buckingham|fluid dynamics|lorentz|doppler|speed of light)\b/i,
      injectedConstraints: [
        "Enforce fundamental physical conservation laws: conservation of mass, momentum, energy (Delta U = Q - W), and entropy non-decrease (dS >= 0).",
        "Verify dimensional homogeneity via Buckingham Pi theorem; ensure all physical quantities possess consistent SI base units ([M], [L], [T], [I], [Theta], [N], [J]).",
        "Analyze limiting asymptotic boundary cases (e.g., non-relativistic limit v << c, Knudsen number Kn -> 0, zero-temperature ground states T -> 0).",
        "Include explicit physical falsification criteria to stress-test any derived equation or claim against empirical reality."
      ],
      recommendedOutputFormat: "Rigorous Physical Derivation & Analysis: 1. Physical Axioms & Invariants -> 2. Dimensional Homogeneity Proof -> 3. Mathematical Formulation -> 4. Asymptotic Boundary Verification & Falsification Suite.",
      reasoningChecklist: [
        "Are units and physical dimensions strictly consistent on both sides of every equation?",
        "Does the system obey the Second Law of Thermodynamics and causality?",
        "Are boundary limits (e.g., v -> c, T -> 0, scale extremes) physically coherent?"
      ]
    },

    // 19. Real-World Situations, Crisis Management & Operations
    {
      domain: "Real-World Situations, Crisis Management & Operations",
      category: "operations",
      matchPattern: /\b(real life|real-life|situation|crisis|emergency|operations|logistics|supply chain|hospital|shutdown|authorities|disaster|incident response|escalation|factory|plant)\b/i,
      injectedConstraints: [
        "Ground decisions in real-world human cognitive capacity, logistical bottlenecks, and physical resource availability.",
        "Establish explicit crisis triage levels, communication chains of command, and fail-safe recovery procedures.",
        "Eliminate panic-inducing ambiguity; provide clear, actionable directives with contingency decision trees.",
        "Clearly delineate between verified empirical facts, probabilistic inferences, and unknown operational parameters."
      ],
      recommendedOutputFormat: "Actionable Operational Playbook: 1. Situation Assessment & Triage -> 2. Immediate Containment Directives -> 3. Stakeholder Communication Protocol -> 4. Recovery & Verification Checklist.",
      reasoningChecklist: [
        "Does the protocol minimize operational downtime and prioritize human safety?",
        "Are communication directives clear, unambiguous, and panic-free?",
        "Is there a validated secondary fallback if primary communications or power rails fail?"
      ]
    },

    // 20. Human Communication Dynamics & Cognitive Calibration
    {
      domain: "Human Communication Dynamics, Cognitive Calibration & Rhetoric",
      category: "creative",
      matchPattern: /\b(communication style|tone|pedagogical|explain to|all ages|high school|graduate|socratic|audience|rhetoric|dialogue|interpersonal|diplomacy|calmly|negotiation|empathy|clarity)\b/i,
      injectedConstraints: [
        "Dynamically calibrate cognitive load and terminology to the target audience (e.g., intuitive analogies for novices, rigorous formalisms for researchers).",
        "Preserve 100% conceptual and technical precision across all communication styles; never simplify facts to the point of falsehood.",
        "Structure explanations with Socratic scaffolding: establish intuition first, introduce formal definitions, and verify understanding with interactive questions.",
        "Account for emotional resonance, psychological safety, and clear actionable takeaways."
      ],
      recommendedOutputFormat: "Calibrated Communication Architecture: 1. Core Message / Intuitive Hook -> 2. In-Depth Multi-Perspective Breakdown -> 3. Common Misconceptions Addressed -> 4. Comprehension Verification Checks.",
      reasoningChecklist: [
        "Is the tone tailored to the intended audience without being condescending or overly dense?",
        "Is technical accuracy maintained while improving accessibility?",
        "Are verification questions provided to confirm recipient understanding?"
      ]
    }
  ];

  /**
   * Universal Domain Enrichment Engine:
   * Returns a matching specialized domain rule or dynamically synthesizes a first-principles
   * expert profile for any topic, science, industry, or creative field.
   */
  public static getDomainEnrichment(prompt: string): DomainRule {
    const text = prompt.trim();
    if (!text) {
      return this.synthesizeUniversalRule("General Knowledge & Computing");
    }

    // 1. Check against the 16 core foundational disciplines
    for (const rule of this.DOMAIN_RULES) {
      if (rule.matchPattern.test(text)) {
        return rule;
      }
    }

    // 2. Dynamic Synthesis for any arbitrary, cross-disciplinary, or novel field
    return this.synthesizeUniversalRule(text);
  }

  /**
   * Synthesizes an authoritative first-principles domain rule dynamically for any subject.
   */
  private static synthesizeUniversalRule(text: string): DomainRule {
    // Extract primary topic keywords from prompt
    const words = text
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 3 && !/^(this|that|with|from|have|make|what|when|where|which|about|please|would|could)$/i.test(w));
    
    const topic = words.slice(0, 3).join(" ") || "General Technical Reasoning";
    const titleCased = topic.charAt(0).toUpperCase() + topic.slice(1);

    return {
      domain: `${titleCased} & Systems Invariants`,
      category: "engineering",
      matchPattern: /.*/,
      injectedConstraints: [
        `Execute with authoritative expert rigor grounded in established ${titleCased} first principles.`,
        "Enforce strict logical consistency with zero unverified assumptions or speculative non-answers.",
        "Provide self-contained, fully resolved deliverables with explicit edge cases and boundary conditions.",
        "Prioritize high signal-to-noise clarity; eliminate conversational filler, throat-clearing, and meta-commentary."
      ],
      recommendedOutputFormat: `Structured authoritative deliverable: 1. Specification / Core Principles -> 2. Complete Artifact -> 3. Empirical Verification Test.`,
      reasoningChecklist: [
        `Are all claims verified against established domain standards in ${titleCased}?`,
        "Are edge cases, exceptions, and boundary failures addressed?",
        "Is the solution immediately actionable without requiring missing context?"
      ]
    };
  }
}
