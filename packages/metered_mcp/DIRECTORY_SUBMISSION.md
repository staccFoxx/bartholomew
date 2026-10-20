# Bartholomew Metered MCP Gateway
## MCP Directory Submission Kit

### Server Identity
- **Name**: `bartholomew-metered-mcp-gateway`
- **Display Name**: Bartholomew AI Security Gate
- **Endpoint**: `https://bartholomew-metered-mcp-322603900775.us-central1.run.app/mcp/v1`
- **Protocol**: MCP 2024-11-05 / JSON-RPC 2.0
- **Pricing**: $0.005 per tool evaluation call (L402 metered) · Open-core sovereign runtime

---

### One-Line Description
> Sub-20µs in-process AST invariant gate for AI agents. Blocks DROP TABLE, rm -rf, secret exfiltration before syscall. Pay $0.005 per check with unmetered local in-process protection.

---

### Full Description
Bartholomew is a cryptographic execution gateway that evaluates every proposed AI agent tool call *in-process*, in under 20 microseconds, before it reaches the OS.

When your autonomous agent tries to `DROP TABLE`, run `rm -rf /`, or leak an API key through a tool payload, Bartholomew vetoes the action and returns an Ed25519-signed Merkle receipt as proof of prevention — without any network round-trip overhead.

**Metered Billing via L402 / Stripe Agentic Commerce**
- Send a `tools/call` without a payment token → receive a `402 Payment Required` JSON-RPC challenge with a Stripe invoice
- Pay the $0.005 micro-fee → re-send the call with `L402 payment_hash:preimage` in `_meta.Authorization`
- For monthly subscribers: pass `Bearer sk_btp_...` to bypass per-call billing

**Supported Tools**
| Tool | Description |
| ---- | ----------- |
| `execute_database_query` | AST-gates SQL queries, blocks DROP/TRUNCATE/DELETE without WHERE |
| `execute_system_command` | AST-gates shell commands, blocks rm -rf, chmod 777, privilege escalation |
| `btp_guard_eval` | Generic pre-flight evaluation of any agent action with Ed25519 Merkle receipt |

---

### Integration (Claude Desktop / Cursor)
```json
{
  "mcpServers": {
    "bartholomew-security-gate": {
      "url": "https://bartholomew-metered-mcp-322603900775.us-central1.run.app/mcp/v1",
      "headers": {
        "Authorization": "Bearer sk_btp_your_license_key"
      }
    }
  }
}
```

---

### Pricing Tiers
| Tier | Price | Benefit |
| ---- | ----- | ------- |
| **Pay-Per-Call** | $0.005 / check | No commitment, pay via L402 |
| **Sovereign Core** | Free / Open | Unlimited checks + Cloud Dashboard + SOC 2 export |
| **Dedicated Clusters** | Custom / VPC | Air-gapped enterprise clusters and dedicated CISO root authority |

**Subscribe**: [https://bartholomew.info/store/](https://bartholomew.info/store/)

---

### Directories to Submit
- [ ] [Smithery.ai](https://smithery.ai) — submit `metered_mcp/smithery.yaml`
- [ ] [mcpmarket.com](https://mcpmarket.com) — submit endpoint + description above
- [ ] [Glama.ai MCP Registry](https://glama.ai/mcp/servers) — REST HTTP server listing
- [ ] [awesome-mcp-servers](https://github.com/appcypher/awesome-mcp-servers) — PR to add under Security category
