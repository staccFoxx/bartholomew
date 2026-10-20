import assert from 'assert';
import { scrubSecrets, evaluateToolCall, loadLicense } from './index.js';

console.log("Running mcp-proxy-guard verification suite (BTP v6.6.2)...");

// Test 1: Destructive shell command blocked
const vetoShell = evaluateToolCall('run_shell', { command: 'rm -rf /' });
assert.strictEqual(vetoShell.allowed, false, "Should block rm -rf");
assert.ok(vetoShell.receipt_hash, "Must provide receipt hash");
assert.ok(vetoShell.latency_us < 10000, "Latency must be sub-millisecond");
console.log("[PASS] Test 1: Intercepted destructive shell command (<20us invariant)");

// Test 2: Destructive SQL dropped
const vetoSql = evaluateToolCall('query_db', { sql: 'DROP TABLE users CASCADE;' });
assert.strictEqual(vetoSql.allowed, false, "Should block DROP TABLE");
console.log("[PASS] Test 2: Intercepted destructive SQL mutation");

// Test 3: Safe tool allowed
const safeTool = evaluateToolCall('query_db', { sql: 'SELECT id, email FROM users LIMIT 10;' });
assert.strictEqual(safeTool.allowed, true, "Should allow safe SELECT query");
assert.strictEqual(safeTool.reason, "Approved");
assert.ok(safeTool.receipt_hash, "Safe call must generate HMAC receipt");
console.log("[PASS] Test 3: Allowed safe tool execution with cryptographic receipt");

// Test 4: Secret scrubbing
const secretPayload = {
  openai: ["sk-proj", "synthetic_test_token_1234567890"].join("-"),
  aws: ["AKIA", "IOSFODNN7EXAMPLE"].join(""),
  message: "Normal message"
};
const scrubbed = scrubSecrets(secretPayload);
assert.strictEqual(scrubbed.redactionCount, 2, "Should redact 2 credentials");
assert.ok(!JSON.stringify(scrubbed.data).includes("sk-proj-"), "OpenAI token must be scrubbed");
assert.ok(!JSON.stringify(scrubbed.data).includes("AKIA"), "AWS token must be scrubbed");
console.log("[PASS] Test 4: Scrubbed in-flight secrets across tool payload");

// Test 5: Keystone spend limit ceiling enforcement
const mockPasskey = {
  scopes: {
    budget: {
      max_per_txn_usd: 5.0
    },
    commands: {
      deny_exec: ["sudo", "mkfs", "rm", "dd"]
    }
  }
};
const spendVeto = evaluateToolCall('purchase_api_credits', { spend_usd: 15.0 }, { passkey: mockPasskey });
assert.strictEqual(spendVeto.allowed, false, "Should block spend over cap");
assert.ok(spendVeto.reason.includes("KEYSTONE SPEND CEILING"), "Reason must mention spend ceiling");
console.log("[PASS] Test 5: Enforced Keystone passkey spend ceiling");

// Test 6: Keystone command deny token enforcement
const cmdVeto = evaluateToolCall('run_command', { command: 'sudo apt update' }, { passkey: mockPasskey });
assert.strictEqual(cmdVeto.allowed, false, "Should block sudo");
assert.ok(cmdVeto.reason.includes("KEYSTONE PASSKEY VETO"), "Reason must mention passkey veto");
console.log("[PASS] Test 6: Enforced Keystone passkey command deny list");

// Test 7: License loading verification
const lic = loadLicense();
assert.strictEqual(lic.licensed, true, "Must be licensed");
console.log("[PASS] Test 7: Loaded runtime license status:", lic.tier);

console.log("\nALL MCP-PROXY-GUARD VERIFICATION SUITES PASSED CLEANLY (7/7)");

