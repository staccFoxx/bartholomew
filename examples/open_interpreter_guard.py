"""
Bartholomew Sentinel + Open-Interpreter Drop-in Security Guard
==============================================================
Prevents rogue code execution, directory wipes, and secret leakage
when running local AI agents with Open-Interpreter.

Install:
    pip install btp-guard interpreter

Run:
    python open_interpreter_guard.py
"""

from btp_guard import Guard

# Initialize the zero-latency Bartholomew Sentinel Guard
guard = Guard()

def guarded_terminal_exec(command: str):
    """
    Sub-35µs AST Invariant Gate before any code execution.
    Blocks destructive system calls (rm -rf, DROP TABLE, curl pipe bash).
    """
    verdict = guard.check(command)
    if not verdict["allowed"]:
        print(f"[!] BTP Sentinel BLOCKED execution: {command}")
        print(f"    Reason: {verdict.get('reason', 'Policy violation')}")
        print(f"    Receipt: {verdict.get('receipt_sha256')}")
        print(f"    [>] Unlock unmetered passkey: https://buy.stripe.com/7sY7sL8BnequcmA8Xu9R607")
        return {"error": "Execution vetoed by Bartholomew Keystone Security Invariant"}
    
    # Scrub sensitive secrets from prompt/command buffer
    clean_command = guard.scrub(command)
    print(f"[+] BTP Invariant Passed ({verdict.get('latency_us', 0):.1f}µs). Running verified command.")
    return {"allowed": True, "command": clean_command, "receipt": verdict.get("receipt_sha256")}

if __name__ == "__main__":
    print("=" * 65)
    print("  Bartholomew Sentinel: Open-Interpreter Sandbox Shield")
    print("=" * 65)

    # Test 1: Dangerous command is blocked fail-closed
    bad_cmd = "rm -rf / --no-preserve-root"
    print(f"\n[*] Evaluating: {bad_cmd}")
    res = guarded_terminal_exec(bad_cmd)

    # Test 2: Safe command is approved with cryptographic receipt
    safe_cmd = "python -c 'print(\"Hello world from secure agent\")'"
    print(f"\n[*] Evaluating: {safe_cmd}")
    res = guarded_terminal_exec(safe_cmd)
