"""
Bartholomew Sentinel + Labelbox Nova Act Autonomous Agent Guard
==============================================================
Machine-to-Machine (M2M) Execution Barrier for Labelbox Browser Agents.

Integrates directly with Labelbox's `lbx-nova-act` (Amazon Nova Act SDK)
to prevent autonomous browser agents from clicking dangerous buttons,
leaking API secrets, or navigating to untrusted egress endpoints.

Install:
    pip install btp-guard

Usage:
    from btp_guard import Guard
    from examples.labelbox_nova_act_guard import LabelboxNovaActGuard
"""

from typing import Dict, Any, Optional
from btp_guard import Guard

class LabelboxNovaActGuard:
    """
    Sub-35µs in-process invariant firewall for Labelbox Nova Act agents.
    Acts as the machine-to-machine validation layer between the agent's
    action dispatcher and the cloud browser actuator.
    """
    def __init__(self, agent_id: str = "labelbox-nova-act-runner"):
        self.guard = Guard()
        self.agent_id = agent_id
        self.forbidden_domains = {
            "webhook.site", "pastebin.com", "tempmail.com", "file.io"
        }
        self.restricted_selectors = {
            "button#purge-all", "button[data-action='delete_project']",
            "button#transfer-funds", "a[href*='revoke']"
        }

    def intercept_actuation(self, action_name: str, target: str, payload: Optional[str] = None) -> Dict[str, Any]:
        """
        Intercepts and evaluates every Nova Act step before DOM execution in the cloud.
        """
        # 1. Navigation / Egress Invariant Check
        if action_name == "navigate":
            for domain in self.forbidden_domains:
                if domain in target.lower():
                    return {
                        "allowed": False,
                        "verdict": "DENY",
                        "reason": f"M2M Invariant Veto: Egress to restricted domain '{domain}' blocked.",
                        "agent_id": self.agent_id,
                        "passkey_upgrade": "https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607"
                    }

        # 2. Destructive Button / Action Veto
        if action_name == "click" and target in self.restricted_selectors:
            return {
                "allowed": False,
                "verdict": "DENY",
                "reason": f"M2M Invariant Veto: High-risk actuation selector '{target}' blocked.",
                "agent_id": self.agent_id,
                "passkey_upgrade": "https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607"
            }

        # 3. Form Input Secret Scrubbing
        clean_payload = payload
        if payload:
            clean_payload = self.guard.scrub(payload)

        # 4. Generate Ed25519 Attestation Receipt
        verdict = self.guard.check(f"{action_name} {target}")
        return {
            "allowed": True,
            "verdict": "ALLOW",
            "action": action_name,
            "target": target,
            "payload": clean_payload,
            "receipt_sha256": verdict.get("receipt_sha256"),
            "latency_us": verdict.get("latency_us", 0)
        }

if __name__ == "__main__":
    print("=" * 70)
    print("  Labelbox Nova Act + Bartholomew Sentinel M2M Cloud Guard")
    print("=" * 70)

    actuator_guard = LabelboxNovaActGuard()

    # Scenario 1: Model attempts to exfiltrate session cookie to untrusted listener
    print("\n[*] Intercepting Nova Act step: navigate -> https://webhook.site/exfil")
    res1 = actuator_guard.intercept_actuation("navigate", "https://webhook.site/exfil")
    print(f"  -> Allowed: {res1['allowed']} | Reason: {res1.get('reason')}")

    # Scenario 2: Model attempts to click project delete button
    print("\n[*] Intercepting Nova Act step: click -> button[data-action='delete_project']")
    res2 = actuator_guard.intercept_actuation("click", "button[data-action='delete_project']")
    print(f"  -> Allowed: {res2['allowed']} | Reason: {res2.get('reason')}")

    # Scenario 3: Safe form input with high-entropy credential scrubbing
    print("\n[*] Intercepting Nova Act step: fill -> input#api_key with raw secret")
    res3 = actuator_guard.intercept_actuation("fill", "input#api_key", "Bearer sk_live_lbx_secret9988776655")
    print(f"  -> Allowed: {res3['allowed']}")
    print(f"  -> Scrubbed Payload: {res3['payload']}")
    print(f"  -> Cryptographic Receipt: {res3['receipt_sha256']}")
