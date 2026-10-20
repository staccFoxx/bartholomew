# Bartholomew Agentic Runtime Protection (GitHub Action)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![PyPI](https://img.shields.io/badge/PyPI-v6.4.4-blue.svg)](https://pypi.org/project/btp-guard/)
[![CI/CD Status](https://img.shields.io/badge/CI%2FCD-Active-10b981.svg)](https://github.com/ivegotahunnitonit/bartholomew)

Deterministic AST invariant verification, credential leak prevention, and cryptographic Ed25519 execution receipts for autonomous AI agent codebases before pull requests merge into production.

---

## Quickstart

Add the following workflow to your repository at `.github/workflows/bartholomew_gate.yml`:

```yaml
name: Bartholomew Security Gate

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main ]

jobs:
  agent-security-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run Bartholomew Keystone Guard
        uses: ivegotahunnitonit/bartholomew@main
        with:
          audit-path: '.'
          fail-on-violation: 'true'
          generate-sarif: 'true'
          export-dossier: 'true'

      - name: Upload SARIF to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: bartholomew.sarif
```

---

## Action Inputs

| Input | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `audit-path` | Target directory or file path to evaluate against AST invariants | No | `.` |
| `fail-on-violation` | Block the CI/CD pipeline if an invariant violation or exposed credential is found | No | `true` |
| `generate-sarif` | Generate `bartholomew.sarif` for GitHub Code Scanning integration | No | `true` |
| `export-dossier` | Export SOC 2 / ISO 27001 verifiable cryptographic compliance dossier (`btp_dossier.json`) | No | `false` |
| `export-telemetry` | Export OpenTelemetry (OTel) traces for enterprise SIEM ingestion | No | `false` |

---

## Action Outputs

| Output | Description |
| :--- | :--- |
| `compliance-status` | `SOC2_PASSED` or `INVARIANT_VIOLATION` verdict |
| `audit-receipt-sha256` | RFC 8785 Canonical JSON SHA-256 cryptographic execution receipt digest |
| `eval-latency-us` | Average in-process evaluation latency in microseconds (<35µs SLA) |

---

## Key Capabilities

1. **Sub-35µs AST Invariant Gating:** Evaluates shell commands, SQL queries, and tool execution blocks against catastrophic execution patterns (`DROP TABLE`, `rm -rf /`, fork bombs, unauthorized net egress).
2. **Zero-Leak Secret Redaction:** Scrubs OpenAI, Anthropic, AWS, Stripe, and GitHub credentials in `<100µs`.
3. **SARIF 2.1.0 Integration:** Direct native reporting inside GitHub Security and Code Scanning dashboards.
4. **RFC 8785 Canonical JSON Receipts:** Issues verifiable SHA-256 Merkle execution receipts on every CI/CD run.
5. **SOC 2 Type II Evidence Dossier:** Generates signed compliance artifacts for external auditors.

---

## Support & Enterprise Retainers

For custom AST invariant rule packs, dedicated authority nodes, or enterprise fleet licenses:
- Portal: [https://bartholomew.info](https://bartholomew.info)
- Security Contact: `security@bartholomew.info`

Distributed under the MIT License.
