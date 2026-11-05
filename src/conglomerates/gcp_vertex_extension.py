"""
Bartholomew Google Cloud Vertex AI Extension & Agent Builder Adapter
Provides OpenAPI 3.0 manifest and runtime proxy for Vertex AI Agent Builder,
BigQuery Data Agent Kit, and Gemini 1.5/2.0 context optimization.
Support contact: help@bartholomew.info
"""

import json
from typing import Dict, Any

VERTEX_EXTENSION_OPENAPI_SPEC = {
    "openapi": "3.0.3",
    "info": {
        "title": "Bartholomew Guardrail & Token Optimization Extension for Vertex AI",
        "description": "Deterministic safety gate and quadratic context token eviction for Google Cloud Vertex AI agents.",
        "version": "7.0.0",
        "contact": {
            "name": "Bartholomew Enterprise Support",
            "email": "help@bartholomew.info",
            "url": "https://bartholomew.info/docs.html"
        }
    },
    "servers": [
        {
            "url": "https://proxy.bartholomew.info/v1/vertex",
            "description": "Production Cloudflare-fronted Bartholomew Gateway"
        }
    ],
    "paths": {
        "/sanitize": {
            "post": {
                "summary": "Sanitize Agent Payload & Enforce PCI/FIM Invariants",
                "operationId": "sanitizeAgentPayload",
                "requestBody": {
                    "required": True,
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "prompt": {"type": "string"},
                                    "agent_id": {"type": "string"}
                                },
                                "required": ["prompt"]
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Payload sanitized and invariant certified",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "sanitized_prompt": {"type": "string"},
                                        "tokens_evicted": {"type": "integer"},
                                        "ed25519_receipt": {"type": "string"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}


def export_vertex_extension_spec(output_path: str):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(VERTEX_EXTENSION_OPENAPI_SPEC, f, indent=2)
    return VERTEX_EXTENSION_OPENAPI_SPEC
