"""
Bartholomew Salesforce Agentforce Guardrail Adapter & Context Compactor
Integrates with Salesforce Agentforce, Data Cloud, and Service Cloud
to enforce sub-20us deterministic action safety and ATCE token optimization.
Support contact: help@bartholomew.info
"""

import time
import json
import hashlib
from typing import Dict, List, Tuple, Any, Optional

DISALLOWED_AGENTFORCE_ACTIONS = [
    "bulk_delete_records",
    "export_entire_database",
    "modify_security_profile",
    "disable_mfa_rule",
    "bypass_approval_process",
    "override_credit_limit_unconditionally"
]


class SalesforceAgentforceAdapter:
    """
    Certified Middleware Adapter for Salesforce Agentforce Swarms.
    Ensures CRM agent safety, halts destructive operations, and evicts token bloat.
    """

    def __init__(self, org_id: str = "00D000000000001AAA"):
        self.org_id = org_id
        self.actions_evaluated = 0
        self.actions_blocked = 0

    def evaluate_agentforce_action(
        self,
        agent_id: str,
        topic: str,
        action_name: str,
        action_parameters: Dict[str, Any]
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Evaluates proposed Salesforce Agentforce action against invariant rules.
        Returns: (allowed, reason, metadata)
        """
        self.actions_evaluated += 1
        t0 = time.perf_counter()

        # Check against blacklist
        if action_name.lower() in DISALLOWED_AGENTFORCE_ACTIONS:
            self.actions_blocked += 1
            latency_us = (time.perf_counter() - t0) * 1_000_000
            return False, f"ACTION_DISALLOWED: Action '{action_name}' violates Bartholomew CRM Invariant Gate.", {
                "org_id": self.org_id,
                "agent_id": agent_id,
                "action": action_name,
                "latency_us": round(latency_us, 2),
                "verdict": "BLOCKED"
            }

        # Check parameter safety (e.g. bulk deletes disguised as updates)
        if action_parameters.get("delete_all") is True or action_parameters.get("cascade_purge") is True:
            self.actions_blocked += 1
            latency_us = (time.perf_counter() - t0) * 1_000_000
            return False, "PARAMETER_VIOLATION: Destructive cascade flag detected in action payload.", {
                "org_id": self.org_id,
                "agent_id": agent_id,
                "action": action_name,
                "latency_us": round(latency_us, 2),
                "verdict": "BLOCKED"
            }

        latency_us = (time.perf_counter() - t0) * 1_000_000
        return True, "PASSED_INVARIANT_GATE", {
            "org_id": self.org_id,
            "agent_id": agent_id,
            "topic": topic,
            "action": action_name,
            "latency_us": round(latency_us, 2),
            "verdict": "ALLOWED"
        }

    def compact_case_history_context(self, case_threads: List[Dict[str, str]]) -> Tuple[List[Dict[str, str]], float]:
        """
        Applies ATCE heuristic to CRM case communication history.
        Evicts redundant quoted text, repetitive signatures, and boilerplate disclaimers.
        """
        cleaned_threads = []
        original_chars = sum(len(c.get("body", "")) for c in case_threads)
        
        for thread in case_threads:
            body = thread.get("body", "")
            # Evict standard enterprise email disclaimers
            lines = [l for l in body.splitlines() if not l.strip().startswith((">", "CONFIDENTIALITY NOTICE:", "This email and any files", "Disclaimer:"))]
            cleaned_threads.append({
                "author": thread.get("author", "Unknown"),
                "timestamp": thread.get("timestamp", ""),
                "body": "\n".join(lines).strip()
            })

        final_chars = sum(len(c.get("body", "")) for c in cleaned_threads)
        reduction_ratio = 1.0 - (final_chars / max(1, original_chars))
        return cleaned_threads, round(reduction_ratio, 3)
