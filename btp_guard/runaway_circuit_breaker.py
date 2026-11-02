"""
Bartholomew Sentinel Runaway Loop & Spend Circuit Breaker (BTP v7.0.0)
======================================================================
Deterministic real-time governor that prevents AI coding agents from:
  1. Burning excessive API tokens in runaway retry loops.
  2. Repeating the same failing command or tool invocation (>3 times).
  3. Hallucinating recursive edits on failing tests without human guidance.
  4. Exceeding developer-defined per-session spend or turn budgets.
"""

import time
import hashlib
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field, asdict


@dataclass
class TurnRecord:
    turn_index: int
    tool_name: str
    args_hash: str
    error_signature: Optional[str]
    cost_usd: float
    timestamp: float


@dataclass
class CircuitBreakerStatus:
    tripped: bool
    reason: Optional[str]
    category: Optional[str]  # SPEND_LIMIT, REPEATED_FAILURES, RECURSIVE_LOOP, TURN_LIMIT
    consecutive_repetitions: int
    cumulative_spend_usd: float
    recommended_action: str
    suggest_rollback: bool


class RunawayCircuitBreaker:
    """
    In-memory process governor evaluating autonomous agent trajectories in real-time.
    Trips deterministic interdictions before runaway spend burns developer wallets.
    """

    def __init__(
        self,
        max_turns_per_task: int = 30,
        max_spend_usd: float = 2.50,
        max_identical_tool_calls: int = 3,
        max_identical_errors: int = 3
    ):
        self.max_turns_per_task = max_turns_per_task
        self.max_spend_usd = max_spend_usd
        self.max_identical_tool_calls = max_identical_tool_calls
        self.max_identical_errors = max_identical_errors

        self.history: List[TurnRecord] = []
        self.cumulative_spend: float = 0.0

    def record_turn(
        self,
        tool_name: str,
        tool_args: Any,
        error_output: Optional[str] = None,
        cost_usd: float = 0.02
    ) -> CircuitBreakerStatus:
        """
        Records an agent turn and evaluates whether loop invariants have been breached.
        """
        args_str = str(tool_args)
        args_hash = hashlib.sha256(args_str.encode("utf-8")).hexdigest()[:12]

        error_sig = None
        if error_output:
            # Normalize error output to capture root pattern (ignore variable timestamps/memory addresses)
            normalized = "".join([c for c in error_output.lower() if c.isalnum() or c.isspace()])
            error_sig = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:12]

        self.cumulative_spend += cost_usd
        turn_index = len(self.history) + 1

        record = TurnRecord(
            turn_index=turn_index,
            tool_name=tool_name,
            args_hash=args_hash,
            error_signature=error_sig,
            cost_usd=cost_usd,
            timestamp=time.time()
        )
        self.history.append(record)

        # 1. Check Spend Limit
        if self.cumulative_spend >= self.max_spend_usd:
            return CircuitBreakerStatus(
                tripped=True,
                reason=f"Cumulative task spend (${self.cumulative_spend:.2f}) exceeded hard ceiling (${self.max_spend_usd:.2f}).",
                category="SPEND_LIMIT",
                consecutive_repetitions=0,
                cumulative_spend_usd=round(self.cumulative_spend, 4),
                recommended_action="Pause autonomous agent execution. Review intermediate edits before authoring further turns.",
                suggest_rollback=False
            )

        # 2. Check Turn Count Limit
        if turn_index >= self.max_turns_per_task:
            return CircuitBreakerStatus(
                tripped=True,
                reason=f"Agent exceeded maximum allowed autonomous turns ({self.max_turns_per_task}) without task completion.",
                category="TURN_LIMIT",
                consecutive_repetitions=0,
                cumulative_spend_usd=round(self.cumulative_spend, 4),
                recommended_action="Require human sign-off before proceeding.",
                suggest_rollback=False
            )

        # 3. Check Repeated Identical Tool Invocations
        if len(self.history) >= self.max_identical_tool_calls:
            recent_turns = self.history[-self.max_identical_tool_calls:]
            same_tool_and_args = all(
                t.tool_name == tool_name and t.args_hash == args_hash for t in recent_turns
            )
            if same_tool_and_args:
                return CircuitBreakerStatus(
                    tripped=True,
                    reason=f"Agent invoked identical tool '{tool_name}' with identical arguments {self.max_identical_tool_calls} times consecutively without making progress.",
                    category="RECURSIVE_LOOP",
                    consecutive_repetitions=self.max_identical_tool_calls,
                    cumulative_spend_usd=round(self.cumulative_spend, 4),
                    recommended_action="Veto tool re-execution. Intervene with revised instructions or roll back to pre-loop state.",
                    suggest_rollback=True
                )

        # 4. Check Repeated Error Signatures
        if error_sig and len(self.history) >= self.max_identical_errors:
            recent_errors = [t.error_signature for t in self.history[-self.max_identical_errors:]]
            if all(sig == error_sig for sig in recent_errors):
                return CircuitBreakerStatus(
                    tripped=True,
                    reason=f"Agent encountered the identical failure signature across {self.max_identical_errors} consecutive attempts.",
                    category="REPEATED_FAILURES",
                    consecutive_repetitions=self.max_identical_errors,
                    cumulative_spend_usd=round(self.cumulative_spend, 4),
                    recommended_action="Halt loop. Provide human clarification or rollback file modifications.",
                    suggest_rollback=True
                )

        return CircuitBreakerStatus(
            tripped=False,
            reason=None,
            category=None,
            consecutive_repetitions=0,
            cumulative_spend_usd=round(self.cumulative_spend, 4),
            recommended_action="Proceed",
            suggest_rollback=False
        )

    def reset(self):
        """Resets the circuit breaker tracking for a new user task."""
        self.history.clear()
        self.cumulative_spend = 0.0
