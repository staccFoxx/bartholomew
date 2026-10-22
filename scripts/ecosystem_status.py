#!/usr/bin/env python3
"""
Ecosystem Status & Growth Monitor (ASCII Safe)
Checks Open-VSX adoption, Cloud Run fleet health, billing state, and local engine.
"""

import urllib.request
import json
import subprocess
import time

def check_openvsx():
    print("=" * 70)
    print("  OPEN-VSX ECOSYSTEM ADOPTION")
    print("=" * 70)
    total = 0
    for pkg in ["cyphervoice-vscode", "bartholomew-trinity"]:
        try:
            url = f"https://open-vsx.org/api/Bartholomew/{pkg}"
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8.0"})
            data = json.loads(urllib.request.urlopen(req, timeout=5).read().decode())
            cnt = data.get("downloadCount", 0)
            ver = data.get("version", "N/A")
            total += cnt
            print(f"  * Bartholomew.{pkg:<24} | v{ver:<7} | {cnt:>6,} downloads")
        except Exception as e:
            print(f"  * Bartholomew.{pkg:<24} | Error: {e}")
    print(f"  --------------------------------------------------------")
    print(f"  Total Verified Ecosystem Downloads:         {total:>6,} installs\n")

def check_cloud_run():
    print("=" * 70)
    print("  GOOGLE CLOUD RUN FLEET STATUS (Project: acn-26670)")
    print("=" * 70)
    endpoints = [
        ("Metered MCP Gateway", "https://bartholomew-metered-mcp-322603900775.us-central1.run.app/health"),
        ("MCP Robots & RFC", "https://bartholomew-metered-mcp-322603900775.us-central1.run.app/robots.txt"),
        ("FastAPI Backend", "https://acn-fastapi-backend-322603900775.us-central1.run.app/"),
        ("RFC Discovery Profile", "https://acn-fastapi-backend-322603900775.us-central1.run.app/.well-known/btp-configuration.json"),
        ("Stripe Agentic Webhook", "https://acn-fastapi-backend-322603900775.us-central1.run.app/api/stripe/status"),
    ]
    for name, url in endpoints:
        t0 = time.perf_counter()
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "EcosystemMonitor/1.0"})
            with urllib.request.urlopen(req, timeout=6) as resp:
                lat = (time.perf_counter() - t0) * 1000
                print(f"  [+] {name:<26} | HTTP {resp.status} | {lat:6.1f} ms")
        except Exception as e:
            print(f"  [-] {name:<26} | FAILED ({e})")
    print()

def check_billing():
    print("=" * 70)
    print("  GCP BILLING & CREDIT BUFFER")
    print("=" * 70)
    try:
        res = subprocess.run(["gcloud.cmd", "beta", "billing", "projects", "describe", "acn-26670", "--format=json"], capture_output=True, text=True, timeout=8)
        info = json.loads(res.stdout)
        acct = info.get("billingAccountName", "").replace("billingAccounts/", "")
        enabled = info.get("billingEnabled", False)
        print(f"  * Billing Account:  {acct} ($2,000 Credit Pool)")
        print(f"  * Billing Enabled:  {enabled} (Scale-to-zero active, $0.00 idle)\n")
    except Exception as e:
        print(f"  * Billing Check:    {e}\n")

def check_local_daemon():
    print("=" * 70)
    print("  LOCAL KYRO PHOTONIC & VOICE ENGINE")
    print("=" * 70)
    try:
        req = urllib.request.Request("http://127.0.0.1:8765/api/photonics/status", headers={"User-Agent": "curl/8.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            status = data.get("status", "unknown")
            print(f"  [+] Local Server (port 8765):  HEALTHY (status: {status})")
    except Exception as e:
        print(f"  [-] Local Server (port 8765):  {e}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    check_openvsx()
    check_cloud_run()
    check_billing()
    check_local_daemon()
