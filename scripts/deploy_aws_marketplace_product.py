"""
Bartholomew Sentinel - AWS Marketplace SaaS Product Deployment Script
=====================================================================
Automates product creation and change-set submission to AWS Marketplace
Catalog API for Account 411109262830.

Usage:
    python scripts/deploy_aws_marketplace_product.py
"""

import subprocess
import json
import sys

def deploy_product():
    print("=" * 75)
    print("  BARTHOLOMEW SENTINEL: AWS MARKETPLACE SAAS PRODUCT DEPLOYER")
    print("=" * 75)

    change_set = [
        {
            "ChangeType": "CreateProduct",
            "Entity": {
                "Type": "SaaSProduct@1.0"
            },
            "Details": json.dumps({
                "ProductTitle": "Bartholomew Sentinel - Autonomous Agent AST Security & Invariant Gate",
                "ShortDescription": "Sub-35µs in-process AST invariant gate, secret vault scrubber, and cryptographic Ed25519 Merkle receipts for autonomous AI agent fleets.",
                "LongDescription": (
                    "Bartholomew Sentinel delivers deterministic Agentic Runtime Protection (ARP) "
                    "for enterprise AI engineering teams deploying autonomous agents (Cursor, Claude Code, "
                    "Windsurf, CrewAI, Amazon Nova Act). Operating entirely in-process on developer workstations "
                    "or runtime containers, Bartholomew intercepts destructive bash commands, database mutations, "
                    "and credential exfiltrations in under 35 microseconds, providing verifiable SOC 2 Type II "
                    "Merkle audit trails with zero cloud latency."
                ),
                "FulfillmentUrl": "https://bartholomew.info/marketplace/register",
                "TechnicalInformation": "Integrates via in-process Node/Python middleware, CLI shim, or Model Context Protocol (MCP) gateway.",
                "SupportDescription": "24/7 Enterprise Support via portal at https://bartholomew.info and enterprise@bartholomew.info",
                "Categories": [
                    "Security",
                    "Developer Tools",
                    "Artificial Intelligence"
                ]
            })
        }
    ]

    cmd = [
        "aws", "marketplace-catalog", "start-change-set",
        "--catalog", "AWSMarketplace",
        "--change-set", json.dumps(change_set)
    ]

    print("[*] Submitting CreateProduct ChangeSet to AWS Marketplace Catalog API...")
    res = subprocess.run(cmd, capture_output=True, text=True)

    if res.returncode == 0:
        data = json.loads(res.stdout)
        print("\n[+] SUCCESS! ChangeSet Initiated on AWS Marketplace:")
        print(f"    ChangeSet ID : {data.get('ChangeSetId')}")
        print(f"    ChangeSet ARN: {data.get('ChangeSetArn')}")
        print("    Track status at: https://aws.amazon.com/marketplace/management/")
    else:
        err = res.stderr
        print("\n[*] AWS API Response:")
        print(err)
        if "requires AWS Marketplace registration and a public profile" in err:
            print("-" * 75)
            print("[ACTION REQUIRED TO COMPLETE ACTIVATION]")
            print("AWS Account 411109262830 is authenticated, but needs a 2-minute seller profile setup:")
            print("1. Click: https://aws.amazon.com/marketplace/management/tour")
            print("2. Enter your Company Name (Autonomous Circularity Labs / Bartholomew) and bank payout details.")
            print("3. Re-run: python scripts/deploy_aws_marketplace_product.py to publish the SaaS listing!")
            print("-" * 75)

if __name__ == "__main__":
    deploy_product()
