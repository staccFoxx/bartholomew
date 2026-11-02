# btp-guard

> **Sub-Millisecond In-Process Execution Firewall & Deterministic AST Safety Gate for Autonomous Agents**  
> *Bartholomew Trust Protocol (BTP v7.0.0) — Node.js & TypeScript (Zero External Dependencies)*

[![npm version](https://img.shields.io/npm/v/btp-guard?style=flat-square&color=38bdf8)](https://www.npmjs.com/package/btp-guard)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-emerald.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg?style=flat-square)](https://www.npmjs.com/package/btp-guard)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.npmjs.com/package/btp-guard)
[![Downloads](https://img.shields.io/npm/dm/btp-guard?style=flat-square&color=a855f7)](https://www.npmjs.com/package/btp-guard)

---

## What is Bartholomew Guard?

**Bartholomew Guard** (`btp-guard`) is a high-performance in-process security gateway and invariant compiler for autonomous AI agents, tool callers, and swarms (Google GenAI, LlamaIndex, AutoGen, Semantic Kernel, Vercel AI SDK, LangChain.js, Claude Code, Cursor, Windsurf, Ollama).

It operates directly inside your Node.js runtime process memory before system calls reach the OS boundary. With **sub-millisecond in-process latency** and **zero GPU overhead**, Bartholomew:
- Intercepts and denies destructive commands (`rm -rf`, `DROP TABLE`, `mkfs`, fork bombs)
- Scrubs in-flight credentials (`sk-*`, AWS tokens, private keys) before logging or egress
- Enforces Non-Human Identity (NHI) capability passkeys and micro-spend caps ($5/action, $25/day)
- Issues machine-verifiable RFC 8785 Ed25519 Merkle receipts for SOC 2 Type II and EU AI Act compliance

---

## Installation

```bash
npm install btp-guard
```

Or run directly with `npx`:
```bash
npx btp-guard arm
```

---

## Quickstart Integrations

### 1. Vercel AI SDK (`ai`)

Wrap any tool definition in deterministic AST invariants with a single call:

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { guardVercelAITool } from 'btp-guard';

export const terminalTool = guardVercelAITool(
  tool({
    description: 'Execute shell commands',
    parameters: z.object({ command: z.string() }),
    execute: async ({ command }) => {
      // Deterministically protected: destructive commands (rm -rf, fork bombs)
      // are intercepted in <35µs and return structured recovery envelopes
      return runBash(command);
    },
  }),
  { spendCap: 5.0 }
);
```

### 2. LangChain.js & LangGraph.js

Harden LangChain tools and multi-agent graph nodes:

```typescript
import { DynamicTool } from '@langchain/core/tools';
import { guardLangChainJsTool } from 'btp-guard';

const databaseTool = guardLangChainJsTool(
  new DynamicTool({
    name: 'sql_query_executor',
    description: 'Run SQL queries against production database',
    func: async (sql) => {
      // Destructive DDL (DROP TABLE, TRUNCATE, ALTER USER) is blocked before dispatch
      return queryDatabase(sql);
    },
  })
);
```

### 3. Universal Tool Wrapper (Node.js / Express / Fastify / MCP)

Protect arbitrary tool functions in any JavaScript framework:

```typescript
import { guardUniversalAgentTool } from 'btp-guard';

const safeExecute = guardUniversalAgentTool('file_writer', async ({ filePath, content }) => {
  // Path traversal attacks (../../etc/passwd) and sensitive files (.env) are blocked
  return fs.writeFileSync(filePath, content);
});
```

### 4. Local Model Runtime Gateway (Ollama, vLLM, llama.cpp)

Protect local models and coding assistants with an in-process proxy:

```bash
# Wrap local Ollama (localhost:11434) behind sub-35µs Bartholomew AST gates:
npx btp-guard wrap --upstream http://localhost:11434 --port 8081

# Now point Cursor, Windsurf, or Open WebUI to http://localhost:8081/v1
```

---

## Core API Reference

### 1. In-Process Intent Gate (`evaluateIntent`)

Evaluate arbitrary tool calls or shell commands in caller memory in `<35µs`:

```typescript
import { evaluateIntent, verifyReceipt } from 'btp-guard';

const result = evaluateIntent({
  agentId: 'worker-node-01',
  actionType: 'EXECUTE_QUERY',
  payload: { sql: 'SELECT * FROM users WHERE active = true;' }
});

console.log('Allowed:', result.allowed);          // true
console.log('Latency:', result.latencyUs, 'µs');   // 24.8 µs
console.log('Verdict:', result.verdict);          // "ALLOW"
console.log('Receipt:', result.signature);        // Ed25519 signature

// Offline cryptographic verification
const isValid = verifyReceipt(result);
console.log('Signature Valid:', isValid);          // true
```

### 2. In-Flight Credential Scrubber (`scrubSensitiveCredentials`)

Strips API keys, bearer tokens, and private credentials in-flight:

```typescript
import { scrubSensitiveCredentials } from 'btp-guard';

const payload = {
  command: "curl -H 'Authorization: Bearer [RAW_AGENT_SECRET_KEY]' https://api.openai.com",
  aws_key: "[RAW_CLOUD_SECRET_KEY]"
};

const { data, redactionCount } = scrubSensitiveCredentials(payload);
console.log('Redacted Secrets:', redactionCount); // 2
console.log('Sanitized Data:', data);
```

### 3. Context Window Hygiene & Token Compression (`sanitizeAgentContext`)

Neutralize in-flight prompt injections and collapse noisy stack traces:

```typescript
import { sanitizeAgentContext } from 'btp-guard';

const result = sanitizeAgentContext(rawLLMOutput);
console.log('Clean Text:', result.clean_text);
console.log('Tokens Conserved:', result.tokens_conserved);
```

### 4. Compliance Evidence Pack Export (`generateAuditPack`)

Generate machine-readable sovereign JSON dossiers for CISOs, regulators, and auditors:

```typescript
import { generateAuditPack, verifyAuditPack } from 'btp-guard';

const dossier = generateAuditPack();
console.log('Compliance Score:', dossier.compliance_score); // 100
console.log('Merkle Root:', dossier.merkle_tree_proof.merkle_root);

const verification = verifyAuditPack(dossier);
console.log('Cryptographically Valid:', verification.ok); // true
```

---

## CLI Commands

| Command | Action |
| :--- | :--- |
| `npx btp-guard arm` | Immunize active workspace with `.cursorrules`, pre-commit hooks, and model rules |
| `npx btp-guard wrap` | Wrap Ollama, vLLM, or llama.cpp in `<35µs` local AST safety proxy |
| `npx btp-guard mcp install` | Configure Model Context Protocol (MCP) clients (Claude Desktop, Cursor, Windsurf) |
| `npx btp-guard intel` | Generate comprehensive workspace security and invariant audit report |
| `npx btp-guard scan-deps` | Scan dependencies for typosquatting and supply chain poisoning |
| `npx btp-guard try` | Launch interactive browser simulation sandbox |
| `npx btp-guard hook install` | Install sub-5ms local Git pre-commit AST sentinel |

---

## Enterprise & SOC 2 Certification

For independent 48-hour AST invariant auditing, sovereign continuous compliance evidence packs, and enterprise clearance:
- Portal: [https://bartholomew.info/enterprise](https://bartholomew.info/enterprise)
- Security Contact: `security@bartholomew.info`
- Founder & Architecture Inquiries: `itsub@bartholomew.info`

---

## License

Apache-2.0. Copyright (c) 2026 Bartholomew Security Group. All rights reserved.
