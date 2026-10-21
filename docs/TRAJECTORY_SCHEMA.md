# Canonical Trajectory Schema (v1.0)

**Last Updated:** 2026-08-08  
**Status:** STABLE

---

## Overview

The **Trajectory Schema** defines the canonical format for AI agent execution logs submitted to Bartholomew for security scanning. All SDKs, integrations, and API clients MUST comply with this schema.

## Root Schema

```json
{
  "agent_name": "string (1-256 chars)",
  "agent_version": "string (semantic versioning)",
  "task_id": "string (UUID format)",
  "session_id": "string (UUID format)",
  "environment": "production | staging | development",
  "steps": [
    { TrajectoryStep }
  ],
  "metadata": {
    "start_time": "ISO-8601 UTC timestamp",
    "end_time": "ISO-8601 UTC timestamp",
    "total_duration_ms": "integer (milliseconds)",
    "token_count": "integer (estimated)",
    "model": "string (e.g., 'gpt-4', 'claude-3-sonnet')",
    "custom_fields": "object (user-defined, max 10 fields)"
  },
  "scan_options": {
    "mask_credentials": "boolean (default: true)",
    "severity_threshold": "CRITICAL | HIGH | MEDIUM | LOW | INFO (default: MEDIUM)",
    "fail_on_violations": "boolean (default: false)"
  }
}
```

## TrajectoryStep Schema

```json
{
  "step_index": "integer (0-based indexing)",
  "type": "thought | tool_call | tool_result | agent_output | error | state_change",
  "timestamp": "ISO-8601 UTC timestamp (optional but recommended)",
  "tool_name": "string (required if type='tool_call')",
  "tool_input": {
    "[key: string]": "any (user-defined arguments)"
  },
  "tool_output": {
    "[key: string]": "any (optional, tool result data)"
  },
  "content": "string (primary log message or thought)",
  "model": "string (optional, LLM model used at this step)",
  "tokens_used": {
    "input": "integer (optional)",
    "output": "integer (optional)"
  },
  "error": {
    "type": "string (e.g., 'TimeoutError', 'APIError')",
    "message": "string",
    "stack_trace": "string (optional)"
  },
  "confidence_score": "number 0.0-1.0 (optional, agent's confidence)",
  "custom_fields": "object (user-defined, max 5 fields)"
}
```

## Field Definitions

### Root Level

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `agent_name` | string | ✅ | Unique identifier for the agent. Used for audit trails. |
| `agent_version` | string | ✅ | Semantic version (e.g., `1.2.3`). Enables version tracking. |
| `task_id` | string | ✅ | UUID of the high-level task. Enables correlation. |
| `session_id` | string | ✅ | UUID of this execution session. Unique per run. |
| `environment` | enum | ✅ | Deployment environment tag. |
| `steps` | array | ✅ | Array of 1–10,000 TrajectoryStep objects. |
| `metadata` | object | ✅ | Execution context and performance metrics. |
| `scan_options` | object | ❌ | Scanning preferences (defaults applied if omitted). |

### TrajectoryStep Level

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `step_index` | integer | ✅ | Zero-based index. Must be sequential. |
| `type` | enum | ✅ | Step classification. |
| `timestamp` | string | ❌ | RFC-3339 format. Recommended for audit. |
| `tool_name` | string | 🟡 | Required if `type='tool_call'`. |
| `tool_input` | object | ❌ | Arbitrary key-value pairs. No size limit enforced at schema level. |
| `tool_output` | object | ❌ | Tool result data (optional, for rich context). |
| `content` | string | ✅ | Primary message (thought, error, output). Max 100,000 chars. |
| `model` | string | ❌ | Model identifier if step invoked an LLM. |
| `tokens_used` | object | ❌ | For cost accounting and performance analysis. |
| `error` | object | ❌ | Present if step failed. Includes type, message, trace. |
| `confidence_score` | number | ❌ | Agent's self-reported confidence (0.0–1.0). |
| `custom_fields` | object | ❌ | User-defined extensions (max 5 fields). |

## Validation Rules

### Mandatory Constraints

1. **UUID Format:** `task_id` and `session_id` must be RFC-4122 compliant.
2. **Timestamp Format:** All timestamps must be ISO-8601 UTC (e.g., `2026-08-08T14:30:45.123Z`).
3. **Step Index Sequencing:** Step indices must be sequential starting at 0, with no gaps.
4. **Step Count:** A trajectory must contain 1–10,000 steps.
5. **Content Length:** Each step's `content` field must be 1–100,000 characters.
6. **Enum Values:** `type`, `environment`, `severity_threshold` must match allowed values.

### Security Constraints

- **Credential Detection:** Bartholomew scans `content`, `tool_input`, and `tool_output` for exposed credentials.
- **Masking:** If `scan_options.mask_credentials=true`, results will have credentials redacted.
- **Sensitive Fields:** Do NOT include plaintext secrets in custom_fields; Bartholomew will flag them as violations.

## Example: Complete Trajectory

```json
{
  "agent_name": "FinancialAdvisor-v2",
  "agent_version": "2.1.0",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "session_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "environment": "production",
  "steps": [
    {
      "step_index": 0,
      "type": "thought",
      "timestamp": "2026-08-08T14:30:45.100Z",
      "content": "User asked for investment recommendations. I should retrieve their portfolio first.",
      "confidence_score": 0.95
    },
    {
      "step_index": 1,
      "type": "tool_call",
      "timestamp": "2026-08-08T14:30:45.200Z",
      "tool_name": "fetch_portfolio",
      "tool_input": {
        "user_id": "usr_12345",
        "include_historical": true
      },
      "tool_output": {
        "status": "success",
        "holdings": [{"symbol": "AAPL", "qty": 100}]
      }
    },
    {
      "step_index": 2,
      "type": "thought",
      "timestamp": "2026-08-08T14:30:45.300Z",
      "content": "Portfolio retrieved. User has tech-heavy allocation. I'll recommend diversification.",
      "model": "gpt-4",
      "tokens_used": {"input": 150, "output": 75}
    },
    {
      "step_index": 3,
      "type": "agent_output",
      "timestamp": "2026-08-08T14:30:45.400Z",
      "content": "Based on your portfolio, I recommend reallocating 20% to fixed income and 10% to international equities."
    }
  ],
  "metadata": {
    "start_time": "2026-08-08T14:30:45.100Z",
    "end_time": "2026-08-08T14:30:47.400Z",
    "total_duration_ms": 2300,
    "token_count": 225,
    "model": "gpt-4",
    "custom_fields": {
      "customer_segment": "enterprise"
    }
  },
  "scan_options": {
    "mask_credentials": true,
    "severity_threshold": "MEDIUM",
    "fail_on_violations": true
  }
}
```

## Migration Guide

### From Unstructured Logs

If you have agent logs in a custom format, follow this mapping:

1. **Parse timestamp** from log line → `step_index` + `timestamp`
2. **Classify line** (thought/tool/error) → `type`
3. **Extract tool name** if present → `tool_name`
4. **Extract arguments** if present → `tool_input`
5. **Extract result** if present → `tool_output`
6. **Wrap content** (original log message) → `content`

### From Langchain Agent Format

```python
from langchain.callbacks import BaseCallbackHandler
from bartholomew.integrations.langchain_agent import LangchainToTrajectoryConverter

converter = LangchainToTrajectoryConverter(agent_name="MyAgent", agent_version="1.0.0")
agent.callbacks = [converter]
# On agent completion:
trajectory = converter.to_trajectory()  # Returns canonical Trajectory object
```

### From CrewAI Task Format

```python
from bartholomew.integrations.crewai_agent import CrewAIToTrajectoryConverter

converter = CrewAIToTrajectoryConverter(task=my_task)
trajectory = converter.to_trajectory()  # Returns canonical Trajectory object
```

## API Endpoint Reference

### POST `/api/v1/scan-trajectory`

**Request Body:** Trajectory object (this schema)  
**Response:** TrajectoryScanResponse with OWASP violations + SHA-256 attestation

### POST `/api/v1/batch-scan`

**Request Body:**
```json
{
  "trajectories": [ Trajectory, Trajectory, ... ]
}
```

**Response:** Array of TrajectoryScanResponse objects

---

## Version History

| Version | Date | Changes |
|---------|------|----------|
| 1.0 | 2026-08-08 | Initial stable release |

---

## Questions?

Contact: `security@acn-network.org`  
Docs: `https://docs.acn-network.org/trajectory-schema`
