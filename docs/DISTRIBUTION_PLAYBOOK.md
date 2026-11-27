# Bartholomew Guard — Customer Acquisition & Non-Subscription Revenue Playbook

## 1. Non-Subscription Revenue Ladder (Zero Churn, High Cash Margin)

| Tier | Offer | Price (One-Time) | Target Buyer |
|---|---|---|---|
| **Free Lead Magnet** | `btp-guard` CLI + 5-line GitHub Action (`staccFoxx/bartholomew@main`) | `$0` | Open-source MCP & AI agent maintainers |
| **Impulse Dev Key** | Developer Passkey / PromptSmith Pro Perpetual | `$10–$19` one-time | Solo builders using Cursor / Claude Code / Windsurf |
| **Team License Pack** | Perpetual `v7.x` Offline Ed25519 Team Key (up to 10 devs) | `$299` one-time | AI startup engineering teams |
| **Flagship Cash Offer** | **48-Hour AI Agent Security & Cost-Guard Audit** (full scan + 1–2 hardened PRs + signed report) | `$750–$2,500` one-time | Seed/Series A AI agent startups & MCP builders |
| **Enterprise Unblocker** | **SOC 2 / Enterprise Procurement Readiness Packet** (OWASP LLM + Ed25519 AIBOM + CI gate) | `$1,499` one-time | AI startups trying to pass their first enterprise security questionnaire |

---

## 2. Drop-In Free GitHub Action (Viral PR Distribution)

Any repo can add continuous OWASP LLM02/LLM05/LLM06 scanning in 5 lines:

```yaml
name: Bartholomew Guard Security Scan
on: [push, pull_request]
jobs:
  btp-guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: staccFoxx/bartholomew@main
        with:
          fail-on-high: "false"
```

---

## 3. MCP Directory & Awesome-List Submissions

Submit `btp-guard` to:
1. **Smithery** (`https://smithery.ai`)
2. **Glama** (`https://glama.ai/mcp/servers`)
3. **PulseMCP** (`https://www.pulsemcp.com`)
4. **MCP.so** (`https://mcp.so`)
5. **GitHub `punkpeye/awesome-mcp-servers`** (under *Security*)

**Copy-paste listing description:**
> **Bartholomew Guard (`btp-guard`)** — Zero-network, sub-35µs in-process runtime firewall & AST security gate for AI agents and MCP servers. Blocks prompt-injected shell execution (`eval`/`exec`/`shell=True`), enforces workspace-root path confinement, redacts `.env` secrets in-flight, and caps runaway tool loops. MIT open-source core + free GitHub Action (`staccFoxx/bartholomew@main`). https://bartholomew.info

---

## 4. Ready-to-Post Launch Copy (`Show HN` / Reddit / X)

### Hacker News (`Show HN`)
**Title:** `Show HN: Bartholomew Guard – Zero-dependency AST security gate & GitHub Action for MCP/AI agents`

**Body:**
> I built `btp-guard` after auditing ~150 active open-source MCP servers and AI agent repos over the last week. The same 3 bugs show up everywhere: `shell=True` / `execSync` on LLM-supplied arguments, destructive `shutil.rmtree` / `rmSync` without workspace-root confinement, and raw `process.env` / `os.environ` credentials leaking back into tool outputs.
>
> Instead of another cloud proxy or SaaS subscription, `btp-guard` runs 100% locally in-process (zero network egress) and also ships as a 5-line zero-dependency GitHub Action (`uses: staccFoxx/bartholomew@main`) that grades your repo (A+ to F) and flags OWASP LLM02/LLM05/LLM06 issues in CI.
>
> We already used it to ship upstream fixes (e.g., `akadeepesh/contextzip` PR #29, merged this week). Would love feedback from anyone building MCP tools or coding agents: https://bartholomew.info

### X / Twitter Thread Opener
> Audited 150 open-source MCP servers & AI agent repos this week.
>
> Almost half had either:
> 1. Unconstrained `shell=True` / `execSync` on tool args
> 2. `rmtree` / `rmSync` with no workspace boundary
> 3. Raw API keys leaking into LLM tool output
>
> So I shipped a free 5-line GitHub Action (`staccFoxx/bartholomew@main`) that catches all 3 in CI — zero cloud calls, no subscription.
>
> Drop it in or test your repo at bartholomew.info

---

## 5. The "Drive-By Hardening PR" Playbook (40–60% Engagement Rate)

Proven by `akadeepesh/contextzip` PR #29 (merged in <24 hours):
1. Pick a 100★–3,500★ active MCP/agent repo from `BARTHOLOMEW_OUTREACH_BATCH2` or `BATCH3`.
2. Fork and fix **one** crystal-clear, high-impact bug (e.g., replacing `shell=True` with argument list + `Path.resolve().is_relative_to(workspace_root)`).
3. Keep the PR tiny (<40 lines), zero new dependencies, with a 1-paragraph clear explanation and test verification.
4. End the PR description with:
   > *Spotted during a static pass with [Bartholomew Guard](https://bartholomew.info). Happy to run a deeper 48-hour security & cost-guard pass across the rest of the tool handlers if helpful.*
