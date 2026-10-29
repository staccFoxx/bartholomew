"""
Bartholomew Trust Protocol (BTP v5.4.24) - Agentic Runtime Protection (ARP)
=============================================================================
High-performance execution guardrails, AST validation, and cryptographic audit receipts
for autonomous AI agents (LangChain, CrewAI, AutoGen, Claude Code, Cursor, Windsurf).
"""

import sys
import os

_pkg_dir = os.path.dirname(os.path.abspath(__file__))
_repo_root = os.path.dirname(_pkg_dir)
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

# Standard submodules using relative imports
from .authorization_gate import AuthorizationGate
from .ledger import BillableLedger
from .policy import Policy
from .stripe_bridge import StripeMeterBridge
from .telemetry import TelemetryEmitter
from .btp_guard import WireGuard


# Canonical unified Guard
from src import Guard

from src.agent_protector import protect_agent
from src import (
    Guard,
    wrap_client,
    BartholomewTrustAuthority,
    IndependentTrustVerifier,
    DeclarativePolicyEngine,
    MarginalUtilityTracker,
    secure_tool,
    SecurityVetoException,
    SecurityVetoException as BTPViolationError,
    guard
)
from src.polyglot_ast_validator import PolyglotASTValidator
from src.ast_validator import ASTSecurityValidator
from src.secret_masker import SecretVaultMasker
from src.usage_tracker import load_license, save_license, record_evaluation, STRIPE_PRO_URL, STRIPE_ENTERPRISE_URL
from .integrations.stripe_agent import BtpStripeAgentGuard, wrap_stripe
from .integrations.universal_pay import BtpUniversalPayGuard, PaymentProvider, wrap_payment
from .integrations.grok import BtpGrokGuard, wrap_grok
from .warranty_service import WarrantyFundManager
from .mcp_clearinghouse import MCPClearinghouseGateway
from .webhook_dispatcher import WebhookDispatcher, WebhookChannel, AlertSeverity
from .redteam import RedTeamScanner
from .agent_passport import AgentPassport, AgentPassportAuthority
from .hitl_gate import HITLApprovalGate, HITLEscalationRequiredException
from .integrations.m2m_toll import BtpM2MMicroToll
from . import integrations
from .project_immunizer import (
    immunize_project,
    evaluate_workspace_security,
    get_model_context_prompt,
)

# Aliases for convenience
BondedAgentWarrantyFund = WarrantyFundManager
MCPClearinghouse = MCPClearinghouseGateway
RedTeamHarness = RedTeamScanner
protect = secure_tool

def scrub_secrets(text_or_data):
    """Convenience helper for in-flight credential masking."""
    masker = SecretVaultMasker()
    if isinstance(text_or_data, str):
        masked, _, _ = SecretVaultMasker.mask_text(text_or_data)
        return masked
    return masker.mask_dict(text_or_data)

__version__ = "6.6.8"

__all__ = [
    "Guard",
    "WarrantyFundManager",
    "BondedAgentWarrantyFund",
    "MCPClearinghouseGateway",
    "MCPClearinghouse",
    "WebhookDispatcher",
    "WebhookChannel",
    "AlertSeverity",
    "RedTeamScanner",
    "RedTeamHarness",
    "protect_agent",
    "secure_tool",
    "SecurityVetoException",
    "BTPViolationError",
    "wrap_client",
    "guard",
    "BartholomewTrustAuthority",
    "IndependentTrustVerifier",
    "DeclarativePolicyEngine",
    "MarginalUtilityTracker",
    "PolyglotASTValidator",
    "ASTSecurityValidator",
    "SecretVaultMasker",
    "load_license",
    "save_license",
    "record_evaluation",
    "STRIPE_PRO_URL",
    "STRIPE_ENTERPRISE_URL",
    "AuthorizationGate",
    "BillableLedger",
    "Policy",
    "StripeMeterBridge",
    "TelemetryEmitter",
    "WireGuard",
    "integrations",
    "BtpStripeAgentGuard",
    "wrap_stripe",
    "BtpUniversalPayGuard",
    "PaymentProvider",
    "wrap_payment",
    "BtpGrokGuard",
    "wrap_grok",
    "AgentPassport",
    "AgentPassportAuthority",
    "HITLApprovalGate",
    "HITLEscalationRequiredException",
    "BtpM2MMicroToll",
    "immunize_project",
    "evaluate_workspace_security",
    "get_model_context_prompt",
    "__version__",
]
