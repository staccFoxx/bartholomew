<p align="center">
  <img src="https://acn-26670.web.app/assets/keystone_logo.png" width="112" height="112" alt="Bartholomew Keystone Logo" />
</p>

# Bartholomew Keystone &bull; Capability Passkeys & Spend Governor
### BTP v6.6.2 Zero-Trust Capability Tokens & Real-Time Micro-Spend Governor for Autonomous AI Agents

[![Deterministic Gate](https://img.shields.io/badge/Deterministic%20Gate-%3C15%CE%BCs-fde047?style=flat-square)](https://github.com/ivegotahunnitonit/bartholomew)
[![Passkey Security](https://img.shields.io/badge/Passkeys-Ed25519%20Signed-34d399?style=flat-square)](https://github.com/ivegotahunnitonit/bartholomew)
[![Runtime Compatibility](https://img.shields.io/badge/Runtimes-Cursor%20%7C%20Claude%20%7C%20Windsurf-38bdf8?style=flat-square)](https://github.com/ivegotahunnitonit/bartholomew)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE.md)

---

## Overview

**Bartholomew Keystone** is a deterministic, sub-15&mu;s cryptographic capability passkey engine and real-time spend governor for autonomous AI agent workflows in **Cursor, Claude Code, Windsurf, Cline, Aider, OpenHands, and VS Code**.

Instead of granting LLM agents unfettered system access to your terminal commands, file trees, and API budgets, Keystone requires every agent action to be cryptographically validated against an **Ed25519-signed capability clearance token**.

---

## Key Capabilities

### 1. Cryptographic Agent Clearance Passkeys
- **Granular Scoping**: Explicitly authorize which file paths an agent can mutate, which bash/powershell commands it can run, and which external endpoints it can reach.
- **Ed25519 Signatures**: Time-limited session tokens signed by your local master key ring. Unsigned or forged tool calls are dropped before reaching execution.
- **Instant Revocation**: Terminate agent access globally in a single click with the `keystone.revokePasskey` command.

### 2. Autonomous Agent Spend Governor & Circuit Breaker
- **Strict Spend Ceilings**: Enforce maximum per-turn API limits (e.g., `$0.50/turn`) and hard daily budget caps (e.g., `$10.00/day`, `$50.00/day`).
- **Runaway Loop Containment**: Detect recursive model hallucination loops and exfiltration cycles, halting execution before unexpected bills occur.
- **Micro-Budget Protection**: Safeguards team API keys with automated circuit breaker trips whenever turn velocity exceeds defined safe thresholds.

### 3. Sub-15&mu;s Invariant Gate
- **AST Gating**: Zero-latency in-process evaluation with sub-15 microsecond deterministic verification.
- **Non-Repudiation Audit Receipts**: Every approved action generates an immutable cryptographic signature appended to `.btp/audit.log`.

---

## Zero-Trust Architecture & Threat Invariants

Keystone operates as the capability passkey engine within the Bartholomew Trust Protocol (BTP) security fabric:

| Security Pillar | Enforcement Mechanism | Guarantee |
| :--- | :--- | :--- |
| **Command Execution** | Sub-15&mu;s in-process AST gating | Prevents destructive shell commands (`rm -rf`, format, drop table) |
| **Secret Redaction** | Zero-leakage environment sandbox | Blocks prompt injection reading `.env`, AWS/API credentials |
| **Spend Governance** | Micro-spend turn governor | Hard-caps token expenditure per transaction and per 24h session |
| **Audit Log Integrity** | RFC 8785 Merkle receipts | Cryptographic non-repudiation logged directly to `.btp/audit.log` |

---

## Target Runtime Matrix

Keystone seamlessly safeguards all major agent harnesses:
- **Cursor** (Composer, Agent Mode)
- **Claude Code** (Anthropic CLI)
- **Windsurf** (Cascade Architecture)
- **Cline** / **Roo-Code**
- **Aider**
- **OpenHands**
- **Smolagents** & **CrewAI**
- **MetaGPT** & **AutoGen**
- **Ollama** / **vLLM** Local Instances

---

## Getting Started

### 1. Issue Agent Clearance
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and run:
```text
Keystone: Issue Agent Capability Passkey
```
Select your desired session budget cap (e.g., `$10.00/day`) and target file permissions.

### 2. Inspect Clearance Dashboard
Run:
```text
Keystone: Open Passkey Dashboard & Capability Monitor
```
Monitor active spend usage, token limits, runtime clearance bounds, and test arbitrary commands against your signed clearance bounds in real time.

### 3. Verify Audit Receipts
Run:
```text
Keystone: View Clearance Audit Receipts
```
Inspect verifiable Ed25519 cryptographic receipts logged directly in `.btp/audit.log`.

---

## License

Licensed under the [Apache-2.0 License](https://www.apache.org/licenses/LICENSE-2.0). Part of the Bartholomew Trust Protocol (BTP).

