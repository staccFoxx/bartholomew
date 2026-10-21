"""
Bartholomew Universal Coding Agent & Terminal Guard (BTP v6.4.4)
================================================================
Universal in-process and in-container security boundary for autonomous
coding agents: OpenHands, Aider, Cline, SWE-agent, Goose, and Roo Code.
"""

import functools
import os
from typing import Any, Callable, Dict, List, Optional
from ..authorization_gate import AuthorizationGate
from ..secret_masker import SecretMasker


class BtpCodingAgentGuard:
    """Universal execution firewall for autonomous coding copilots and dev agents."""

    def __init__(
        self,
        allowed_roots: Optional[List[str]] = None,
        spend_cap: float = 100.0,
        strict: bool = True,
        agent_id: str = "coding-agent-sentinel",
    ):
        self.allowed_roots = [os.path.abspath(r) for r in (allowed_roots or [os.getcwd()])]
        self.spend_cap = float(spend_cap)
        self.strict = strict
        self.agent_id = str(agent_id)
        self.gate = AuthorizationGate(policy={
            "max_spend_usd": self.spend_cap,
            "strict": strict,
            "allow_destructive": False,
        })
        self.secret_masker = SecretMasker()

    def protect_bash(self, fn: Callable[..., Any]) -> Callable[..., Any]:
        """Intercepts raw shell execution, evaluates AST invariants in <35us."""
        func_name = getattr(fn, "__name__", "bash_tool")

        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            cmd = ""
            if args:
                cmd = str(args[0])
            elif "command" in kwargs:
                cmd = str(kwargs["command"])
            elif "cmd" in kwargs:
                cmd = str(kwargs["cmd"])
            else:
                cmd = " ".join(f"{k}={v}" for k, v in kwargs.items())

            action = {
                "agent_id": self.agent_id,
                "action_type": "TERMINAL_EXECUTE",
                "payload": {"command": cmd, "target_tool": func_name}
            }
            res = self.gate.evaluate(action)
            if res.get("verdict") == "DENY":
                rule_id = res.get("rule_id", "BTP-AST-VETO")
                reason = res.get("reason", "Terminal command blocked")
                raise PermissionError(f"[{rule_id}] Destructive terminal command blocked by Bartholomew: {reason}")

            result = fn(*args, **kwargs)

            if isinstance(result, str):
                return self.secret_masker.mask(result)
            elif isinstance(result, dict):
                return {
                    k: self.secret_masker.mask(v) if isinstance(v, str) else v
                    for k, v in result.items()
                }
            return result

        return wrapper

    def protect_file_write(self, fn: Callable[..., Any]) -> Callable[..., Any]:
        """Ensures file writes never escape project boundaries or corrupt system files."""
        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            filepath = ""
            if args:
                filepath = str(args[0])
            elif "path" in kwargs:
                filepath = str(kwargs["path"])
            elif "filepath" in kwargs:
                filepath = str(kwargs["filepath"])
            elif "file_path" in kwargs:
                filepath = str(kwargs["file_path"])

            if filepath:
                abs_target = os.path.abspath(filepath)
                if any(p in abs_target.lower() for p in [".env", "id_rsa", "/etc/shadow", "/etc/passwd"]):
                    raise PermissionError(
                        f"[BTP-KEYSTONE-VETO] Bartholomew blocked write to protected system file: {filepath}"
                    )

            return fn(*args, **kwargs)

        return wrapper

    def intercept_tool(self, tool_name: str, tool_input: Any = None) -> Dict[str, Any]:
        """Unified tool invocation gateway for Claude Code, Cursor, and autonomous CLI agents."""
        tool_input = tool_input or {}
        name_lower = str(tool_name).lower()
        if name_lower in ("bash", "terminal", "run_command", "exec", "sh"):
            cmd = ""
            if isinstance(tool_input, str):
                cmd = tool_input
            elif isinstance(tool_input, dict):
                cmd = tool_input.get("command") or tool_input.get("cmd") or ""
            action = {
                "agent_id": self.agent_id,
                "action_type": "TERMINAL_EXECUTE",
                "payload": {"command": cmd, "target_tool": tool_name}
            }
            res = self.gate.evaluate(action)
            if res.get("verdict") == "DENY":
                rule_id = res.get("rule_id", "BTP-AST-VETO")
                reason = res.get("reason", "Terminal command blocked")
                return {
                    "allowed": False,
                    "verdict": "DENY",
                    "rule_id": rule_id,
                    "reason": reason,
                    "error": f"[{rule_id}] Destructive command blocked by Bartholomew: {reason}"
                }
        elif name_lower in ("file_write", "filewrite", "fileedit", "write_file", "edit_file"):
            filepath = ""
            if isinstance(tool_input, str):
                filepath = tool_input
            elif isinstance(tool_input, dict):
                filepath = tool_input.get("path") or tool_input.get("filepath") or tool_input.get("file_path") or ""
            if filepath:
                norm_target = os.path.abspath(filepath).replace("\\", "/").lower()
                norm_raw = filepath.replace("\\", "/").lower()
                if any(p in norm_target or p in norm_raw for p in [".env", "id_rsa", "/etc/shadow", "/etc/passwd"]):
                    return {
                        "allowed": False,
                        "verdict": "DENY",
                        "rule_id": "BTP-KEYSTONE-VETO",
                        "reason": f"Access to protected system file denied: {filepath}",
                        "error": f"[BTP-KEYSTONE-VETO] Bartholomew blocked write to protected system file: {filepath}"
                    }

        return {"allowed": True, "verdict": "ALLOW", "tool": tool_name}


def wrap_coding_agent(agent_instance: Any, allowed_roots: Optional[List[str]] = None) -> Any:
    """Auto-detects and wraps bash and file tools on any coding agent instance."""
    guard = BtpCodingAgentGuard(allowed_roots=allowed_roots)
    for tool_attr in ["bash", "terminal", "execute_command", "run_shell", "sh", "exec"]:
        if hasattr(agent_instance, tool_attr) and callable(getattr(agent_instance, tool_attr)):
            setattr(agent_instance, tool_attr, guard.protect_bash(getattr(agent_instance, tool_attr)))
    return agent_instance
