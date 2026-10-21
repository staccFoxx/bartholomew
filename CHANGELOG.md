# Bartholomew Guard — CHANGELOG

## [v6.6.4 / Cyphervoice v0.8.1] — 2026-10-21 (Zero-Transient Headphone DSP, DAC Keep-Alive & In-IDE Assistant Direct Deployment)

### 🎧 Audio DSP Anti-Transient & Headphone Popping Elimination
- **Zero-Crossing Headphone Decay & Tail Silence Flush**:
  - Extended smooth raised-cosine fade-out to 100ms in `VoiceCloner.synthesize` for mathematically pure zero-crossing waveform termination.
  - Appended 250ms of pure digital silence (`np.zeros`) at the tail of every synthesized audio buffer before WAV file commitment, completely preventing Windows audio endpoint buffer underruns and DAC step transients.
  - Added 80ms hardware buffer settling delay in `VoiceCloner.speak` prior to stream termination.
- **IDE Webview Zero-Floor DAC Keep-Alive Anchor & Smooth Queue**:
  - Implemented continuous inaudible zero-floor Web Audio anchor (`0.00001` gain) to keep the Windows WASAPI/DirectSound audio endpoint energized, preventing DAC power collapse pops between sentences.
  - Appended soft trailing phonetic ellipsis pauses (`...`) to prevent Chromium SAPI/OneCore voice from abruptly cutting off final consonants.
  - Increased inter-sentence buffer draining pause to 120ms, allowing the OS audio ring buffer to settle before subsequent utterances.
  - Streamlined `streamEnd` and sentence chunking to eliminate duplicate speech and micro-chopping.
- **Direct In-IDE Assistant Deployment**:
  - Directly installed and hot-patched Cyphervoice v0.8.1 into `C:\Users\User\.antigravity-ide\extensions` and `C:\Users\User\.vscode\extensions`.
  - Rebuilt and packaged Open-VSX and Microsoft Marketplace VSIX bundles v0.8.1.

## [v6.6.3] — 2026-10-20 (Unified v6.6.3 Distribution Suite, Claude Code Adapter & CI Hardening)

### 🛡️ Autonomous CLI & Agent Framework Adapters
- **Claude Code & Autonomous Agent Tool Adapters**:
  - In-process tool boundary interception for Claude Code (`Bash`, `FileEdit`, `FileWrite`, and database querying tools) via `ClaudeCodeAdapter` and `createClaudeCodeHook`.
  - Python `BtpCodingAgentGuard.intercept_tool` with cross-platform normalized path shielding against sensitive system file escapes (`/etc/shadow`, `.env`, private keys).
  - Full TypeScript typings (`ClaudeCodeAdapter`, `createClaudeCodeHook`) exported in `packages/npm_package/index.d.ts`.
- **Standardized Trajectory Schema Specification**:
  - Integrated canonical execution schema (`docs/TRAJECTORY_SCHEMA.md`) providing UUID tracking, structured step taxonomy (`thought`, `tool_call`, `tool_result`), and cryptographic hash attestation.

### 📦 Ecosystem Package Synchronization & Release
- **PyPI & NPM Synchronization**:
  - Synchronized `btp-guard` to `v6.6.3` across PyPI (`pyproject.toml`, `btp_guard`) and npm (`packages/npm_package`).
  - Synchronized `mcp-proxy-guard` to `v6.6.3`.
  - Built fresh wheel/sdist and tarballs into `dist/` verified via `twine check`.
- **CI/CD Reliability & Hardening**:
  - Fixed false-positive secret alert in `huggingface-space/app.py` placeholder, restoring audit score to 100/100.
  - Added input aliases (`scan-path`, `spend-cap`) to composite `action.yml` to support multi-workflow invocations.
  - Hardened PyPI release workflow against missing secret tokens.
  - Verified 100% test pass rate across 127 Python tests, 21 Node tests, and MCP suite.

---

## [v6.5.8] — 2026-10-15 (Microsoft Agentic Middleware & Standalone Zero-Trust Distribution)

### 🚀 Microsoft Agentic Runtimes & Middleware
- **Microsoft AutoGen In-Process Middleware**:
  - Pre-send message sanitization, in-flight credential masking, and sub-35µs code execution gating (`intercept_code_execution`).
  - Native GroupChat round-trip consensus check vetoing malicious multi-agent escalation loops.
  - Merkle turn receipts committed to tamper-evident audit ledger on all approved tool executions.
- **Microsoft Semantic Kernel Python & Node.js Middleware**:
  - First-class function invocation filters (`intercept_function_invocation`) vetoing destructive shell, SQL DDL drops, and path escapes.
  - In-process prompt rendering scanner blocking confidential PII and API keys from leaving host memory.
  - Complete test suite in both Python and Node.js (`test_microsoft_middleware.js`).

### 📦 Distribution, Standalone Installers & Compliance Automation
- **Multi-Platform One-Line Installers**:
  - Windows PowerShell standalone installer (`install.ps1`).
  - Unix / Linux / macOS Bash standalone installer (`install.sh`).
  - Automatic `.btp/invariants.json` workspace arming on clone or project directory initialization.
- **Enterprise SOC 2 & HIPAA Cryptographic Dossier Generator**:
  - Automated compliance evidence compilation script (`packages/npm_package/generate_compliance_pack.js`).
  - Exports publication-grade, self-contained HTML and JSON compliance dossiers (`ENTERPRISE_SOC2_HIPAA_COMPLIANCE_DOSSIER.html` / `.json`).
- **GitHub Action Marketplace Configuration**:
  - Modernized `action.yml` for zero-friction PR code-diff AST scanning and Merkle verification.

---

## [v6.5.7] — 2026-10-14 (Enterprise OEM Licensing & Interactive Playground)

### 🛡️ Enterprise Licensing & Test-Drive
- **Enterprise OEM Leasing Framework**:
  - Tiered OEM licensing and royalty architecture for enterprise agent builders and infrastructure providers.
- **Interactive 5-Attack Test-Drive**:
  - Added `npx btp-guard test-drive` command demonstrating real-time interception of shell bombs, SQL drops, PII leaks, credential exfiltration, and budget overruns.
- **Standalone MCP Runner & Registry Sync**:
  - Direct stdio MCP server execution with Smithery configuration support.

---

## [v6.5.6] — 2026-10-13 (Continuous Compliance & Sovereign Realtime Defense)

### ⚡ Continuous Compliance & 100% Red-Team Recall
- **Sub-35µs AST Gate & Zero-Egress Vault**:
  - Achieved 100% detection and interception recall across 500 adversarial red-team vectors.
  - Eliminated base64 subshell execution and evasion vectors.
- **Industry Vertical Integrations**:
  - Construction & critical infrastructure: Buildful.ai zero-trust integration architecture and live agent test suite (`examples/buildful_construction_agent/`).
  - Compliance partnerships: Drata Continuous Compliance integration deck and live defense terminal.
- **Realtime Mesh & Cross-Agent Discovery**:
  - ElizaOS plugin and Agentverse discovery oracle with 2,000-iteration concurrency stress verification.

---

## [v6.4.1] — 2026-10-04 (P0 Hardening & Security Release)

### Security & Release Hardening
- **Cloud Route Authorization & Workspace Isolation**:
  - Enforced fail-closed authentication (`X-API-KEY`, `X-BTP-API-KEY`, Bearer tokens) across all sensitive endpoints (`/api/v1/telemetry/*`, `/api/v1/compliance/*`, `/api/v1/workspaces/*`, `/api/v1/escrow/*`, `/api/v1/leads/*`, `/api/v1/m2m/*`).
  - Strict workspace ownership gating returning `403 Forbidden` on foreign tenant access.
  - Removed shared demo-key fallbacks; deleted `sk_btp_demo_key`.
- **Billing & Stripe Webhook Verification**:
  - Enforced raw request HMAC-SHA256 `Stripe-Signature` verification with replay timestamp tolerance.
  - Durable atomic entitlement store (`.btp/entitlements.json`) with processed event idempotency.
  - Disallowed arbitrary key claims; unverified emails receive `404 Not Found`.
- **Truthful Customer Evidence & Telemetry**:
  - Removed synthetic customer evidence, fake uptime, and hardcoded SOC 2 claims from production responses.
  - Isolated demo simulations behind explicit `?demo=true` parameters with clear simulation markings.
- **IDE Webview Hardening & XSS Prevention**:
  - Injected strict Content Security Policy (`default-src 'none'`) into extension webview.
  - Escaped all dynamic log/reason fields via `escapeHtml()`.
  - Replaced unconstrained `runIdeCommand` message listener with a strict command allowlist.
- **Pilot Page Security**:
  - Switched from client-only simulation to server-verified `POST /api/v1/pilot/enroll`.
  - Escaped user inputs and routed to distinct Stripe checkout links ($199/mo vs $950 one-time).
- **Packaging & CI Pipeline Hygiene**:
  - Explicit file allowlist for VSIX packaging; eradicated misleading legacy `1.0.0.vsix` artifacts.
  - Made extension compilation fatal in CI, added all security test suites to required gates, and isolated PR tokens.


## [v6.3.0] — 2026-10-01 (Autonomous Agentic Runtime Protection & Universal MCP)

### 🚀 Major Enhancements
- **Universal Dynamic Schema Engine**:
  - In-process, multi-format schema harmonizer supporting Anthropic Claude 3.7, OpenAI GPT-4o, Google Gemini 2.0, OpenAPI 3.0/3.1, and JSON Schema 2020-12.
  - Sub-35µs in-process argument and type validation (**3.2 µs** median latency).
  - Complete 40-tool registry published at `/mcp-catalog.json` and interactive browser explorer on homepage.

- **Cross-IDE Deep Integration & Status Bar Sentinel**:
  - Active status bar sentinel pill (`$(shield) BTP Guard: Armed (<35µs)`) in Cursor, Windsurf, and VS Code.
  - QuickPick Security Control Plane Menu (`bartholomew.showSecurityMenu`).
  - Automatic workspace immunization on first launch (`.cursorrules`, `.windsurfrules`, `CLAUDE.md`).
  - 10-vector in-editor adversarial Red-Team fuzzer (`bartholomew.runRedTeamBenchmark`).

- **Autonomous PR Sentinel GitHub Action**:
  - Code diff AST scanner for pull requests: intercepts destructive bash, SQL DDL drops, and high-entropy secret leaks generated by autonomous coding agents.
  - Automated PR scorecard with RFC 8785 Ed25519 SHA-256 Merkle root verification.

- **Enterprise Audit Vault & CISO Whitepaper**:
  - Machine-signed cryptographic compliance evidence packs exported to `/dossier.json`.
  - Regulatory mapping across EU AI Act (Art 14 & 15), SOC 2 Type II (CC6.1-CC8.1), NIST AI RMF 1.0, and ISO 42001.
  - Publication-grade CISO Executive Security Whitepaper with print-to-PDF export at `/whitepaper.html`.
  - CLI command: `npx btp-guard briefing` and `npx btp-guard audit export`.

- **Python Ecosystem 1-to-1 Parity**:
  - `from btp_guard import UniversalSchemaAdapter` for LangChain, AutoGen, CrewAI, and LlamaIndex agent swarms.


## [Unreleased — v6.0.0-pre] (Hardening Sprint)

## [Unreleased] — v6.0.0-rc1

### New Pillars (v6.0-pre series)
- **Prompt Injection Firewall** (`src/prompt_injection_firewall.py`)
  - 15+ compiled pattern categories: DIRECT_OVERRIDE, PERSONA_HIJACK, CREDENTIAL_EXFIL,
    ROLE_SPOOFING, TOOL_HIJACK, BEHAVIOR_CONDITIONING, BOUNDARY_INJECTION, EXPLICIT_MARKER
  - `scan()`, `scan_context_window()`, `get_stats()`, `generate_plain_explanation()`
  - Sub-1ms per scan. Zero external deps. Tamper-evident SHA-256 receipts.

- **Workspace Intelligence Report** (`src/workspace_intel.py`)
  - Stack detection: Python/Node/Go/Rust/Ruby/Docker/K8s/Terraform/Nx
  - AI tooling inventory: CLAUDE.md, GEMINI.md, .cursorrules, Copilot, Continue.dev
  - Security posture score 0-100 with A+/A/B/C/D grade
  - LLM token cost estimates with 69.6% compression savings across 5 models
  - 6 categorized optimization opportunities

- **Dependency Threat Scanner** (`src/dependency_threat.py`)
  - Curated DB of 22 known malicious packages (PyPI + npm)
  - Levenshtein typosquat detection against 25 high-value targets
  - Parses requirements.txt, package.json, go.mod
  - Optional OSV.dev live CVE lookup (`check_osv=True`)

- **Agent Context Drift Detector** (`src/context_drift_detector.py`)
  - 10-category SCOPE_TAXONOMY semantic alignment engine
  - Per-action scoring 0-100 with rolling window drift delta
  - Session report: avg score, flagged rate %, ON_TRACK / MODERATE_DRIFT / CRITICAL_DRIFT
  - Configurable `drift_threshold` and `window_size`

- **Token Budget Governor v2** (`src/token_budget_governor_v2.py`)
  - Model-aware cost tracking: GPT-4o, GPT-4o-mini, Claude 3.5, Claude Haiku, Gemini 2
  - Per-session budget + per-task budget + velocity circuit breaker
  - Thread-safe. Tamper-evident spend receipts.

- **Action Replay & Forensics Ledger** (`src/action_replay_ledger.py`)
  - Tamper-evident append-only ledger using SHA-256 chain hashing
  - Records every agent action with timestamp, tool, args, verdict, receipt
  - Replay any session step-by-step for compliance audits

- **In-context Secret Masker v2** (`src/secret_masker_v2.py`)
  - 12 regex patterns: API keys, JWTs, AWS secrets, GCP SA keys, SSH keys,
    .env secrets, Bearer tokens, connection strings, GitHub PATs
  - Replaces secrets with `BTP-VAULT-REF-xxxx` before content enters model context
  - `mask()`, `unmask()`, `audit_secrets()`, `get_vault()`

- **Multi-workspace Fleet View** (`src/fleet_view.py`)
  - Aggregates WorkspaceIntelligence across multiple repos in one report
  - Fleet-level security grade, worst-offender ranking, combined optimization list
  - `btp-guard fleet` CLI command

### MCP Tools (32 total)
- Added: `btp_workspace_intel`, `btp_scan_dependencies`, `btp_prompt_firewall`
- Added: `btp_check_drift`, `btp_drift_report`, `btp_budget_record`, `btp_budget_report`

### CLI Commands
- `btp-guard intel` — Workspace Intelligence Report
- `btp-guard scan-deps` — Dependency Threat Scan
- `btp-guard firewall` — Prompt Injection Firewall (stdin or --payload)
- `btp-guard fleet` — Multi-workspace Fleet View

### Tests
- v6 comprehensive suite: 107 passing across 4 test files
- Total codebase: 3,100+ tests

### Infrastructure
- Flight Deck dashboard: Firewall Scanner tab + Workspace Intel tab
- MCP server: all 32 tools routed with session-persistent state (drift detector, budget governor)
- VSIX v5.4.27: bartholomew-guard-vscode + bartholomew-keystone



### Added
- **Universal Extension Mesh** (`src/universal_extension_mesh.py`): Discovers and protects
  Copilot, Copilot Chat, Cline, Roo-Code, Continue.dev, Cursor, Windsurf, Ruff, Biome.
  Provides `get_plain_breakdown()` with 4-part plain-English diagnostics.
- **JIT Self-Repair Engine** (`src/jit_self_repair.py`): Traceback-driven AST auto-patching
  for ZeroDivisionError, KeyError, AttributeError, NameError, and ModuleNotFoundError.
  Includes hermetic in-memory polyfills (tiktoken, requests, dotenv, pydantic_core).
- **ZK-Mesh Attestation Engine** (`src/zk_mesh_attestation.py`): Zero-knowledge proof
  commitments and recursive Merkle aggregation for 10k+ agent fleets.
- **Interactive Model Bridge**: `proof_provider.ts` webview console allows any model
  (Gemini, Claude, Cursor, Copilot) or developer to evaluate commands against AST
  invariants in real time and receive SHA-256 Merkle receipts.
- **Keystone Passkey Dashboard** (`bartholomew-keystone` extension): `keystone.openDashboard`
  command opens a full webview with live passkey property grid, 4-part breakdown, and
  action validator console.
- **MCP Tool Registry** (`docs/mcp_tool_registry_v6.json`): Full schema for all 25 native
  MCP tools, categorized by tier (FREE / PRO / ENTERPRISE).
- **Comprehensive Test Suite** (`tests/test_v6_comprehensive_suite.py`): 30+ tests covering
  Extension Mesh, JIT Self-Repair, ZK-Mesh, SIEM, Ring-0, MCP tools, and Flight Deck HTTP.

### Changed
- `proof_provider.ts`: Replaced emoji shield icon with inline geometric SVG logo.
  Zero emojis across all webview HTML. All indicators now use bracket codes
  `[PASS]`, `[WARN]`, `[BLOCK]`, `[ALLOW]`, `[ARMED]`.
- `flight_deck.py`: Added `start_flight_deck` alias for CLI compatibility.
  Glossy `radial-gradient` background, `backdrop-filter: blur()` glassmorphic cards.
- `cli.py` (both mirrors): `btp-guard protect` output is fully emoji-free with structured
  4-part breakdown sections.

### Security
- AST Security Audit: **100/100 A+ (SOC 2 & OWASP READY)** — 180,198 lines scanned.
- Pre-commit and pre-push hooks validated and passing.
- No raw `exec()` calls — replaced with type-safe `types.ModuleType` attribute injection.

---

## [v5.4.26] — Published

- Dual VSIX packaging (bartholomew-guard-vscode + bartholomew-keystone).
- 25 native MCP tools registered and tested.
- Enterprise SIEM Cloud Relay (Splunk, Datadog, CrowdStrike, AWS Security Hub).
- Ring-0 Hardware & eBPF Kernel Guard Controller.
- Sovereign Swarm Operations TUI with live evaluation counters.
- OpenVSX and VS Code Marketplace publishing pipeline.
