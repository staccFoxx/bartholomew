from .webhook_dispatcher import dispatch_incident, get_dispatcher
"""
Bartholomew (btp_guard) Drop-In SDK
====================================
Sub-millisecond cryptographic invariant and safety guardrail engine for autonomous AI agents.

Usage:
  from btp_guard import Guard, wrap_client
  guard = Guard(spend_cap=100.0, max_retries=5)
  result = guard.check("rm -rf /var/data")
"""

import sys
import os
from typing import Optional, Dict, Any, Tuple, List, Union

repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

from src import (
    Guard,
    wrap_client,
    BartholomewTrustAuthority,
    IndependentTrustVerifier,
    DeclarativePolicyEngine,
    MarginalUtilityTracker,
    secure_tool,
    SecurityVetoException,
    guard
)
from src.ast_validator import ASTSecurityValidator
from src.hermetic_sandbox import HermeticCommandSandbox, HermeticFileSandbox
from src.polyglot_ast_validator import PolyglotASTValidator
from src.secret_masker import SecretVaultMasker
from src.snapshot_engine import WorkspaceSnapshotEngine
from src.mcp_gateway import MCPProxyGateway
from src.a2a_protocol import AgentToAgentProtocol
from src.cloud_identity import CloudKMSProvider, LocalEd25519Provider, OIDCPolicyEvaluator
from src.usage_tracker import load_license, save_license, record_evaluation, STRIPE_PRO_URL, STRIPE_ENTERPRISE_URL
from src.agent_passport import SovereignAgentPassport, AgentPeerDiscoveryRegistry

__version__ = "6.6.3"
__all__ = [
    "Guard",
    "wrap_client",
    "secure_tool",
    "SecurityVetoException",
    "guard",
    "load_license",
    "save_license",
    "record_evaluation",
    "STRIPE_PRO_URL",
    "STRIPE_ENTERPRISE_URL",
    "BartholomewTrustAuthority",
    "IndependentTrustVerifier",
    "ASTSecurityValidator",
    "PolyglotASTValidator",
    "SecretVaultMasker",
    "WorkspaceSnapshotEngine",
    "MCPProxyGateway",
    "AgentToAgentProtocol",
    "CloudKMSProvider",
    "LocalEd25519Provider",
    "OIDCPolicyEvaluator",
    "HermeticCommandSandbox",
    "HermeticFileSandbox",
    "DeclarativePolicyEngine",
    "MarginalUtilityTracker",
    "SovereignAgentPassport",
    "AgentPeerDiscoveryRegistry",
    "WireGuard"
]


class WireGuard:
    """
    BTP v5.4 Cloud-Connected M2M Wire Guard.
    Transparently intercepts tool calls and validates them against the live Bartholomew
    Cloud Run execution firewall over public HTTPS in sub-milliseconds.
    """
    DEFAULT_PUBLIC_ENDPOINT = "https://bartolomew-cloud-engine-322603900775.us-central1.run.app/api/v1/m2m/verify"

    def __init__(
        self,
        endpoint: Optional[str] = None,
        agent_id: str = "python-agent-client",
        timeout: float = 4.0,
        fallback_local: bool = True
    ):
        self.endpoint = endpoint or os.getenv("BTP_WIRE_ENDPOINT", self.DEFAULT_PUBLIC_ENDPOINT)
        self.agent_id = agent_id
        self.timeout = timeout
        self.fallback_local = fallback_local

    def verify_tool(self, tool_name: str, arguments: Optional[Dict[str, Any]] = None, command: Optional[str] = None) -> Dict[str, Any]:
        """
        Submits tool action to the public wire daemon and returns Ed25519 zk-TCP proof or VETO.
        """
        import urllib.request
        import json

        args_dict = arguments or {}
        cmd_str = command or (args_dict.get("query") or args_dict.get("statement") or args_dict.get("command") or args_dict.get("code") or "")

        payload = {
            "agent_id": self.agent_id,
            "tool_name": tool_name,
            "command": cmd_str,
            "arguments": args_dict
        }

        try:
            req = urllib.request.Request(
                self.endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "X-Agent-ID": self.agent_id}
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            if self.fallback_local:
                # Local in-process fallback
                safe, reason, _ = PolyglotASTValidator.validate_code(str(payload["command"]))
                if safe:
                    return {"status": "APPROVED", "tool_name": tool_name, "mode": "local_fallback"}
                return {"status": "VETOED", "tool_name": tool_name, "violation": reason, "mode": "local_fallback"}
            raise ConnectionError(f"Failed to reach Bartholomew M2M Wire Gateway at {self.endpoint}: {str(e)}")

    def guard_tool(self, func):
        """Decorator to wrap any Python tool function with wire-level BTP protection."""
        import inspect

        def wrapper(*args, **kwargs):
            tool_name = func.__name__
            cmd_str = ""
            # Inspect signature to bind positional args
            try:
                sig = inspect.signature(func)
                bound = sig.bind_partial(*args, **kwargs)
                bound.apply_defaults()
                for v in bound.arguments.values():
                    if isinstance(v, str):
                        cmd_str = v
                        break
            except Exception:
                if args and isinstance(args[0], str):
                    cmd_str = args[0]

            res = self.verify_tool(tool_name, kwargs, command=cmd_str)
            if res.get("status") == "VETOED":
                reason = res.get("violation", "Action blocked by AST policy")
                raise SecurityVetoException(reason, metadata=res, payload_preview=cmd_str)
            return func(*args, **kwargs)
        return wrapper

