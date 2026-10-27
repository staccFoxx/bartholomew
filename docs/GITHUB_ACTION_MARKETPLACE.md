# Bartholomew Agentic Runtime Protection (ARP) GitHub Action
## Sub-35µs Deterministic AST Execution Gating & Secret Scrubbing for AI Agents

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Bartholomew%20ARP-purple?logo=github)](https://github.com/marketplace/actions/bartholomew-agentic-runtime-protection)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

### Overview
Automated coding agents (Devin, Claude Code, GitHub Copilot Workspace, SWE-bench bots) propose direct code changes and terminal actions in Pull Requests. Without deterministic gating, rogue or hallucinated agent diffs can introduce:
- Catastrophic terminal execution (`rm -rf /`, `mkfs`, format commands)
- Destructive database migrations (`DROP TABLE`, `DROP DATABASE`)
- Exposed secrets (`.env*`, OpenAI keys, AWS tokens, private keys)

**Bartholomew ARP Action** evaluates incoming agent changes against formal AST invariants in milliseconds on CPU, generating cryptographically signed Ed25519 Merkle receipts and automated GitHub Step Summaries.

---

### Quickstart

Add `.github/workflows/ai-guard.yml` to your repository:

```yaml
name: Bartholomew AI Agent Guard

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Bartholomew Invariant Gating
        uses: staccFoxx/bartholomew@main
        with:
          fail-on-violation: 'true'
          scan-path: '.'
          spend-cap: '50.0'
```

---

### Inputs

| Input | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `fail-on-violation` | Fail the workflow if an AST invariant or secret leak is detected | No | `'true'` |
| `scan-path` | Root directory path to audit for agent changes | No | `'.'` |
| `spend-cap` | Maximum allowable cumulative spend in USD for tool calls | No | `'50.0'` |

---

### Outputs

| Output | Description |
| :--- | :--- |
| `violations-count` | Number of detected security invariant and secret violations |
| `audit-receipt-hash` | Cryptographic Ed25519 Merkle digest for SOC 2 / ISO 42001 compliance |
| `compliance-status` | Audit status (`PASSED` or `FAILED`) |
