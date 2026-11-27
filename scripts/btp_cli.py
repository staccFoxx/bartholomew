#!/usr/bin/env python3
"""
Bartholomew Guard (`btp`) — Unified Zero-Dependency Developer Security CLI (v7.0.9).

Subcommands:
  scan      Context-aware OWASP LLM02/LLM05/LLM06 static & AST repo scanner
  mcp-lock  Cryptographic mcp-lock.json lockfile & tool-poisoning verifier
  proxy     Local Agent Spend-Cap ($cap) & In-Flight Secret-Scrub Proxy (127.0.0.1)

Examples:
  python scripts/btp_cli.py scan --path .
  python scripts/btp_cli.py mcp-lock verify --config mcp.json --lock mcp-lock.json
  python scripts/btp_cli.py proxy --cap 5.00 --port 8787
"""
import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent

SUBCOMMANDS = {
    "scan": SCRIPTS_DIR / "btp_guard_ci_scan.py",
    "mcp-lock": SCRIPTS_DIR / "btp_mcp_lock.py",
    "proxy": SCRIPTS_DIR / "btp_spend_proxy.py",
}


def main() -> int:
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__.strip())
        return 0
    cmd = sys.argv[1].lower()
    if cmd not in SUBCOMMANDS:
        print(f"Unknown command: {cmd}. Available: {', '.join(SUBCOMMANDS.keys())}", file=sys.stderr)
        return 2
    target = SUBCOMMANDS[cmd]
    return subprocess.call([sys.executable, str(target), *sys.argv[2:]])


if __name__ == "__main__":
    sys.exit(main())
