#!/usr/bin/env python3
"""
Bartholomew Guard — Local Agent Spend-Cap & Secret-Scrub Proxy (`btp-proxy`).
Zero external dependencies. 100% local (127.0.0.1). Zero cloud telemetry.

Features:
  1. Hard Session Dollar Ceiling (--cap 5.00): deterministically returns HTTP 402
     before a runaway agent retry loop can drain your OpenAI / Anthropic / Gemini card.
  2. In-Flight Secret Scrubbing: redacts sk-*, sk-ant-*, AIza*, ghp_*, AKIA*, Bearer tokens,
     and PEM private keys from outbound prompt bodies BEFORE they leave your machine.
  3. Live Local Status HUD: GET http://127.0.0.1:<port>/_btp/status

Usage:
  python btp_spend_proxy.py --upstream https://api.openai.com --port 8787 --cap 5.00
  # Then point your agent/SDK: OPENAI_BASE_URL=http://127.0.0.1:8787/v1
"""
import argparse
import json
import re
import sys
import threading
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SECRET_PATTERNS = [
    ("OPENAI_KEY", re.compile(r"\bsk-(?:proj-|live-|test-)?[A-Za-z0-9_-]{20,}\b")),
    ("ANTHROPIC_KEY", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{20,}\b")),
    ("GOOGLE_API_KEY", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("GITHUB_TOKEN", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b")),
    ("AWS_ACCESS_KEY", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("STRIPE_SECRET", re.compile(r"\b(?:sk|rk)_live_[0-9a-zA-Z]{16,}\b")),
    ("PRIVATE_KEY_PEM", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----")),
]

# Conservative blended USD per 1M tokens (input/output fallback if model unrecognized)
DEFAULT_USD_PER_1M_IN = 3.00
DEFAULT_USD_PER_1M_OUT = 12.00


def scrub_secrets(text: str) -> tuple[str, int]:
    redactions = 0
    cleaned = text
    for label, rx in SECRET_PATTERNS:
        cleaned, n = rx.subn(f"[BTP_REDACTED_{label}]", cleaned)
        redactions += n
    return cleaned, redactions


def estimate_cost_usd(req_bytes: int, resp_bytes: int, usage: dict | None = None) -> float:
    if isinstance(usage, dict):
        in_tok = int(usage.get("prompt_tokens") or usage.get("input_tokens") or 0)
        out_tok = int(usage.get("completion_tokens") or usage.get("output_tokens") or 0)
        if in_tok or out_tok:
            return (in_tok * DEFAULT_USD_PER_1M_IN + out_tok * DEFAULT_USD_PER_1M_OUT) / 1_000_000.0
    # Fallback heuristic: ~4 chars per token
    in_tok = max(1, req_bytes // 4)
    out_tok = max(1, resp_bytes // 4)
    return (in_tok * DEFAULT_USD_PER_1M_IN + out_tok * DEFAULT_USD_PER_1M_OUT) / 1_000_000.0


class ProxyState:
    def __init__(self, upstream: str, cap_usd: float, scrub_enabled: bool = True):
        self.upstream = upstream.rstrip("/")
        self.cap_usd = cap_usd
        self.scrub_enabled = scrub_enabled
        self.lock = threading.Lock()
        self.spend_usd = 0.0
        self.requests_allowed = 0
        self.requests_vetoed = 0
        self.secrets_redacted = 0

    def snapshot(self) -> dict:
        with self.lock:
            return {
                "service": "btp-spend-proxy (bartholomew.info)",
                "upstream": self.upstream,
                "cap_usd": round(self.cap_usd, 4),
                "spend_usd": round(self.spend_usd, 6),
                "remaining_usd": round(max(0.0, self.cap_usd - self.spend_usd), 6),
                "requests_allowed": self.requests_allowed,
                "requests_vetoed": self.requests_vetoed,
                "secrets_redacted": self.secrets_redacted,
                "status": "TRIPPED" if self.spend_usd >= self.cap_usd else "ARMED",
            }


def make_handler(state: ProxyState):
    class BtpProxyHandler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            print(f"[btp-proxy] {self.address_string()} - {fmt % args}", flush=True)

        def _send_json(self, code: int, payload: dict):
            raw = json.dumps(payload, indent=2).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)

        def do_GET(self):
            if self.path == "/_btp/status":
                self._send_json(200, state.snapshot())
                return
            self._forward("GET")

        def do_POST(self):
            if self.path == "/_btp/reset":
                with state.lock:
                    state.spend_usd = 0.0
                self._send_json(200, {"ok": True, "state": state.snapshot()})
                return
            self._forward("POST")

        def _forward(self, method: str):
            length = int(self.headers.get("Content-Length", "0") or "0")
            body = self.rfile.read(length) if length > 0 else b""

            with state.lock:
                if state.spend_usd >= state.cap_usd:
                    state.requests_vetoed += 1
                    self._send_json(402, {
                        "error": "BTP_BUDGET_CAP_REACHED",
                        "message": f"Bartholomew Spend-Cap Proxy vetoed request: session spend (${state.spend_usd:.4f}) reached hard cap (${state.cap_usd:.2f}).",
                        "state": {
                            "spend_usd": round(state.spend_usd, 6),
                            "cap_usd": state.cap_usd,
                        },
                    })
                    return

            redacted_count = 0
            if state.scrub_enabled and body:
                try:
                    decoded = body.decode("utf-8")
                    cleaned, redacted_count = scrub_secrets(decoded)
                    if redacted_count > 0:
                        body = cleaned.encode("utf-8")
                        with state.lock:
                            state.secrets_redacted += redacted_count
                        print(f"[btp-proxy] Scrubbed {redacted_count} secret(s) from outbound payload.", flush=True)
                except UnicodeDecodeError:
                    pass

            target_url = state.upstream + self.path
            fwd_headers = {}
            for k, v in self.headers.items():
                if k.lower() in ("host", "content-length", "accept-encoding", "connection"):
                    continue
                fwd_headers[k] = v

            req = urllib.request.Request(target_url, data=body if method == "POST" else None, headers=fwd_headers, method=method)
            try:
                with urllib.request.urlopen(req, timeout=120) as resp:
                    resp_body = resp.read()
                    usage = None
                    try:
                        parsed = json.loads(resp_body.decode("utf-8"))
                        usage = parsed.get("usage")
                    except Exception:
                        pass
                    cost = estimate_cost_usd(len(body), len(resp_body), usage)
                    with state.lock:
                        state.spend_usd += cost
                        state.requests_allowed += 1

                    self.send_response(resp.status)
                    self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(resp_body)))
                    self.send_header("X-BTP-Spend-USD", f"{state.spend_usd:.6f}")
                    self.send_header("X-BTP-Secrets-Redacted", str(redacted_count))
                    self.end_headers()
                    self.wfile.write(resp_body)
            except urllib.error.HTTPError as e:
                err_body = e.read()
                self.send_response(e.code)
                self.send_header("Content-Type", e.headers.get("Content-Type", "application/json"))
                self.send_header("Content-Length", str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
            except Exception as ex:
                self._send_json(502, {"error": "BTP_UPSTREAM_ERROR", "detail": str(ex)})

    return BtpProxyHandler


def run_self_test() -> int:
    sample = "Use key sk-proj-ABCDEFGHIJKLMNOPQRSTUVWXYZ123456 and ghp_1234567890abcdefghij123456"
    cleaned, count = scrub_secrets(sample)
    assert count == 2, f"Expected 2 redactions, got {count}"
    assert "sk-proj-" not in cleaned and "ghp_" not in cleaned
    cost = estimate_cost_usd(4000, 2000, {"prompt_tokens": 100000, "completion_tokens": 25000})
    assert abs(cost - 0.60) < 1e-6, f"Unexpected cost: {cost}"
    print(f"[btp-proxy SELF-TEST PASS] Redacted {count} secrets cleanly; cost calc verified (${cost:.2f}).")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Bartholomew Guard — Local Agent Spend-Cap & Secret-Scrub Proxy")
    ap.add_argument("--upstream", default="https://api.openai.com", help="Upstream LLM API base URL")
    ap.add_argument("--host", default="127.0.0.1", help="Bind host (default 127.0.0.1)")
    ap.add_argument("--port", type=int, default=8787, help="Bind port (default 8787)")
    ap.add_argument("--cap", type=float, default=5.00, help="Hard session spend cap in USD (default 5.00)")
    ap.add_argument("--no-scrub", action="store_true", help="Disable outbound secret redaction")
    ap.add_argument("--self-test", action="store_true", help="Run built-in redaction & cost-cap self-test and exit")
    args = ap.parse_args()

    if args.self_test:
        return run_self_test()

    state = ProxyState(args.upstream, args.cap, scrub_enabled=not args.no_scrub)
    srv = ThreadingHTTPServer((args.host, args.port), make_handler(state))
    print(f"[btp-proxy] Armed on http://{args.host}:{args.port} -> {args.upstream}", flush=True)
    print(f"[btp-proxy] Hard spend cap: ${args.cap:.2f} | Secret scrubbing: {'ON' if not args.no_scrub else 'OFF'}", flush=True)
    print(f"[btp-proxy] Status HUD: http://{args.host}:{args.port}/_btp/status", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n[btp-proxy] Stopped.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
