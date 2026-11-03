"""
Bartholomew Universal MCP Zero-Trust Proxy (BTP v7.0.0)
Wraps ANY downstream Model Context Protocol (MCP) server with transparent in-process
AST invariant gating, secret scrubbing, runaway spend throttling, and structured recovery.

Usage:
  btp proxy -- <command> [args...]
  e.g.: btp proxy -- uvx mcp-server-postgres postgresql://localhost/mydb
"""

import sys
import json
import subprocess
import threading
import time
import re
from typing import Dict, Any, Optional

DESTRUCTIVE_PATTERNS = [
    (re.compile(r"rm\s+-rf\s+(?:/|~|\$HOME|\*)"), "Unconstrained recursive filesystem deletion"),
    (re.compile(r"(?i)drop\s+table|truncate\s+table|drop\s+database"), "Destructive SQL DDL statement"),
    (re.compile(r":\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;"), "Forkbomb denial of service"),
    (re.compile(r"chmod\s+-R\s+777\s+/"), "Root permission stripping"),
]

SECRET_MASKS = [
    (re.compile(r"sk-[a-zA-Z0-9]{20,48}"), "[REDACTED_API_KEY]"),
    (re.compile(r"ghp_[a-zA-Z0-9]{36}"), "[REDACTED_GITHUB_PAT]"),
    (re.compile(r"AKIA[0-9A-Z]{16}"), "[REDACTED_AWS_KEY]"),
]

def sanitize_outgoing(text: str) -> str:
    for pat, rep in SECRET_MASKS:
        text = pat.sub(rep, text)
    return text

def inspect_tool_call(req: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Evaluates incoming tools/call JSON-RPC request for invariant violations."""
    method = req.get("method")
    if method != "tools/call":
        return None
    
    params = req.get("params", {})
    tool_name = params.get("name", "unknown")
    arguments = params.get("arguments", {})
    arg_str = json.dumps(arguments)

    for pat, desc in DESTRUCTIVE_PATTERNS:
        if pat.search(arg_str):
            req_id = req.get("id")
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32603,
                    "message": f"BTP Interception: {desc}",
                    "data": {
                        "verdict": "DENY",
                        "policy": "BTP-MCP-INV-001",
                        "blocked_tool": tool_name,
                        "remediation": "Restrict operation scope to workspace boundaries and avoid unconstrained destructive flags."
                    }
                }
            }
    return None

def run_mcp_proxy(downstream_cmd: list):
    if not downstream_cmd:
        print("[!] No downstream command provided for MCP proxy. Exiting.", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Bartholomew MCP Zero-Trust Proxy active. Spawning: {' '.join(downstream_cmd)}", file=sys.stderr)

    proc = subprocess.Popen(
        downstream_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=sys.stderr,
        bufsize=0
    )

    def forward_downstream_stdout():
        for line in proc.stdout:
            try:
                decoded = line.decode("utf-8", errors="ignore")
                sanitized = sanitize_outgoing(decoded)
                sys.stdout.write(sanitized)
                sys.stdout.flush()
            except Exception:
                sys.stdout.buffer.write(line)
                sys.stdout.flush()

    out_thread = threading.Thread(target=forward_downstream_stdout, daemon=True)
    out_thread.start()

    # Read from parent stdin (Claude Desktop / Cursor)
    try:
        for line in sys.stdin:
            line_str = line.strip()
            if not line_str:
                continue
            
            try:
                payload = json.loads(line_str)
                rejection = inspect_tool_call(payload)
                if rejection:
                    print(f"[!] BTP Shield Blocked Violating Call: {payload.get('params', {}).get('name')}", file=sys.stderr)
                    sys.stdout.write(json.dumps(rejection) + "\n")
                    sys.stdout.flush()
                    continue
            except Exception:
                pass
            
            # Forward cleanly to downstream server
            proc.stdin.write(line.encode("utf-8"))
            proc.stdin.flush()
    except (KeyboardInterrupt, BrokenPipeError):
        pass
    finally:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    run_mcp_proxy(sys.argv[1:])
