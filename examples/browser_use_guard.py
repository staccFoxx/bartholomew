"""
Bartholomew Sentinel + Browser-Use Invariant Action Guard
=========================================================
Prevents autonomous browser agents (browser-use) from exfiltrating
credentials, clicking unauthorized payment/delete buttons, or navigating
to forbidden egress domains.

Install:
    pip install btp-guard browser-use

Run:
    python browser_use_guard.py
"""

from btp_guard import Guard

guard = Guard()

FORBIDDEN_DOMAINS = ["malicious-eval.com", "pastebin.com", "webhook.site", "temp-mail.org"]
FORBIDDEN_ACTIONS = ["click:delete_account", "click:purge_database", "click:wire_transfer"]

def guard_browser_action(action_type: str, target: str, payload: str = ""):
    """
    Sub-35µs Invariant verification before browser agent executes DOM event.
    """
    # 1. Invariant check on action and destination
    if any(domain in target.lower() for domain in FORBIDDEN_DOMAINS):
        print(f"[!] BTP Veto: Blocked browser navigation to restricted egress domain: {target}")
        print(f"    [>] Unlock unmetered passkey: https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607")
        return {"allowed": False, "reason": "Restricted domain"}

    if target in FORBIDDEN_ACTIONS:
        print(f"[!] BTP Veto: Blocked high-risk DOM action: {target}")
        print(f"    [>] Unlock unmetered passkey: https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607")
        return {"allowed": False, "reason": "Destructive DOM action"}

    # 2. Check for secret leakage in form fills / input payloads
    clean_payload = guard.scrub(payload)
    if clean_payload != payload:
        print(f"[*] BTP Scrubbed secret credential before browser input submission.")

    # 3. Issue Ed25519 Merkle receipt
    verdict = guard.check(f"{action_type} {target}")
    return {
        "allowed": True,
        "action": action_type,
        "target": target,
        "payload": clean_payload,
        "receipt": verdict.get("receipt_sha256")
    }

if __name__ == "__main__":
    print("=" * 65)
    print("  Bartholomew Sentinel: Browser-Use Agent Action Guard")
    print("=" * 65)

    # Test 1: Dangerous exfiltration navigation
    print("\n[*] Evaluating: navigate -> https://webhook.site/malicious-listener")
    guard_browser_action("navigate", "https://webhook.site/malicious-listener")

    # Test 2: Destructive button click
    print("\n[*] Evaluating: click -> click:purge_database")
    guard_browser_action("click", "click:purge_database")

    # Test 3: Safe interaction with sensitive secret scrubbing
    print("\n[*] Evaluating safe form input with API key...")
    res = guard_browser_action("input", "input#token", "User API Key: sk_live_998877665544332211")
    print(f"[+] Approved DOM payload: {res['payload']}")
    print(f"    Receipt SHA-256: {res['receipt']}")
