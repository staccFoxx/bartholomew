---
title: Bartholomew AI Agent Runtime Guardrail & Security Playground
emoji: 🛡️
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: apache-2.0
short_description: Deterministic in-process AST execution firewall & secret tokenizer
---

# 🛡️ Bartholomew Guard — AI Agentic Runtime Protection (ARP)

[![Open In Colab](https://img.shields.io/badge/Website-bartholomew.info-blue.svg)](https://bartholomew.info)
[![PyPI](https://img.shields.io/pypi/v/btp-guard.svg)](https://pypi.org/project/btp-guard/)
[![npm](https://img.shields.io/npm/v/btp-guard.svg)](https://www.npmjs.com/package/btp-guard)
[![Open-VSX](https://img.shields.io/badge/Open--VSX-v6.6.2-emerald)](https://open-vsx.org/extension/Bartholomew/bartholomew-guard-vscode)

Bartholomew is the open-source in-process execution firewall for autonomous AI coding agents (Cursor, Claude Code, Windsurf, AutoGen, CrewAI, LangGraph).

### Key Invariants
- **Deterministic In-Process AST Gating**: Blocks destructive shell commands (`rm -rf`, `DROP TABLE`, disk wipes) before they reach the OS or database.
- **In-Flight Secret Tokenization**: Replaces OpenAI, AWS, and GCP credentials with format-preserving surrogates before LLM ingestion.
- **RFC 8785 Merkle Audit Receipts**: Cryptographically signed audit trail exportable for SOC 2 Type II and EU AI Act compliance.
- **100% Free Forever Core**: Zero recurring subscriptions, local execution, unlimited evaluations.
