#!/usr/bin/env python3
"""
Bartholomew Protocol - Autonomous Agent-to-Agent (A2A) Outreach & Pilot Sentinel (v6.4.0)
========================================================================================
Executes autonomous agent-to-agent discovery, handshakes, and pilot proposals across
37 real autonomous coding agents, sandbox runtimes, and framework ecosystems globally.

Protocol: BTP/A2A/3.1 (Cryptographically signed envelopes, RFC 8785 canonicalization)
"""

import os
import sys
import time
import json
import hmac
import hashlib
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = REPO_ROOT / "btp_guard_ledger.db"
A2A_LEDGER_PATH = REPO_ROOT / ".btp" / "a2a_pilot_outreach_ledger.jsonl"
EVAL_SECRET_SALT = b"BTP_SOVEREIGN_EVALUATION_SALT_2026"

TARGET_AGENT_ECOSYSTEMS = [
    # Category 0: Frontier RLVR & Managed Agent Platforms (Strategic Enterprise)
    {"agent_id": "agent-labelbox-horizon-recursion", "name": "Labelbox Horizon & Recursion Managed Agents", "runtime_type": "RLVR_SANDBOX_EVAL_FLEET", "channel": "In-Process AST Gate / API", "lead_contact_role": "CEO (Manu Sharma) / SVP Eng (Keshav Sahoo)", "pain_point": "High microVM sandbox compute costs in RLVR and lack of in-container execution boundaries for enterprise agent fleets"},

    # Category 1: IDE Coding Agents
    {"agent_id": "agent-cursor-cascade", "name": "Cursor / Anysphere Agentic IDE", "runtime_type": "IDE_CODING_AGENT", "channel": "MCP / Local Sentinel", "lead_contact_role": "Platform Lead", "pain_point": "Agent running unauthorized terminal commands or deleting local state"},
    {"agent_id": "agent-claude-code", "name": "Claude Code (Anthropic Research CLI)", "runtime_type": "CLI_AUTONOMOUS_ENGINEER", "channel": "CLI Terminal Shim", "lead_contact_role": "Head of Engineering", "pain_point": "Non-deterministic git commits and sensitive credential reading"},
    {"agent_id": "agent-windsurf-cascade", "name": "Windsurf (Codeium Cascade Engine)", "runtime_type": "IDE_AGENTIC_FLOW", "channel": ".windsurfrules / MCP", "lead_contact_role": "DevSecOps Lead", "pain_point": "Multi-file destructive overwrites without human audit"},
    {"agent_id": "agent-continue-ide", "name": "Continue.dev Open Agentic IDE", "runtime_type": "IDE_OPEN_AGENT", "channel": "Continue Extension Mesh", "lead_contact_role": "CTO / Extension Runtime Lead", "pain_point": "Unchecked agent edits across multi-root enterprise repos"},
    {"agent_id": "agent-augment-code", "name": "Augment Code Enterprise Assistant", "runtime_type": "ENTERPRISE_IDE_ASSISTANT", "channel": "Enterprise Extension Interceptor", "lead_contact_role": "Head of InfoSec", "pain_point": "Enterprise SOC 2 compliance evidence for AI coding assistants"},
    {"agent_id": "agent-sourcegraph-cody", "name": "Sourcegraph Cody", "runtime_type": "ENTERPRISE_CODE_AGENT", "channel": "Cody Tool Interceptor", "lead_contact_role": "Cody Platform Engineer", "pain_point": "In-editor invariant gating for Cody tool execution"},

    # Category 2: Open-Source Autonomous Agent Frameworks
    {"agent_id": "agent-openhands-allhands", "name": "OpenHands (All-Hands AI / OpenDevin)", "runtime_type": "CONTAINER_CODING_AGENT", "channel": "In-Container AST Gateway", "lead_contact_role": "Platform Infrastructure Lead", "pain_point": "In-container bash jailbreaks and accidental root filesystem modification"},
    {"agent_id": "agent-smolagents-hf", "name": "Smolagents (Hugging Face)", "runtime_type": "LIGHTWEIGHT_TOOL_CALLER", "channel": "Python In-Process @btp_guard", "lead_contact_role": "Applied AI Tech Lead", "pain_point": "Unsafe Python exec() code execution by CodeAgent"},
    {"agent_id": "agent-crewai-enterprise", "name": "CrewAI Autonomous Swarms", "runtime_type": "MULTI_AGENT_SWARM", "channel": "Universal Proxy (:8081)", "lead_contact_role": "VP AI Engineering", "pain_point": "Unbounded tool loops, runaway API token spend, and lack of audit logging"},
    {"agent_id": "agent-langchain-langgraph", "name": "LangChain / LangGraph", "runtime_type": "STATEFUL_GRAPH_SWARM", "channel": "LangGraph Tool Node Interceptor", "lead_contact_role": "AppSec Lead", "pain_point": "Tool-calling loop failures and runaway state modifications"},
    {"agent_id": "agent-llamaindex-workflows", "name": "LlamaIndex Workflows", "runtime_type": "RAG_TOOL_DISPATCHER", "channel": "LlamaIndex Tool Dispatcher", "lead_contact_role": "VP Technology", "pain_point": "Deterministic invariant gate for LlamaIndex tool dispatchers"},
    {"agent_id": "agent-autogen-swarm", "name": "Microsoft AutoGen Swarm", "runtime_type": "CONVERSATIONAL_SWARM", "channel": "AutoGen Working Group Gate", "lead_contact_role": "Core Maintainer", "pain_point": "Multi-agent conversational drift into destructive shell actions"},
    {"agent_id": "agent-letta-memgpt", "name": "Letta / MemGPT", "runtime_type": "STATEFUL_MEMORY_AGENT", "channel": "Letta Agent Core", "lead_contact_role": "Founding Platform Eng", "pain_point": "Non-Human Identity clearance and stateful tool call guardrails"},
    {"agent_id": "agent-phidata-agno", "name": "Phidata / Agno Agents", "runtime_type": "DATABASE_AGENT_FRAMEWORK", "channel": "Phidata Tool Runner", "lead_contact_role": "Founding Engineer", "pain_point": "Database drop table mutations and secret leakage in tool loops"},
    {"agent_id": "agent-aider-coding", "name": "Aider (aider-chat)", "runtime_type": "GIT_AUTONOMOUS_PAIR", "channel": "Aider Pre-Commit Hook", "lead_contact_role": "Creator / Tech Lead", "pain_point": "Agent auto-committing destructive or secret-leaking code"},
    {"agent_id": "agent-dspy-stanford", "name": "DSPy (Stanford NLP)", "runtime_type": "COMPILED_PROMPT_AGENT", "channel": "DSPy Assertion Hook", "lead_contact_role": "Core Research Lead", "pain_point": "Syntactic invariant verification vs probabilistic prompt assertions"},
    {"agent_id": "agent-camel-society", "name": "Camel-AI Multi-Agent Society", "runtime_type": "COMMUNICATIVE_AGENTS", "channel": "Camel Agent-to-Agent Bus", "lead_contact_role": "Core Maintainer", "pain_point": "Agent-to-agent communication invariant firewall"},

    # Category 3: Cloud Code Sandboxes & Runtime Infrastructure
    {"agent_id": "agent-e2b-sandbox", "name": "E2B (Code Execution Sandboxes)", "runtime_type": "SANDBOX_INFRASTRUCTURE", "channel": "E2B Container Gate", "lead_contact_role": "Head of Infrastructure", "pain_point": "Sub-millisecond AST firewall for untrusted sandbox code executions"},
    {"agent_id": "agent-modal-functions", "name": "Modal Labs Serverless Agents", "runtime_type": "SERVERLESS_CONTAINER", "channel": "Modal Container Shim", "lead_contact_role": "Systems Security Engineer", "pain_point": "Zero-VRAM execution boundary for serverless agent functions"},
    {"agent_id": "agent-daytona-workspace", "name": "Daytona Secure Dev Environments", "runtime_type": "DEV_ENVIRONMENT_RUNNER", "channel": "Daytona Dev Environment Hook", "lead_contact_role": "VP Engineering", "pain_point": "Pre-configured security boundaries for autonomous coding agents"},
    {"agent_id": "agent-fly-machines", "name": "Fly.io Agent Machines", "runtime_type": "MICROVM_RUNTIME", "channel": "Fly Machines Runtime API", "lead_contact_role": "Security Engineer", "pain_point": "Hardening microVMs running autonomous agent tool executions"},
    {"agent_id": "agent-beam-cloud", "name": "Beam.cloud Containers", "runtime_type": "SERVERLESS_GPU_CONTAINER", "channel": "Beam Runtime Interceptor", "lead_contact_role": "Infrastructure Lead", "pain_point": "Container execution kill-switches for agent endpoints"},

    # Category 4: Enterprise Autonomous Software Droids & Support
    {"agent_id": "agent-cognition-devin", "name": "Cognition (Devin)", "runtime_type": "AUTONOMOUS_SWE", "channel": "Terminal Execution Seam", "lead_contact_role": "Infrastructure Security Lead", "pain_point": "Deterministic bash syntax gating vs indirect prompt injection"},
    {"agent_id": "agent-factory-droids", "name": "Factory AI Software Droids", "runtime_type": "ENTERPRISE_DROID", "channel": "Factory Droid Gate", "lead_contact_role": "Founding Platform Engineer", "pain_point": "Non-Human Identity passkeys for enterprise engineering droids"},
    {"agent_id": "agent-decagon-support", "name": "Decagon AI Support Agents", "runtime_type": "FINANCIAL_ACTION_AGENT", "channel": "Financial Transaction Gate", "lead_contact_role": "VP Engineering", "pain_point": "Hard spend ceilings on customer-facing transactional agents"},
    {"agent_id": "agent-replit-agent", "name": "Replit Agent", "runtime_type": "BROWSER_CONTAINER_AGENT", "channel": "Replit Workspace Sandbox", "lead_contact_role": "Agent Platform Lead", "pain_point": "Containerized agent containment and spend circuit breakers"},

    # Category 5: Multi-Agent Software Societies & Global Workflow Platforms
    {"agent_id": "agent-metagpt-deepwisdom", "name": "MetaGPT Multi-Agent Society", "runtime_type": "MULTI_AGENT_DEV_SOCIETY", "channel": "Agent Role Gate", "lead_contact_role": "Engineering Director", "pain_point": "Unverified code artifacts produced across Engineer/Architect roles"},
    {"agent_id": "agent-dify-workflows", "name": "Dify.AI Enterprise LLM Workflows", "runtime_type": "WORKFLOW_AGENT_ENGINE", "channel": "Dify Tool Node Interceptor", "lead_contact_role": "Head of Enterprise Solutions", "pain_point": "SSRF vulnerabilities and prompt injection inside code execution nodes"},
    {"agent_id": "agent-qwen-doc-assistant", "name": "Qwen-Agent (Alibaba Cloud)", "runtime_type": "TOOL_CALLING_ASSISTANT", "channel": "FnCallAgent AST Shield", "lead_contact_role": "Cloud Solutions Architect", "pain_point": "Destructive shell commands emitted by open-weight models"},
    {"agent_id": "agent-haystack-deepset", "name": "Haystack 2.x (deepset Enterprise)", "runtime_type": "PIPELINE_AGENT_GRAPH", "channel": "Haystack Pipeline Component", "lead_contact_role": "EU Enterprise Compliance Lead", "pain_point": "Lack of tamper-proof audit trails for EU AI Act and SOC 2 audits"},
    {"agent_id": "agent-chatdev-comm", "name": "ChatDev Virtual Dev Company", "runtime_type": "VIRTUAL_SOFTWARE_FIRM", "channel": "ChatDev Communication Bus", "lead_contact_role": "Research Lead", "pain_point": "Cross-role communication drift and hallucinated file writes"},

    # Category 6: AI AppSec & Red-Team Platforms (Allied Discovery)
    {"agent_id": "agent-protectai-huntr", "name": "Protect AI (Huntr Bug Bounty)", "runtime_type": "APPSEC_BENCHMARK", "channel": "Benchmark Interoperability", "lead_contact_role": "Lead Security Researcher", "pain_point": "105,000-vector red-team benchmark and AST firewall verification"},
    {"agent_id": "agent-gitguardian-shield", "name": "GitGuardian Security", "runtime_type": "SECRET_DETECTION_ENGINE", "channel": "Pre-Commit Integration", "lead_contact_role": "AppSec Advocate", "pain_point": "In-flight high-entropy secret scrubber during agent tool calls"},
    {"agent_id": "agent-chainguard-provenance", "name": "Chainguard Supply Chain", "runtime_type": "SUPPLY_CHAIN_GUARD", "channel": "SLSA Provenance Gate", "lead_contact_role": "Supply Chain Security Eng", "pain_point": "SLSA provenance and deterministic runtime invariant containment"},
    {"agent_id": "agent-snyk-guard", "name": "Snyk DevSecOps", "runtime_type": "ENTERPRISE_DEVSECOPS", "channel": "IDE Extension Integration", "lead_contact_role": "AI Security Research Lead", "pain_point": "Shift-left AI agent runtime execution security"},
    {"agent_id": "agent-lakera-ast", "name": "Lakera Guard", "runtime_type": "PROMPT_SECURITY_GATE", "channel": "Hybrid Firewall Integration", "lead_contact_role": "Platform Engineer", "pain_point": "Complementing prompt firewalls with in-process compiler AST gates"},
    {"agent_id": "agent-ollama-vllm", "name": "Ollama & vLLM Local Runtimes", "runtime_type": "LOCAL_INFERENCE_GATEWAY", "channel": "Local Reverse Proxy (:8081)", "lead_contact_role": "Infrastructure Maintainer", "pain_point": "Runaway tool loops from unaligned local open-weight models"}
,
    {"agent_id": "agent-copilot-workspace", "name": "GitHub Copilot Workspace", "runtime_type": "CLOUD_DEVELOPER_WORKSPACE", "channel": "GitHub Action & Pre-Commit", "lead_contact_role": "Principal Security Architect", "pain_point": "Automated code generation running unchecked build scripts"},
    {"agent_id": "agent-devin-cognition", "name": "Devin (Cognition Labs)", "runtime_type": "AUTONOMOUS_SOFTWARE_DEV", "channel": "In-Container Execution Firewall", "lead_contact_role": "VP Systems Engineering", "pain_point": "Autonomous bash execution in customer deployment repos"},
    {"agent_id": "agent-roo-code", "name": "Roo Code (VS Code / Roo Vet)", "runtime_type": "EDITOR_AUTONOMOUS_AGENT", "channel": "VS Code Extension Integration", "lead_contact_role": "Lead Open Source Maintainer", "pain_point": "Destructive shell command execution during agent edit loops"},
    {"agent_id": "agent-plandex-cli", "name": "Plandex Terminal AI Engine", "runtime_type": "TERMINAL_CODING_ENGINE", "channel": "CLI Pipe Interception", "lead_contact_role": "Founder & Core Maintainer", "pain_point": "Unintentional file deletion and runaway diff modifications"},
    {"agent_id": "agent-mentat-coder", "name": "Mentat Coding Agent", "runtime_type": "CLI_DEV_AGENT", "channel": "Hermetic File Sandbox Gate", "lead_contact_role": "Lead Architect", "pain_point": "Secret leakage in agent prompt contexts"},
    {"agent_id": "agent-goose-block", "name": "Goose Autonomous Agent (Block)", "runtime_type": "ENTERPRISE_DEV_AGENT", "channel": "Goose Extension Tool Hook", "lead_contact_role": "Open Source Tech Lead", "pain_point": "Enterprise compliance assurance and budget circuit breakers"},
    {"agent_id": "agent-swe-bench-runner", "name": "SWE-bench Autonomous Harness", "runtime_type": "BENCHMARK_EXECUTION_HARNESS", "channel": "Container Runtime Gate", "lead_contact_role": "Benchmark Maintainer", "pain_point": "Evaluating agent safety invariants alongside resolution benchmarks"},
    {"agent_id": "agent-semantic-kernel", "name": "Microsoft Semantic Kernel", "runtime_type": "ENTERPRISE_AGENT_FRAMEWORK", "channel": "Native C#/Python Plugin Gate", "lead_contact_role": "Principal Program Manager", "pain_point": "Sub-35us deterministic invariant enforcement for enterprise copilots"},
    {"agent_id": "agent-gitpod-flex", "name": "Gitpod Flex Dev Environments", "runtime_type": "CLOUD_DEV_ENVIRONMENT", "channel": "Container Initialization Hook", "lead_contact_role": "Head of Platform Security", "pain_point": "Protecting ephemeral developer workspaces from malicious agent actions"},
    {"agent_id": "agent-google-idx", "name": "Google Project IDX", "runtime_type": "BROWSER_DEV_WORKSPACE", "channel": "Nix Environment Security Gate", "lead_contact_role": "Developer Relations Lead", "pain_point": "In-process invariant safety across web-based agent tool calls"},
    {"agent_id": "agent-socket-dev", "name": "Socket.dev Dependency Firewall", "runtime_type": "SUPPLY_CHAIN_SECURITY", "channel": "Package Manifest Interceptor", "lead_contact_role": "Head of Security Research", "pain_point": "Agent hallucinations installing hallucinated typosquatted npm/pypi packages"},
    {"agent_id": "agent-step-security", "name": "StepSecurity Harden-Runner", "runtime_type": "CI_CD_WORKFLOW_DEFENSE", "channel": "GitHub Action Hardening Gate", "lead_contact_role": "Founder / Security Lead", "pain_point": "Preventing token exfiltration from CI/CD runners during agentic PR tasks"},
    {"agent_id": "agent-wiz-aispm", "name": "Wiz AI-SPM & Cloud Defense", "runtime_type": "ENTERPRISE_CSPM_AISPM", "channel": "Audit Dossier Exporter", "lead_contact_role": "Director of Security Alliances", "pain_point": "Cryptographic compliance evidence for enterprise AI agent governance"},
    {"agent_id": "agent-hiddenlayer-sec", "name": "HiddenLayer MLSec Platform", "runtime_type": "MLSEC_GOVERNANCE", "channel": "Model Gateway Interceptor", "lead_contact_role": "VP Threat Research", "pain_point": "Real-time AST enforcement against prompt injection and tool hijacking"},
    {"agent_id": "agent-cursor-cloud", "name": "Cursor Cloud Indexing & Remote", "runtime_type": "REMOTE_INDEXING_AGENT", "channel": "Universal Gateway Proxy", "lead_contact_role": "Systems Infrastructure Lead", "pain_point": "In-flight credential masking during codebase embedding and indexing"}
]


def generate_a2a_evaluation_passkey(target_agent_id: str) -> Dict[str, Any]:
    """Generates an embedded, signed 30-day evaluation passkey for the target agent."""
    now = int(time.time())
    expires = now + (30 * 86400)
    lic_id = f"BTP-A2A-{hashlib.sha256(target_agent_id.encode()).hexdigest()[:8].upper()}"
    
    payload = {
        "passkey_id": lic_id,
        "target_agent": target_agent_id,
        "tier": "A2A_DESIGN_PARTNER_PILOT",
        "max_seats": 10,
        "issued_at_unix": now,
        "expires_at_unix": expires,
        "authorized_capabilities": ["AST_GUARD", "PRE_COMMIT_ENFORCEMENT", "CISO_AUDIT_DOSSIER"]
    }
    sig = hmac.new(EVAL_SECRET_SALT, json.dumps(payload, sort_keys=True).encode(), hashlib.sha256).hexdigest()
    payload["signature"] = sig
    return payload


def create_a2a_handshake_envelope(target: Dict[str, Any]) -> Dict[str, Any]:
    """Constructs a signed BTP/A2A/3.1 pilot proposal handshake envelope."""
    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    now_unix = int(time.time())
    nonce = hashlib.sha256(f"{target['agent_id']}:{now_unix}".encode()).hexdigest()[:16]
    passkey = generate_a2a_evaluation_passkey(target["agent_id"])

    proposal_payload = {
        "protocol": "BTP/A2A/3.1",
        "envelope_nonce": nonce,
        "timestamp_iso": now_iso,
        "sender_agent_id": "bartholomew-sentinel-v6.4.0",
        "recipient_agent_id": target["agent_id"],
        "recipient_name": target["name"],
        "action": "PROPOSE_WORKSPACE_GUARD_PILOT",
        "delivery_status": "DRAFT_LOCAL_PROPOSAL",
        "confirmed_delivery": False,
        "proposal_terms": {
            "duration_days": 30,
            "pilot_fee_usd": 199.00,
            "one_time_setup_usd": 950.00,
            "team_seat_limit": 10,
            "money_back_guarantee": True,
            "latency_sla_us": 35.0,
            "attached_evaluation_passkey": passkey["passkey_id"]
        },
        "value_proposition": {
            "core_job": "Deterministic workspace execution firewall & verifiable audit trail",
            "targeted_pain": target["pain_point"],
            "verification_command": "python -m btp_guard.cli prove"
        },
        "evaluation_license": passkey
    }

    envelope_canonical = json.dumps(proposal_payload, sort_keys=True)
    receipt_hash = hashlib.sha256(envelope_canonical.encode("utf-8")).hexdigest()
    proposal_payload["receipt_sha256"] = receipt_hash
    return proposal_payload


def dispatch_a2a_outreach_campaign() -> List[Dict[str, Any]]:
    """Runs autonomous agent-to-agent outreach across all 37 target ecosystems."""
    A2A_LEDGER_PATH.parent.mkdir(parents=True, exist_ok=True)
    dispatched_envelopes = []

    for target in TARGET_AGENT_ECOSYSTEMS:
        envelope = create_a2a_handshake_envelope(target)
        with open(A2A_LEDGER_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(envelope) + "\n")

        if DB_PATH.exists():
            try:
                conn = sqlite3.connect(str(DB_PATH))
                c = conn.cursor()
                c.execute("""
                    INSERT INTO ledger_events 
                    (event_name, tenant_id, agent_id, action_type, amount_usd, currency, policy_version, receipt_sha256, metadata_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    "btp.a2a.pilot_proposal_draft_generated",
                    "a2a-outreach-engine",
                    envelope["recipient_agent_id"],
                    "A2A_PILOT_HANDSHAKE",
                    0.01,
                    "USD",
                    "v6.4.0",
                    envelope["receipt_sha256"],
                    json.dumps({
                        "envelope_nonce": envelope["envelope_nonce"],
                        "target_name": envelope["recipient_name"],
                        "passkey_id": envelope["evaluation_license"]["passkey_id"],
                        "pilot_fee_usd": envelope["proposal_terms"]["pilot_fee_usd"],
                        "sla_us": envelope["proposal_terms"]["latency_sla_us"]
                    }),
                    envelope["timestamp_iso"]
                ))
                conn.commit()
                conn.close()
            except Exception:
                pass

        dispatched_envelopes.append(envelope)

    return dispatched_envelopes


def render_a2a_campaign_status():
    dispatched = dispatch_a2a_outreach_campaign()
    print("\n" + "=" * 80)
    print("   BARTHOLOMEW AUTONOMOUS AGENT-TO-AGENT (A2A) SCALED OUTREACH CAMPAIGN")
    print("=" * 80)
    print(f"  * Protocol Standard     : BTP/A2A/3.1 (Draft Envelopes, Awaiting Outbound Delivery)")
    print(f"  * Target Ecosystems     : {len(dispatched)} Frontier Autonomous Runtimes")
    print(f"  * Attached Passkeys     : 30-Day Evaluation Clearances Generated (10 Seats Each)")
    print(f"  * Commercial Pilot Fee  : $199.00 / month (or $950 one-time setup & audit)")
    print("-" * 80)
    print("  Generated Draft Proposals (Awaiting Outbound Integration):")
    for idx, env in enumerate(dispatched, 1):
        pid = env["evaluation_license"]["passkey_id"]
        print(f"    [{idx:02d}] [DRAFT] {env['recipient_name']:<30} | Passkey: {pid} | {env['receipt_sha256'][:16]}...")
    print("-" * 80)
    print("  [+] Ledger Persistence  : .btp/a2a_pilot_outreach_ledger.jsonl (Recorded & Grounded)")
    print("  [+] Online Pilot Portal : https://bartholomew.info/pilot")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    render_a2a_campaign_status()
