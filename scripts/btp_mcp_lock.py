#!/usr/bin/env python3
"""
Bartholomew Guard — `btp-mcp-lock` (package-lock.json for MCP servers).
Protects Claude Code, Cursor, Windsurf, and autonomous agents against:
  1. MCP Rug-Pulls (silent mutation of server commands, args, or tool schemas/descriptions)
  2. MCP Tool Poisoning (hidden prompt-injection instructions & zero-width Unicode payloads)

Usage:
  python btp_mcp_lock.py lock   --config mcp.json --out mcp-lock.json
  python btp_mcp_lock.py verify --config mcp.json --lock mcp-lock.json
  python btp_mcp_lock.py audit  --tools tools.json
"""
import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

POISON_PATTERNS = [
    ("PROMPT_OVERRIDE", re.compile(r"(ignore\s+(all\s+)?previous\s+instructions|disregard\s+prior|you\s+are\s+now\s+in\s+developer\s+mode)", re.I)),
    ("HIDDEN_EXFIL", re.compile(r"(read\s+~?/\.ssh|id_rsa|/etc/passwd|\.env\b.*(pass|include|send|append)|exfiltrat|before\s+calling\s+this\s+tool.*read)", re.I)),
    ("SILENT_INSTRUCTION", re.compile(r"(<IMPORTANT>|<\s*system\s*>|do\s+not\s+(tell|mention|inform)\s+the\s+user|hide\s+this\s+from\s+the\s+user)", re.I)),
    ("SHELL_PIVOT", re.compile(r"(curl\s+.*\|\s*(sh|bash)|wget\s+.*\|\s*(sh|bash)|powershell\s+-enc|base64\s+-d)", re.I)),
]

ZERO_WIDTH_RE = re.compile(r"[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]")


def canonical_sha256(obj) -> str:
    raw = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_mcp_config(data: dict) -> dict:
    servers = data.get("mcpServers") or data.get("servers") or {}
    normalized = {}
    for name, cfg in sorted(servers.items()):
        if not isinstance(cfg, dict):
            continue
        env_keys = sorted(cfg.get("env", {}).keys()) if isinstance(cfg.get("env"), dict) else []
        entry = {
            "command": cfg.get("command", ""),
            "args": cfg.get("args", []),
            "url": cfg.get("url", ""),
            "transport": cfg.get("transport", cfg.get("type", "stdio" if cfg.get("command") else "http")),
            "env_keys": env_keys,
        }
        if "tools" in cfg and isinstance(cfg["tools"], list):
            entry["tools"] = [
                {
                    "name": t.get("name", ""),
                    "description": t.get("description", ""),
                    "inputSchema": t.get("inputSchema", {}),
                }
                for t in cfg["tools"]
                if isinstance(t, dict)
            ]
        normalized[name] = {
            "digest": canonical_sha256(entry),
            "spec": entry,
        }
    return normalized


def scan_for_poisoning(obj, path_prefix: str = "") -> list[dict]:
    alerts = []
    if isinstance(obj, str):
        if ZERO_WIDTH_RE.search(obj):
            alerts.append({
                "severity": "HIGH",
                "type": "ZERO_WIDTH_STEGO",
                "location": path_prefix,
                "detail": "Hidden zero-width Unicode characters detected (classic invisible prompt-injection vector).",
            })
        for tag, rx in POISON_PATTERNS:
            m = rx.search(obj)
            if m:
                alerts.append({
                    "severity": "HIGH",
                    "type": tag,
                    "location": path_prefix,
                    "detail": f"Suspicious tool-poisoning phrase matched: `{m.group(0)[:80]}`",
                })
    elif isinstance(obj, dict):
        for k, v in obj.items():
            nxt = f"{path_prefix}.{k}" if path_prefix else str(k)
            alerts.extend(scan_for_poisoning(v, nxt))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            alerts.extend(scan_for_poisoning(item, f"{path_prefix}[{i}]"))
    return alerts


def cmd_lock(args) -> int:
    cfg_path = Path(args.config)
    out_path = Path(args.out)
    data = load_json(cfg_path)
    alerts = scan_for_poisoning(data)
    normalized = normalize_mcp_config(data)

    lockfile = {
        "lockfileVersion": 1,
        "generator": "btp-mcp-lock (bartholomew.info)",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": cfg_path.name,
        "servers": normalized,
        "rootDigest": canonical_sha256(normalized),
    }
    out_path.write_text(json.dumps(lockfile, indent=2), encoding="utf-8")
    print(f"[btp-mcp-lock] Locked {len(normalized)} MCP server(s) -> {out_path} ({lockfile['rootDigest'][:24]}...)")
    if alerts:
        print(f"[WARNING] {len(alerts)} potential tool-poisoning alert(s) found during lock:")
        for a in alerts:
            print(f"  [{a['severity']}] {a['type']} at {a['location']}: {a['detail']}")
        return 2
    return 0


def cmd_verify(args) -> int:
    cfg_path = Path(args.config)
    lock_path = Path(args.lock)
    current_raw = load_json(cfg_path)
    lock_data = load_json(lock_path)

    current = normalize_mcp_config(current_raw)
    locked = lock_data.get("servers", {})
    alerts = scan_for_poisoning(current_raw)

    drifts = []
    for name, info in current.items():
        if name not in locked:
            drifts.append(f"ADDED server `{name}` (not present in {lock_path.name})")
        elif info["digest"] != locked[name]["digest"]:
            drifts.append(f"MUTATED server `{name}` (digest mismatch — possible MCP rug-pull!)")
    for name in locked:
        if name not in current:
            drifts.append(f"REMOVED server `{name}`")

    if alerts:
        print(f"[VETO] {len(alerts)} MCP tool-poisoning alert(s) detected:")
        for a in alerts:
            print(f"  [{a['severity']}] {a['type']} at {a['location']}: {a['detail']}")

    if drifts:
        print(f"[VETO] MCP lockfile verification FAILED ({len(drifts)} drift(s)):")
        for d in drifts:
            print(f"  - {d}")
        return 1

    if alerts:
        return 2

    print(f"[PASS] All {len(current)} MCP server(s) match {lock_path.name} ({lock_data.get('rootDigest', '')[:24]}...). Zero poisoning detected.")
    return 0


def cmd_audit(args) -> int:
    data = load_json(Path(args.tools))
    alerts = scan_for_poisoning(data)
    if alerts:
        print(f"[VETO] {len(alerts)} tool-poisoning alert(s) found in {args.tools}:")
        for a in alerts:
            print(f"  [{a['severity']}] {a['type']} at {a['location']}: {a['detail']}")
        return 1
    print(f"[PASS] Zero tool-poisoning patterns detected in {args.tools}.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Bartholomew Guard — btp-mcp-lock (package-lock.json for MCP servers)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p_lock = sub.add_parser("lock", help="Generate cryptographic mcp-lock.json from an MCP config")
    p_lock.add_argument("--config", required=True, help="Path to mcp.json / claude_desktop_config.json")
    p_lock.add_argument("--out", default="mcp-lock.json", help="Output lockfile path")

    p_ver = sub.add_parser("verify", help="Verify MCP config against mcp-lock.json (blocks rug-pulls)")
    p_ver.add_argument("--config", required=True, help="Path to current MCP config")
    p_ver.add_argument("--lock", default="mcp-lock.json", help="Path to trusted mcp-lock.json")

    p_aud = sub.add_parser("audit", help="Scan any MCP tool schema JSON for prompt-injection poisoning")
    p_aud.add_argument("--tools", required=True, help="Path to MCP tools/manifest JSON")

    args = ap.parse_args()
    if args.cmd == "lock":
        return cmd_lock(args)
    if args.cmd == "verify":
        return cmd_verify(args)
    if args.cmd == "audit":
        return cmd_audit(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
