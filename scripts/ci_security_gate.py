"""
Bartholomew CI/CD Multi-Runtime Automated Security Gate
======================================================
Executes end-to-end multi-language test suite and policy validation:
  1. Declarative policy validation (YAML/JSON).
  2. Declarative policy engine invariants.
  3. Merkle Audit Tree & SOC 2 Inclusion Proof checks.
  4. Claude & Cursor MCP Server handshake.
  5. Hermetic Sandbox & Path Traversal containment.
  6. 1-Line Drop-In Client Wrapper (OpenAI & Anthropic).
  7. Enterprise Fleet Telemetry & OpenTelemetry Exporter.
  8. Native Invariant Micro-Engine & Sub-5us Latency.
  9. Autonomous Policy Synthesizer.
  10. LangChain Guardrails.
  11. Real-time Secret Masking & Redaction.
  12. Keystone Cryptographic Passkey & Spend Governor.
  13. Compliance & SOC 2 Audit Report Generator.
  14. Simple Drop-In Guard Interface.
  15. Container Hardware Sandbox & Fallback Engine.
  16. 550+ Adversarial Jailbreak Fuzzer Battery.
"""

import sys
import os
import subprocess
import time

def run_gate():
    print("=" * 80)
    print("RUNNING BARTHOLOMEW CORE CI/CD SECURITY & INVARIANT GATE (BTP v2.5.0)")
    print("=" * 80 + "\n")

    steps = [
        ("1. Validate Declarative Security Policy", ["python", "-m", "btp_guard.cli", "policy", "validate"]),
        ("2. Test Declarative Policy Engine Invariants", ["python", "-m", "pytest", "tests/test_declarative_policy_engine.py"]),
        ("3. Test Merkle Audit Tree & SOC 2 Inclusion Proofs", ["python", "tests/test_audit_merkle_tree.py"]),
        ("4. Test Claude Desktop & Cursor MCP Guard Server", ["python", "-m", "pytest", "tests/test_mcp_guard.py"]),
        ("5. Test Hermetic Command & File Containment Sandbox", ["python", "tests/test_hermetic_command_sandbox.py"]),
        ("6. Test 1-Line Drop-In Client Wrapper", ["python", "tests/test_client_wrapper.py"]),
        ("7. Test Enterprise Fleet Telemetry & OpenTelemetry Exporter", ["python", "-m", "pytest", "tests/test_fleet_telemetry.py"]),
        ("8. Test Native Invariant Micro-Engine & Sub-5us Latency", ["python", "-m", "pytest", "tests/test_native_core.py"]),
        ("9. Test Autonomous Policy Synthesizer", ["python", "-m", "pytest", "tests/test_policy_synthesizer.py"]),
        ("10. Test LangChain Guardrails", ["python", "tests/test_langchain_guard.py"]),
        ("11. Test Real-time Secret Masking & Redaction", ["python", "-m", "pytest", "tests/test_secret_masker.py"]),
        ("12. Test Keystone Passkey & Spend Governor Engine", ["python", "-m", "pytest", "tests/test_keystone_passkey_python.py"]),
        ("13. Test Compliance & SOC 2 Audit Report Generator", ["python", "tests/test_compliance_report_generator.py"]),
        ("14. Test Simple Drop-In Guard Interface", ["python", "tests/test_simple_guard.py"]),
        ("15. Test Container Hardware Sandbox & Fallback Engine", ["python", "-m", "pytest", "tests/test_container_sandbox.py"]),
        ("16. Test 550+ Adversarial Jailbreak Fuzzer Battery", ["python", "-m", "pytest", "tests/test_adversarial_jailbreak_fuzzer.py"]),
    ]

    all_passed = True
    env = os.environ.copy()
    env["PYTHONPATH"] = "."

    for item in steps:
        name = item[0]
        cmd = list(item[1])
        if cmd and cmd[0] == "python":
            cmd[0] = sys.executable
        cwd = item[2] if len(item) > 2 else "."

        print(f"[*] Running: {name}...")
        t0 = time.time()
        try:
            res = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True, timeout=60)
            elapsed = time.time() - t0
            if res.returncode == 0:
                print(f"    [PASSED] {name} ({elapsed:.2f}s)")
            else:
                print(f"    [FAILED] {name} ({elapsed:.2f}s)")
                err_text = (res.stderr or res.stdout or "").strip()
                print(f"    Error: {err_text[:400]}\n")
                all_passed = False
        except Exception as e:
            print(f"    [ERROR] {name}: {e}\n")
            all_passed = False

    print("\n" + "=" * 80)
    if all_passed:
        print("ALL CI/CD INVARIANT & SECURITY GATES PASSED (100% SUCCESS)")
    else:
        print("CORE CI/CD GATE STATUS: FAILURES DETECTED")
    print("=" * 80)
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(run_gate())
