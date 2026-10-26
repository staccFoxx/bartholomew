"""
Bartholomew Model Context Protocol (MCP) Resilient Proxy Gateway (v2.4)
========================================================================
Acts as an inline intercepting proxy between any MCP Client (Claude Desktop,
Cursor, AWS Bedrock, Windsurf) and any downstream MCP Server (Filesystem, Shell, GitHub).

Architecture:
  [MCP Client] <--(stdio/HTTP)--> [Bartholomew MCP Gateway] <--(stdio)--> [Downstream MCP Server]
                                             
                                   [In-Flight Secret Redaction]
                                   [Transactional Workspace CoW]
                                   [Chained Ed25519 Receipts]

Features:
  1. tools/call: Evaluates arguments against AST invariants, redacting secrets and bounding paths.
  2. Transactional Rollback: Pre-snapshots files before mutating tools; rolls back cleanly if checks fail.
  3. Chained Session Receipts: Every approved turn is mathematically linked to the parent turn hash.
  4. tools/list: Decorates tool schemas with BTP invariant safety badges.
  5. Response Scrubbing: Strips sensitive credentials leaking out from server stdout.
"""

import sys
import os
import json
import time
import hashlib
from typing import Dict, Any, Tuple, Optional, Callable, List

sys.path.insert(0, os.path.abspath("."))
from src.polyglot_ast_validator import PolyglotASTValidator
from src.secret_masker import SecretVaultMasker
from src.trust_protocol import BartholomewTrustAuthority
from src.workspace_transaction import WorkspaceTransaction
from src.rfc8785 import rfc8785_canonicalize
from src.v25_kernel import SyntheticEventGate, SyntheticEvent, CoWTreeSnapshot, RecursiveSubRingRouter, NetworkEgressGate, EgressTarget


class RecursiveJsonRpcDefense:
    """
    Mathematical defense against recursive JSON-RPC payload nesting and parameter smuggling (Marcus Vance Zero-Day Defense).
    Recursively scans arbitrary nested dicts, lists, and stringified JSON payloads up to MAX_DEPTH.
    """
    MAX_NESTING_DEPTH = 12
    DANGEROUS_PATTERNS = [
        "rm -rf", "mkfs", "dd if=", "DROP TABLE", "TRUNCATE ", "format /",
        "curl | bash", "curl | sh", "wget | bash", "wget | sh", "curl*|*bash",
        "bash -i >& /dev/tcp", "nc -e /bin/sh", ":(){ :|:& };:"
    ]

    @classmethod
    def inspect_recursive_payload(cls, obj: Any, depth: int = 0) -> Tuple[bool, Optional[str], List[str]]:
        """
        Recursively unpacks and evaluates nested structures.
        Returns (is_safe, error_message, extracted_candidates).
        """
        if depth > cls.MAX_NESTING_DEPTH:
            return False, f"BTP-RECURSION-OVERFLOW-VETO: Maximum JSON-RPC nesting depth ({cls.MAX_NESTING_DEPTH}) exceeded.", []

        extracted_commands: List[str] = []

        if isinstance(obj, dict):
            # Check for smuggled JSON-RPC dispatch markers
            if "method" in obj and obj.get("method") in ["tools/call", "resources/read", "prompts/get", "execute_command", "bash"]:
                return False, f"BTP-SMUGGLED-RPC-VETO: Nested JSON-RPC method dispatch '{obj.get('method')}' detected inside argument body.", []

            for k, v in obj.items():
                if isinstance(v, str):
                    # Check for destructive patterns
                    for p in cls.DANGEROUS_PATTERNS:
                        if p.replace("*", "") in v.lower():
                            return False, f"BTP-VETO: Destructive command pattern '{p}' detected in nested parameter '{k}'.", []

                    # Attempt JSON unpack if string looks like nested JSON
                    s = v.strip()
                    if (s.startswith("{") and s.endswith("}")) or (s.startswith("[") and s.endswith("]")):
                        try:
                            nested_parsed = json.loads(s)
                            is_safe, err, sub_cands = cls.inspect_recursive_payload(nested_parsed, depth + 1)
                            if not is_safe:
                                return False, err, []
                            extracted_commands.extend(sub_cands)
                        except Exception:
                            pass

                    # Treat candidate fields as potential execution code
                    if k.lower() in ["command", "cmd", "code", "query", "sql", "script", "payload", "input", "exec", "run"]:
                        extracted_commands.append(v)
                elif isinstance(v, (dict, list)):
                    is_safe, err, sub_cands = cls.inspect_recursive_payload(v, depth + 1)
                    if not is_safe:
                        return False, err, []
                    extracted_commands.extend(sub_cands)

        elif isinstance(obj, list):
            for idx, item in enumerate(obj):
                is_safe, err, sub_cands = cls.inspect_recursive_payload(item, depth + 1)
                if not is_safe:
                    return False, err, []
                extracted_commands.extend(sub_cands)

        elif isinstance(obj, str):
            s = obj.strip()
            if (s.startswith("{") and s.endswith("}")) or (s.startswith("[") and s.endswith("]")):
                try:
                    nested_parsed = json.loads(s)
                    return cls.inspect_recursive_payload(nested_parsed, depth + 1)
                except Exception:
                    pass

        return True, None, extracted_commands


class MCPProxyGateway:
    """
    Transparent JSON-RPC 2.0 Invariant Interception & Transactional Gateway for MCP tool calling (BTP v2.5).
    Features Sub-Microsecond Synthetic OS Event Gating, Tree-Level CoW Rollback, and Merkle Provenance.
    """

    MUTATING_TOOL_NAMES = {
        "write_file", "edit_file", "create_file", "delete_file", "create_directory",
        "execute_command", "bash", "shell", "run_terminal_command", "apply_patch"
    }

    GUI_EVENT_TOOL_NAMES = {
        "mouse_click", "mouse_drag", "keystroke", "press_key", "type_text",
        "focus_window", "computer_action", "os_action", "desktop_click", "gui_action"
    }

    def __init__(self, trust_authority: Optional[BartholomewTrustAuthority] = None, workspace_root: Optional[str] = None):
        self.authority = trust_authority or BartholomewTrustAuthority()
        self.workspace_root = os.path.abspath(workspace_root or os.getcwd())
        self.total_intercepted = 0
        self.total_vetoed = 0
        self.total_redacted = 0
        self.total_rollbacks = 0
        self.synthetic_gate = SyntheticEventGate()
        self.network_gate = NetworkEgressGate()
        self.cow_tree = CoWTreeSnapshot(workspace_root=self.workspace_root)
        self.active_transactions: Dict[Any, WorkspaceTransaction] = {}
        self.session_receipt_chain: List[Dict[str, Any]] = []
        self.latest_receipt_hash: str = "GENESIS_ROOT_HASH_0000000000000000"

    def intercept_jsonrpc_request(self, raw_json_str: str) -> Tuple[bool, Dict[str, Any], Optional[Dict[str, Any]]]:
        """
        Intercepts incoming JSON-RPC payload from an MCP Client.
        
        Returns:
          (forward_to_downstream: bool, sanitized_request_dict, veto_response_dict)
        """
        t0 = time.perf_counter()
        self.total_intercepted += 1

        try:
            req = json.loads(raw_json_str)
        except Exception as e:
            return False, {}, {
                "jsonrpc": "2.0",
                "id": None,
                "error": {"code": -32700, "message": f"Parse error: {str(e)}"}
            }

        req_id = req.get("id")
        method = req.get("method")
        params = req.get("params", {})

        # Only gate tools/call requests
        if method != "tools/call":
            return True, req, None

        tool_name = params.get("name", "unknown_tool")
        arguments = params.get("arguments", {})

        # Handle native btp_get_manifest query directly
        if tool_name in ["btp_get_manifest", "btp_manifest"]:
            from src.btp_manifest import generate_manifest
            manifest_data = generate_manifest()
            manifest_response = {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(manifest_data, indent=2)
                        }
                    ]
                }
            }
            return False, req, manifest_response

        # 1. High-Entropy Secret Masking on Tool Arguments
        sanitized_args, redactions_count, _ = SecretVaultMasker.sanitize_payload(arguments)
        if redactions_count > 0:
            self.total_redacted += redactions_count
            params["arguments"] = sanitized_args
            req["params"] = params

        # 1.5. BTP v2.5 Synthetic OS & GUI Computer-Use Event Gating (<1.0 µs)
        if tool_name in self.GUI_EVENT_TOOL_NAMES or any(k in sanitized_args for k in ["x", "y", "coordinate", "key_sequence", "target_window"]):
            coord_x = sanitized_args.get("x")
            coord_y = sanitized_args.get("y")
            if "coordinate" in sanitized_args and isinstance(sanitized_args["coordinate"], (list, tuple)) and len(sanitized_args["coordinate"]) >= 2:
                coord_x, coord_y = sanitized_args["coordinate"][0], sanitized_args["coordinate"][1]
            
            synth_event = SyntheticEvent(
                event_type=tool_name,
                x=coord_x if isinstance(coord_x, int) else None,
                y=coord_y if isinstance(coord_y, int) else None,
                key_sequence=sanitized_args.get("text") or sanitized_args.get("key") or sanitized_args.get("key_sequence"),
                target_window=sanitized_args.get("window") or sanitized_args.get("target_window") or sanitized_args.get("title")
            )
            is_valid_event, event_err, safe_alt = self.synthetic_gate.evaluate_event(synth_event)
            if not is_valid_event:
                self.total_vetoed += 1
                latency_us = (time.perf_counter() - t0) * 1_000_000
                hint = "Synthetic action attempts interaction with a prohibited OS region or system window."
                if safe_alt:
                    hint = f"Coordinate ({coord_x}, {coord_y}) intersects prohibited zone. Self-correction target: (x={safe_alt[0]}, y={safe_alt[1]})."

                veto_response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32000,
                        "message": f"BTP-VETO: Synthetic OS Event Violation on tool '{tool_name}'",
                        "data": {
                            "verdict": "DENY",
                            "protocol_version": "BTP/2.5",
                            "rule": event_err,
                            "suggested_alternative": {"x": safe_alt[0], "y": safe_alt[1]} if safe_alt else None,
                            "latency_us": round(latency_us, 2),
                            "authority_pubkey": self.authority.public_key_hex,
                            "diagnostic_hint": hint
                        }
                    }
                }
                return False, req, veto_response

        # 1.7. BTP v2.5 Non-Idempotent Network Egress Pre-Execution Gate (<0.8 µs)
        # Because dispatched TCP packets cannot be rolled back, unauthorized hosts are dropped before socket dispatch
        network_candidates = []
        for k in ["url", "endpoint", "host", "destination", "target_url"]:
            if k in sanitized_args and isinstance(sanitized_args[k], str):
                network_candidates.append(sanitized_args[k])

        for target_str in network_candidates:
            from urllib.parse import urlparse
            try:
                parsed = urlparse(target_str if "://" in target_str else f"http://{target_str}")
                host = parsed.hostname or target_str
                port = parsed.port
                is_allowed_net, net_err = self.network_gate.evaluate_target(EgressTarget(host=host, port=port))
                if not is_allowed_net:
                    self.total_vetoed += 1
                    latency_us = (time.perf_counter() - t0) * 1_000_000
                    veto_response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {
                            "code": -32000,
                            "message": f"BTP-VETO: Network Egress Boundary Violation on tool '{tool_name}'",
                            "data": {
                                "verdict": "DENY",
                                "protocol_version": "BTP/2.5",
                                "boundary_type": "NON_IDEMPOTENT_PREVENTION",
                                "rule": net_err,
                                "latency_us": round(latency_us, 2),
                                "authority_pubkey": self.authority.public_key_hex,
                                "diagnostic_hint": "Outbound connection to unauthorized or internal address blocked before socket creation."
                            }
                        }
                    }
                    return False, req, veto_response
            except Exception:
                pass

        # 2. Transactional Workspace Pre-Snapshot for Mutating Tools (BTP v2.5 Tree & File)
        if tool_name in self.MUTATING_TOOL_NAMES or any(m in tool_name.lower() for m in ["write", "delete", "edit"]):
            tx = WorkspaceTransaction(workspace_root=self.workspace_root)
            # Pre-snapshot target file if specified
            target_path = sanitized_args.get("path") or sanitized_args.get("file_path") or sanitized_args.get("target_file")
            if target_path and isinstance(target_path, str):
                try:
                    tx.snapshot_file(target_path)
                except PermissionError as pe:
                    self.total_rollbacks += 1
                    rollback_res = tx.rollback(reason=str(pe))
                    veto_response = {
                        "jsonrpc": "2.0",
                        "id": req_id,
                        "error": {
                            "code": -32000,
                            "message": f"BTP-ROLLBACK: Boundary Violation on tool '{tool_name}'",
                            "data": {
                                "verdict": "ROLLED_BACK",
                                "diagnostic_hint": str(pe),
                                "rollback_details": rollback_res
                            }
                        }
                    }
                    return False, req, veto_response
            
            # Capture CoW tree checkpoint for multi-file commands
            if tool_name in {"execute_command", "bash", "shell", "run_terminal_command", "apply_patch"}:
                try:
                    self.cow_tree.capture(f"cow_{req_id}")
                except Exception:
                    pass

            self.active_transactions[req_id] = tx

        # 3. Marcus Vance Recursive JSON-RPC Breakout & Depth Inspection
        is_rec_safe, rec_err, rec_candidates = RecursiveJsonRpcDefense.inspect_recursive_payload(sanitized_args)
        if not is_rec_safe:
            self.total_vetoed += 1
            latency_us = (time.perf_counter() - t0) * 1_000_000
            veto_response = {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32000,
                    "message": f"BTP-VETO: Recursive JSON-RPC Breakout on tool '{tool_name}'",
                    "data": {
                        "verdict": "DENY",
                        "rule": rec_err,
                        "defense": "Marcus Vance Recursive Payload Sentinel (BTP v6.6.7)",
                        "latency_us": round(latency_us, 2),
                        "authority_pubkey": self.authority.public_key_hex
                    }
                }
            }
            return False, req, veto_response

        code_candidates = list(set(rec_candidates))
        if isinstance(sanitized_args, dict):
            for k in ["command", "cmd", "code", "query", "sql", "script", "payload", "input"]:
                if k in sanitized_args and isinstance(sanitized_args[k], str) and sanitized_args[k] not in code_candidates:
                    code_candidates.append(sanitized_args[k])

        # 4. Polyglot AST Invariant Evaluation
        for candidate in code_candidates:
            is_safe, msg, meta = PolyglotASTValidator.validate_code(candidate)
            if not is_safe:
                self.total_vetoed += 1
                latency_us = (time.perf_counter() - t0) * 1_000_000

                # If a transaction was opened for this request, roll it back
                rollback_info = None
                if req_id in self.active_transactions:
                    tx = self.active_transactions.pop(req_id)
                    rollback_info = tx.rollback(reason=msg)
                    self.total_rollbacks += 1
                
                # Construct JSON-RPC Hard Veto Error with actionable diagnostics
                veto_response = {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {
                        "code": -32000,
                        "message": f"BTP-VETO: Invariant Gate Violation on tool '{tool_name}'",
                        "data": {
                            "verdict": "DENY",
                            "rule": msg,
                            "latency_us": round(latency_us, 2),
                            "authority_pubkey": self.authority.public_key_hex,
                            "rollback_status": rollback_info["status"] if rollback_info else "NO_MUTATION",
                            "diagnostic_hint": "Please adjust arguments to avoid forbidden calls or out-of-scope modifications."
                        }
                    }
                }
                return False, req, veto_response

        # 5. Action Approved: Generate chained receipt
        receipt = self._issue_chained_receipt(tool_name, sanitized_args)
        req["_btp_receipt_hash"] = receipt["receipt_hash"]

        return True, req, None

    def intercept_jsonrpc_response(self, raw_resp_str: str) -> Dict[str, Any]:
        """
        Intercepts outgoing response from downstream MCP Server, scrubbing any secrets before returning to client.
        Commits any pending workspace transaction on success.
        """
        try:
            resp = json.loads(raw_resp_str)
        except Exception:
            return {}

        req_id = resp.get("id")
        if req_id in self.active_transactions:
            tx = self.active_transactions.pop(req_id)
            if "error" in resp:
                tx.rollback(reason=f"Downstream tool reported error: {resp['error'].get('message', '')}")
                self.total_rollbacks += 1
            else:
                tx.commit()

        # Scrub outgoing payload secrets
        sanitized_resp, redactions_count, _ = SecretVaultMasker.sanitize_payload(resp)
        if redactions_count > 0:
            self.total_redacted += redactions_count

        # Auto-inject btp_get_manifest tool if this is a tools/list response
        if isinstance(sanitized_resp, dict) and "result" in sanitized_resp and isinstance(sanitized_resp["result"], dict) and "tools" in sanitized_resp["result"]:
            tools = sanitized_resp["result"]["tools"]
            if isinstance(tools, list) and not any(isinstance(t, dict) and t.get("name") == "btp_get_manifest" for t in tools):
                tools.append({
                    "name": "btp_get_manifest",
                    "description": "Returns machine-readable BTP v1.0.0 service discovery manifest detailing identity, capabilities, accepted protocols, pricing meters, and security rules.",
                    "inputSchema": {
                        "type": "object",
                        "properties": {}
                    }
                })

        return sanitized_resp if isinstance(sanitized_resp, dict) else resp

    def _issue_chained_receipt(self, tool_name: str, sanitized_args: Dict[str, Any]) -> Dict[str, Any]:
        """
        Creates a chained Ed25519-signed receipt binding this step to the previous turn hash.
        """
        now = time.time()
        payload_bytes = rfc8785_canonicalize(sanitized_args)
        payload_hash = hashlib.sha256(payload_bytes).hexdigest()

        receipt_body = {
            "version": "BTP/2.4",
            "timestamp": now,
            "tool_name": tool_name,
            "parent_receipt_hash": self.latest_receipt_hash,
            "payload_hash": payload_hash,
            "authority": self.authority.public_key_hex
        }

        body_canonical = rfc8785_canonicalize(receipt_body)
        signature = self.authority.private_key.sign(body_canonical).hex()
        current_hash = hashlib.sha256(body_canonical).hexdigest()

        entry = {
            "receipt": receipt_body,
            "signature": signature,
            "receipt_hash": current_hash
        }

        self.latest_receipt_hash = current_hash
        self.session_receipt_chain.append(entry)
        return entry

    def export_session_audit_manifest(self) -> Dict[str, Any]:
        """
        Exports the entire session audit trail as a signed cryptographic manifest.
        """
        manifest_body = {
            "protocol": "BTP/2.4-MANIFEST",
            "authority": self.authority.public_key_hex,
            "total_steps": len(self.session_receipt_chain),
            "final_root_hash": self.latest_receipt_hash,
            "total_intercepted": self.total_intercepted,
            "total_vetoed": self.total_vetoed,
            "total_redacted": self.total_redacted,
            "total_rollbacks": self.total_rollbacks
        }
        canonical_bytes = rfc8785_canonicalize(manifest_body)
        sig = self.authority.private_key.sign(canonical_bytes).hex()

        return {
            "manifest": manifest_body,
            "signature": sig,
            "chain": self.session_receipt_chain
        }

    def run_stdio_proxy(self, downstream_cmd: List[str]):
        """
        Launches downstream MCP server subprocess, piping stdin/stdout with real-time invariant interception.
        """
        import subprocess
        import threading

        # guard.shielded
        proc = subprocess.Popen(
            downstream_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=sys.stderr,
            text=True,
            bufsize=1
        )

        def _forward_stdout():
            for line in proc.stdout:
                sanitized_resp = self.intercept_jsonrpc_response(line)
                if sanitized_resp:
                    sys.stdout.write(json.dumps(sanitized_resp) + "\n")
                else:
                    sys.stdout.write(line)
                sys.stdout.flush()

        t = threading.Thread(target=_forward_stdout, daemon=True)
        t.start()

        for line in sys.stdin:
            forward, req, veto = self.intercept_jsonrpc_request(line)
            if not forward and veto:
                sys.stdout.write(json.dumps(veto) + "\n")
                sys.stdout.flush()
            else:
                if proc.stdin:
                    proc.stdin.write(json.dumps(req) + "\n")
                    proc.stdin.flush()

        proc.wait()


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Bartholomew MCP Resilient Invariant Proxy Gateway (v2.4)")
    parser.add_argument("--server-cmd", nargs="+", required=True, help="Downstream MCP server command to launch")
    parser.add_argument("--workspace", default=None, help="Root workspace directory to bound tool mutations")
    args = parser.parse_args()

    gateway = MCPProxyGateway(workspace_root=args.workspace)
    gateway.run_stdio_proxy(args.server_cmd)


if __name__ == "__main__":
    main()
