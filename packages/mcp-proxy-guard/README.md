# **mcp-proxy-guard (v6.6.2)**
### **Microsecond-Latency (<20µs) In-Process Security Proxy & Credential Scrubber for Model Context Protocol (MCP)**

[![npm version](https://img.shields.io/npm/v/mcp-proxy-guard.svg?style=for-the-badge&color=emerald)](https://www.npmjs.com/package/mcp-proxy-guard)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg?style=for-the-badge)](LICENSE)
[![Latency](https://img.shields.io/badge/Latency-%3C20%C2%B5s-emerald.svg?style=for-the-badge)](https://bartholomew.info)

A zero-dependency, compiled in-process security gateway and credential scrubber for **any** Model Context Protocol (MCP) server running in **Claude Desktop**, **Cursor**, **Windsurf**, or **Cline**.

---

## **Why Do You Need This?**

When you connect Claude Desktop or Cursor to an MCP server (filesystem, terminal, SQLite, Postgres, GitHub, custom tools), the AI agent has raw, direct execution access to your operating system and databases.

Standard prompt guardrails and cloud filters **never inspect runtime tool execution**. If an agent hallucinates, runs a malicious bash script, or encounters indirect prompt injection, it can:
- Execute `rm -rf /` or `DROP TABLE accounts` before you notice.
- Exfiltrate live credentials (`sk-proj-...`, `AKIA...`, `ghp_...`, `.env`) across tool execution logs.

`mcp-proxy-guard` wraps any MCP server, intercepting JSON-RPC 2.0 messages across `stdio` in **under 20 microseconds**:
1. **Destructive Tool Veto**: Intercepts and blocks destructive arguments (`rm -rf`, `mkfs`, `DROP TABLE`, `TRUNCATE`, `/etc/shadow`, `chmod 777`).
2. **In-Flight Secret Redaction**: Scrubs OpenAI, Anthropic, AWS, GitHub, Stripe, and private keys from tool inputs and outputs.
3. **1-Command Auto-Hardening**: Instantly hardens all existing MCP servers in Claude Desktop and Cursor automatically.

---

## **1-Line Quickstart (Auto-Hardening)**

Run the automatic hardening wizard to auto-detect and protect all installed MCP configurations:

```bash
npx -y mcp-proxy-guard install
```
*Creates safe backups (`.bak`) of your configurations and transparently wraps every registered MCP server.*

---

## **Manual Configuration (Claude Desktop & Cursor)**

### **Claude Desktop (`claude_desktop_config.json`)**
```json
{
  "mcpServers": {
    "guarded-filesystem": {
      "command": "npx",
      "args": ["-y", "mcp-proxy-guard", "--", "npx", "-y", "@modelcontextprotocol/server-filesystem", "./"]
    }
  }
}
```

### **Cursor (`.cursor/mcp.json`)**
```json
{
  "mcpServers": {
    "guarded-terminal": {
      "command": "npx",
      "args": ["-y", "mcp-proxy-guard", "--", "bash"]
    }
  }
}
```

---

## **CLI Commands**

```bash
# Run self-contained security verification suite
npx mcp-proxy-guard test

# Inspect active security status & audit ledger
npx mcp-proxy-guard status

# Print client configuration template
npx mcp-proxy-guard config [claude|cursor]

# Configure metered API token for enterprise audit logging
npx mcp-proxy-guard activate <api_key>
```

---

## **Programmatic API (Node.js / TypeScript)**

```typescript
import { evaluateToolCall, scrubSecrets } from 'mcp-proxy-guard';

// 1. In-process tool check (<20µs latency)
const verdict = evaluateToolCall('execute_sql', { query: 'DROP TABLE users;' });
console.log(verdict.allowed); // false
console.log(verdict.reason);  // "[MCP-PROXY-GUARD VETO] Destructive pattern intercepted..."

// 2. In-flight secret scrubber
const scrubbed = scrubSecrets({ payload: "token sk-proj-1234567890abcdef" });
console.log(scrubbed.data.payload); // "token [REDACTED_OPENAI_KEY]"
```

---

## **Pricing & Architecture**

* **Community Tier**: 100% Free & Open-Source forever. Zero token tax, zero cloud latency, unlimited in-process execution.
* **Metered API & Enterprise Tier**: Pay-per-verification token wrap ($0.005 / audit receipt) for distributed multi-tenant swarms, centralized RFC 8785 Merkle logging, and statutory EU AI Act compliance evidence.
* **Portal & Documentation**: [https://bartholomew.info](https://bartholomew.info)

---

&copy; 2026 Bartholomew AI & Contributors. Distributed under the Apache-2.0 License.
