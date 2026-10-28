---
name: bartholomew-sentinel
description: Deterministic in-process AST security proxy, credential scrubber, and spend governor for MCP AI agents and developer runtimes (<35µs latency).
version: 6.6.7
author: Bartholomew AI
license: Apache-2.0
homepage: https://bartholomew.info
repository: https://github.com/staccFoxx/bartholomew
tags:
  - mcp
  - security
  - guardrails
  - credential-scrubber
  - spend-governance
  - ast-gating
  - claude-code
  - cursor
---

# Bartholomew Sentinel Guard — AI Agent Security & Spend Governor

Deterministic, in-process runtime defense and spend governance for AI coding agents (Cursor, Claude Code, GitHub Copilot, Codex CLI, and multi-agent meshes).

> **Median Latency:** 14.80 µs (In-Process AST inspection — zero cloud latency)  
> **Cryptographic Standard:** FIPS 186-5 Ed25519 Merkle receipts & RFC 8785 Canonical JSON  
> **Official Hub:** [https://bartholomew.info](https://bartholomew.info)

---

## ⚡ When to Use This Skill
Activate this skill whenever the agent is:
1. **Running shell or bash commands** (blocks recursive breakouts, `rm -rf`, fork bombs, unauthorized sudo).
2. **Reading or modifying files** (prevents exfiltration of `.env`, private keys, AWS credentials, SSH identities).
3. **Querying databases or executing SQL** (vetoes destructive `DROP TABLE`, `TRUNCATE`, unconstrained deletions).
4. **Calling billable tools or external APIs** (enforces human spend limits and micro-toll governance).

---

## 🚀 Quick Setup (MCP Integration)

### Option 1: Claude Code / Cursor / Codex CLI (npx)
Add to your agent's MCP configuration (`claude_desktop_config.json`, `mcp.json`, or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "bartholomew-guard": {
      "command": "npx",
      "args": ["-y", "btp-guard", "mcp"]
    }
  }
}
```

### Option 2: Python / PyPI
```bash
pip install btp-guard
btp-guard mcp
```

---

## 🛡️ Core Guardrail Invariants

### 1. In-Flight Secret Zeroization
Automatically masks API keys (`sk-proj-...`, `ghp_...`, AWS secrets) before prompts leave memory:
```bash
python cli.py audit --mask-secrets
```

### 2. Microsecond AST Gating
Every command proposed by an autonomous agent is evaluated against deterministic AST invariants in <35 µs:
- **Destructive Shell Veto:** `kill`, `rm -rf /`, `curl | bash` -> **BLOCKED**
- **Credential Path Protection:** `/etc/shadow`, `~/.aws/credentials`, `~/.ssh/id_rsa` -> **BLOCKED**
- **DDL Integrity Guard:** `DROP SCHEMA`, `DROP DATABASE` -> **BLOCKED**

### 3. Capability Passkeys
Prepaid evaluation passes for production and local team execution:
* **$10 Developer Passkey (100,000 AST Evals):** [https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607](https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607)
* **$15 Swarm Passkey (150,000 AST Evals + Multi-Agent Arbitration):** [https://buy.stripe.com/cNi3cv6tf6Y2cmAgpW9R608](https://buy.stripe.com/cNi3cv6tf6Y2cmAgpW9R608)
* **$5 Micro-Starter (50,000 AST Evals):** [https://buy.stripe.com/8x23cveZL4PUeuIflS9R606](https://buy.stripe.com/8x23cveZL4PUeuIflS9R606)

---

## 📊 Telemetry & Verification
Every allowed action mints a verifiable Ed25519 cryptographic receipt:
```bash
python cli.py verify --receipt <receipt_hash>
```
Visit [https://bartholomew.info/verify.html](https://bartholomew.info/verify.html) to independently audit any cryptographic receipt against the public Merkle root.

