<p align="center">
  <img src="https://acn-26670.web.app/assets/guard_logo.png" width="96" height="96" alt="Bartholomew Guard Logo" />
</p>

# **Bartholomew Guard (v6.6.3)**
### **In-Process AI Agent Firewall, Guardrails & Execution Security for Cursor, Claude Code, Windsurf & Copilot**

[![Open-VSX Version](https://img.shields.io/open-vsx/v/Bartholomew/bartholomew-guard-vscode?style=for-the-badge&color=emerald)](https://open-vsx.org/extension/Bartholomew/bartholomew-guard-vscode)
[![Downloads](https://img.shields.io/open-vsx/dt/Bartholomew/bartholomew-guard-vscode?style=for-the-badge&color=blue)](https://open-vsx.org/extension/Bartholomew/bartholomew-guard-vscode)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg?style=for-the-badge)](https://www.apache.org/licenses/LICENSE-2.0)
[![Latency](https://img.shields.io/badge/Latency-%3C20%C2%B5s-emerald.svg?style=for-the-badge)](https://bartholomew.info)
[![Security Rating](https://img.shields.io/badge/Audit-100%25%20Verified-success.svg?style=for-the-badge)](https://bartholomew.info/compliance)

Bartholomew Guard is a zero-latency, compiled in-process security firewall and deterministic runtime protection engine for developers pair-programming with autonomous AI coding agents (**Cursor**, **Claude Code**, **GitHub Copilot**, **Windsurf**, **Cline**, and **Aider**).

It inspects agent-generated tool calls, terminal commands, and file edits in **under 20 microseconds** using polyglot Abstract Syntax Tree (AST) analysis, stopping rogue actions before they execute.

---

## **Why Standard AI Guardrails Fail in Coding Agents**

Traditional LLM guardrails (like Llama Guard, NeMo, or cloud moderation APIs) rely on calling secondary models over HTTP. This adds **500ms to 2,500ms of lag per turn**, costs API tokens, and remains vulnerable to prompt injection bypasses.

**Bartholomew Guard executes in-process inside your editor:**
* **Zero Cloud Latency**: Compiled byte-range AST scanners evaluate commands in **`< 20 µs`** (1,000x faster than network filters).
* **Deterministic Protection**: Immune to jailbreak phrasing, prompt injection, and hallucinated bypasses.
* **Hermetic Workspace Fencing**: Guarantees autonomous agents can never modify files or read secrets outside your active repository.
* **Cryptographic Attestation**: Every allowed or denied action is signed with Ed25519 into an RFC 8785 Merkle audit log.

---

## **What Bartholomew Guard Protects Against**

| Threat Vector | What Rogue Agents Try | Bartholomew Guard Action (<20µs) |
| :--- | :--- | :--- |
| **Catastrophic Shell Deletions** | `rm -rf /`, `rm -rf ~`, recursive purge | **VETO**: Intercepted before OS boundary |
| **Credential Exfiltration** | Exfiltrating `.env`, `id_rsa`, `credentials.json` | **MASK**: High-entropy keys scrubbed in-flight |
| **Destructive Database Mutations** | `DROP TABLE users;`, `TRUNCATE` | **VETO**: Destructive DDL halted |
| **Insecure Privilege Escalation** | `sudo`, `chmod 777 /`, `chown root` | **VETO**: Privilege escalation vetoed |
| **Model Context Leakage** | Leaking Stripe, OpenAI, AWS, or GitHub tokens | **REDACT**: Instant in-memory zeroization |

---

## **Multi-Assistant Support**

Bartholomew Guard provides native 1-click protection across your entire development stack:
- **Cursor IDE** (Rule immunization via `.cursorrules` & `.cursor/rules/`)
- **Claude Code CLI** (In-process terminal wrapper & tool execution sandbox)
- **Windsurf AI** (Cascade workflow & tool gating)
- **GitHub Copilot** (Pre-commit hook & workspace confinement)
- **Cline / Roo-Code** (MCP security proxy integration)
- **VS Code / VSCodium** (Activity bar telemetry, dashboard & passkeys)

---

## **Quickstart**

### **1. Install the Extension**
From Cursor, Windsurf, or VS Code:
```bash
code --install-extension Bartholomew.bartholomew-guard-vscode
```

### **2. 1-Click Link & Arm Workspace**
Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) and run:
> **Bartholomew: Link & Arm Workspace (1-Click)**

This automatically:
- Configures deterministic AST rules for your project boundary.
- Sets up the fail-closed pre-commit sentinel hook.
- Activates in-process secret scrubbing and Keystone spend governance.

### **3. Inspect Live Telemetry**
Click the **Bartholomew Shield icon** in your activity bar to view your live execution telemetry, active passkey clearances, and cryptographic audit receipts.

---

## **Enterprise Compliance & Auditing**

* **EU AI Act Conformity**: Article 14 (Human Oversight) and Article 15 (Cybersecurity & Accuracy) attestations.
* **SOC 2 Type II Evidence**: RFC 8785 Merkle receipts generated for CC6.1, CC6.6, and CC7.1 controls.
* **Air-Gapped SCIF Support**: 100% offline mathematical verification with zero external egress.

---

## **Community & Feedback**

* **Official Portal**: [https://bartholomew.info](https://bartholomew.info)
* **GitHub Repository**: [https://github.com/ivegotahunnitonit/bartholomew](https://github.com/ivegotahunnitonit/bartholomew)
* **Report Issues / Feedback**: [https://github.com/ivegotahunnitonit/bartholomew/issues](https://github.com/ivegotahunnitonit/bartholomew/issues)

If Bartholomew Guard saved your workspace from an accidental deletion or credential leak, please **leave a review on the marketplace** and star the repository!

---

&copy; 2026 Bartholomew AI & Contributors. Distributed under the Apache-2.0 License.
