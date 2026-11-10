/**
 * PromptSmith - Autonomous Lateral Pathfinding & Breakthrough Brainstorming Engine
 * 
 * Transcendental Ideation Architecture:
 * - Jacobi / Munger Inversion Principle (Solve the problem backwards; forbid the consensus traps).
 * - Arthur Koestler's Bisociation Theory (Cross-domain conceptual collision across 8 scientific regimes).
 * - Edward de Bono's Lateral Provocations (PO - Provocative Operations that break cognitive ruts).
 * - Genrich Altshuller's TRIZ Inventive Contradiction Elimination.
 * - Autonomous 3-Vector Lateral Divergence (Asymmetric Inversion, Bisociative Synthesis, Paradigm Transcendence).
 */

export interface LateralVector {
  id: "inversion" | "bisociation" | "transcendence";
  title: string;
  codename: string;
  paradigm: string;
  consensusTrapForbidden: string;
  counterIntuitiveMechanism: string;
  domainSource: string;
  concreteArchitecture: string;
  provocativeOperator: string;
  promptDirective: string;
}

export interface BrainstormSynthesis {
  challenge: string;
  consensusAttractors: string[];
  coreContradiction: { parameterA: string; parameterB: string; trizResolution: string };
  vectors: LateralVector[];
  masterBrainstormPrompt: string;
  recommendedPath: "inversion" | "bisociation" | "transcendence";
}

export class OrthogonalPathfinder {
  private static CONSENSUS_TRAPS = [
    { trigger: /\b(cache|fast|latency|speed|performance)\b/i, trap: "Generic Redis / Memcached in-memory caching layer", alternative: "Deterministic derived state / zero-copy memory-mapped ring buffers" },
    { trigger: /\b(scale|scaling|traffic|load)\b/i, trap: "Standard horizontal Kubernetes microservices behind an Nginx round-robin load balancer", alternative: "Cell-based self-contained actor clusters with geographic partition affinity" },
    { trigger: /\b(database|store|data|storage|persist)\b/i, trap: "Standard monolithic PostgreSQL CRUD with ORM schema migrations", alternative: "Append-only immutable event streams with client-side CRDT materialization" },
    { trigger: /\b(ui|dashboard|frontend|interface)\b/i, trap: "Cookie-cutter React + Tailwind + Redux admin dashboard with standard cards", alternative: "Spatial canvas / keyboard-driven command palette / reactive streaming event mesh" },
    { trigger: /\b(ai|llm|agent|bot|rag)\b/i, trap: "Generic naive vector similarity search (RAG) with ChromaDB and langchain", alternative: "Deterministic hierarchical AST grammar masking with dual-process heuristic gatekeepers" },
    { trigger: /\b(auth|login|security|permission)\b/i, trap: "Standard JWT bearer tokens stored in localStorage with centralized auth server", alternative: "Cryptographic capability-based object tokens (Macaroons / ZK-attestation) verified at network edge" },
    { trigger: /\b(search|filter|find)\b/i, trap: "Elasticsearch / OpenSearch cluster with polling re-indexers", alternative: "Probabilistic roaring bitmaps / inverted bloom index embedded directly in SSD NVMe pages" },
  ];

  private static BISOCIATION_DOMAINS = [
    {
      domain: "Cellular Immunology & Apoptosis",
      mechanism: "Decoy antigen receptors and programmed cell death (apoptosis) for toxic state elimination.",
      analogy: "Instead of garbage collection or memory leak debugging, processes have a genetically programmed lifespan and self-terminate harmlessly after fulfilling their burst."
    },
    {
      domain: "Mycelial Transport Networks",
      mechanism: "Decentralized nutrient-driven pressure gradients without a central routing ledger.",
      analogy: "Instead of a centralized message broker, nodes push work along highest-conductivity gradients; dead nodes wither while congested nodes naturally shed load."
    },
    {
      domain: "Quantum Superposition & Wave Interference",
      mechanism: "Simultaneous speculative multi-path calculation where erroneous paths undergo destructive interference.",
      analogy: "Instead of deciding which branch to execute, evaluate both concurrently in lightweight SIMD lanes, cancelling out the failing outcome without branching penalties."
    },
    {
      domain: "Avionics & Triple-Modular Redundancy",
      mechanism: "Dissimilar hardware/software implementations voting on flight invariants in real time.",
      analogy: "Instead of trusting one AI model or algorithm, run three radically dissimilar engines; proceed only when mathematical invariants match, instantly neutralizing hallucinations."
    },
    {
      domain: "Game Theory & Mechanism Design",
      mechanism: "Incentive-compatible Nash equilibria where defecting or failing is mathematically costlier than cooperating.",
      analogy: "Instead of defensive security firewalls, craft APIs where adversarial inputs or malicious attacks donate computational entropy that accelerates valid queries."
    },
    {
      domain: "Thermodynamics & Simulated Annealing",
      mechanism: "High-temperature exploration that progressively cools into optimal global energy minima.",
      analogy: "Early stages of ideation permit extreme stochastic leaps, gradually freezing parameters as deterministic invariants lock in."
    }
  ];

  public static synthesizeBrainstorm(prompt: string): BrainstormSynthesis {
    const raw = prompt.trim();
    const lower = raw.toLowerCase();

    // 1. Identify Consensus Traps
    const detectedTraps: string[] = [];
    const forbiddenTrophies: string[] = [];
    for (const item of this.CONSENSUS_TRAPS) {
      if (item.trigger.test(lower)) {
        detectedTraps.push(item.trap);
        forbiddenTrophies.push(item.alternative);
      }
    }
    if (detectedTraps.length === 0) {
      detectedTraps.push("Generic CRUD web service with standard relational tables");
      forbiddenTrophies.push("Single-binary autonomous worker with zero external dependencies");
    }

    // 2. Select Relevant Bisociation Domain
    const domainHash = Math.abs(raw.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0));
    const bisoc = this.BISOCIATION_DOMAINS[domainHash % this.BISOCIATION_DOMAINS.length];
    const bisoc2 = this.BISOCIATION_DOMAINS[(domainHash + 1) % this.BISOCIATION_DOMAINS.length];

    // 3. Construct the 3 Orthogonal Vectors
    const vInversion: LateralVector = {
      id: "inversion",
      title: "Asymmetric Inversion",
      codename: "Vector A: The Inverted Constraint",
      paradigm: "Jacobi Inversion ('Invert, always invert'). Turns the problem on its head by eliminating the need to solve it in the orthodox direction.",
      consensusTrapForbidden: detectedTraps[0],
      counterIntuitiveMechanism: "Forbid the conventional solution entirely. Instead of optimizing the bottleneck, remove the component that experiences the bottleneck.",
      domainSource: "First-Principles Physics & Jacobi Inversion",
      concreteArchitecture: `1. Identify the orthodox component (${detectedTraps[0]}).\n2. Treat its presence as a catastrophic failure of imagination.\n3. Implement: ${forbiddenTrophies[0] || "Compile-time static evaluation"}.\n4. Result: Zero ongoing maintenance, infinite scaling bound.`,
      provocativeOperator: `PO: What if the system functions flawlessly when the primary server is completely offline?`,
      promptDirective: `[ORTHOGONAL DIRECTIVE - INVERSION]\n- Strictly forbid the consensus solution: DO NOT use ${detectedTraps.join(" OR ")}.\n- Formulate an inverted architecture: how does the system accomplish the objective without storing or managing intermediate state?\n- Prove that the inverted approach eliminates at least 80% of conventional codebase overhead.`
    };

    const vBisociation: LateralVector = {
      id: "bisociation",
      title: "Bisociative Cross-Domain Fusion",
      codename: "Vector B: The Biological / Physical Analog",
      paradigm: `Arthur Koestler's Bisociation. Cross-pollinates the problem space with the natural invariants of ${bisoc.domain}.`,
      consensusTrapForbidden: detectedTraps[1] || "Monolithic state synchronization",
      counterIntuitiveMechanism: bisoc.mechanism,
      domainSource: bisoc.domain,
      concreteArchitecture: `${bisoc.analogy}\n\nKey Invariant: Translate ${bisoc.domain} principles directly into software primitives (e.g. self-healing circuits, decaying leases, gradient-directed messaging).`,
      provocativeOperator: `PO: The software is not an engineered machine; it is a living organism where individual parts die so the whole survives.`,
      promptDirective: `[ORTHOGONAL DIRECTIVE - BISOCIATION]\n- Infuse principles of ${bisoc.domain} into this solution.\n- Mechanism: ${bisoc.mechanism}\n- Map biological/physical resilience directly to software failure-mode handling; produce a novel design that no standard LLM would propose.`
    };

    const vTranscendence: LateralVector = {
      id: "transcendence",
      title: "Paradigm Transcendence",
      codename: "Vector C: The Moonshot Leap",
      paradigm: "Eliminates the entire problem category through radical abstraction or zero-knowledge formal verification.",
      consensusTrapForbidden: "Iterative incremental optimization of existing architectures",
      counterIntuitiveMechanism: "Shift from reactive orchestration to deterministic mathematical certainty (proof-carrying code, zero-state execution).",
      domainSource: "Theoretical Computer Science & Cryptographic Truth",
      concreteArchitecture: "Replace run-time coordination with compile-time mathematical proofs or client-side autonomous edge actors. Zero central authority, zero synchronization latency.",
      provocativeOperator: `PO: The operation takes 0 milliseconds because the answer is already mathematically bounded before the request is issued.`,
      promptDirective: `[ORTHOGONAL DIRECTIVE - PARADIGM TRANSCENDENCE]\n- Discard conventional industry incrementalism.\n- Synthesize a radical next-generation architecture that renders today's standard stack obsolete.\n- Structure the solution as a self-verifying, zero-coordination execution fabric with formal mathematical proof of correctness.`
    };

    // 4. Generate the Unified Master Brainstorm Blueprint
    const masterPrompt = `### PROMPTSMITH AUTONOMOUS LATERAL BRAINSTORMING BLUEPRINT
**Objective**: Shatter conventional consensus thinking and engineer an unprecedented orthogonal path.

#### Consensus Traps Strictly Forbidden
Standard AI models will instinctively propose:
${detectedTraps.map((t, idx) => `  ${idx + 1}. [FORBIDDEN] ${t}`).join("\n")}
*Rule: Do not propose, reference, or iterate upon any of the forbidden consensus tropes above.*

#### Lateral Vector A: The Inverted Constraint (Jacobi/Munger)
- **Premise**: ${vInversion.paradigm}
- **Provocation**: ${vInversion.provocativeOperator}
- **Architectural Shift**: ${vInversion.concreteArchitecture.replace(/\n/g, " ")}

#### Lateral Vector B: Bisociative Collision (${bisoc.domain})
- **Biological/Physical Source**: ${bisoc.domain}
- **Mechanism**: ${bisoc.mechanism}
- **Software Embodiment**: ${bisoc.analogy}

#### Lateral Vector C: Paradigm Transcendence (The Moonshot)
- **Provocation**: ${vTranscendence.provocativeOperator}
- **Mechanism**: Replace runtime coordination with deterministic edge invariants or zero-knowledge mathematical guarantees.

#### Synthesis Mandate
1. Present the 3 orthogonal options in an executive comparison matrix (Trade-offs, Novelty Index 1-100, Scalability Ceiling).
2. Deep-dive into the single most breakthrough path, delivering concrete runnable architecture, interfaces, and mathematical bounds.
3. Highlight precisely why this solution out-thinks standard AI outputs by at least an order of magnitude.`;

    return {
      challenge: raw,
      consensusAttractors: detectedTraps,
      coreContradiction: {
        parameterA: "Maximum Speed & Expressivity",
        parameterB: "Zero Operational Complexity & Overhead",
        trizResolution: "TRIZ Principle 10 (Prior Action) combined with Principle 28 (Mechanics Substitution)"
      },
      vectors: [vInversion, vBisociation, vTranscendence],
      masterBrainstormPrompt: masterPrompt,
      recommendedPath: "inversion"
    };
  }
}
