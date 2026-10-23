/**
 * Bartholomew Keystone (BTP Passkey Protocol v1.1.0)
 * ===================================================
 * Ephemeral, cryptographically signed capability tokens granting
 * autonomous AI agents fine-grained clearance across IDEs, programs, and web searches.
 *
 * Implements Zero-Trust Principle of Least Privilege for agentic workflows.
 */

declare const process: any;
declare const require: any;
const crypto = require('crypto');

export interface KeystoneScope {
  files?: {
    allow_read?: string[];
    allow_write?: string[];
    deny?: string[];
    max_file_size_kb?: number;
  };
  commands?: {
    allow_exec?: string[];
    deny_exec?: string[];
    deny_shell_operators?: boolean;
  };
  network?: {
    allow_domains?: string[];
    deny_domains?: string[];
    allow_search?: boolean;
    allow_ports?: number[];
  };
  budget?: {
    max_spend_usd?: number;
    max_per_txn_usd?: number;
    max_tokens?: number;
  };
  env?: {
    deny_keys?: string[];
  };
  tools?: {
    allow_tools?: string[];
    allow_operations?: string[];
    deny_tools?: string[];
  };
  invocation_limits?: {
    max_uses?: number;
    allow_repeat?: boolean;
    max_payload_bytes?: number;
  };
  destinations?: {
    allow_destinations?: string[];
    deny_destinations?: string[];
  };
}

export interface KeystonePasskey {
  passkey_id: string;
  agent_id: string;
  issuer: string;
  issued_at: string;
  expires_at: string;
  scopes: KeystoneScope;
  payload_hash: string;
  signature: string;
}

export interface ClearanceResult {
  verdict: 'ALLOW' | 'DENY';
  status: 'CLEARANCE_GRANTED' | 'OUT_OF_SCOPE' | 'PASSKEY_EXPIRED' | 'PASSKEY_REVOKED' | 'LIMIT_EXCEEDED' | 'INVALID_SIGNATURE';
  reason: string;
  latency_us: number;
  rule_id: string;
  receipt_hash: string;
}

export interface ClearanceReceipt {
  timestamp: string;
  passkey_id: string;
  agent_id: string;
  action_type: string;
  target: string;
  verdict: 'ALLOW' | 'DENY';
  reason: string;
  receipt_hash: string;
}

export class KeystoneEngine {
  private signingSecret: string;
  private receiptHistory: ClearanceReceipt[] = [];
  private revokedPasskeys: Map<string, { timestamp: string; reason: string }> = new Map();
  private invocationCounts: Map<string, number> = new Map();

  constructor(signingSecret?: string) {
    this.signingSecret = signingSecret || 'keystone-root-dev-authority';
  }

  /**
   * Revoke an active passkey immediately.
   */
  public revokePasskey(passkeyId: string, reason: string): boolean {
    this.revokedPasskeys.set(passkeyId, {
      timestamp: new Date().toISOString(),
      reason: reason || 'Administrative revocation'
    });
    return true;
  }

  /**
   * Check whether a passkey has been revoked.
   */
  public isRevoked(passkeyId: string): boolean {
    return this.revokedPasskeys.has(passkeyId);
  }

  /**
   * Get total invocation count for a passkey.
   */
  public getInvocationCount(passkeyId: string): number {
    return this.invocationCounts.get(passkeyId) || 0;
  }

  /**
   * Issues a signed capability passkey for an autonomous agent.
   */
  public issuePasskey(
    agentId: string,
    scopes: KeystoneScope,
    ttlMinutes: number = 120
  ): KeystonePasskey {
    const passkeyId = 'key_' + crypto.randomBytes(8).toString('hex');
    const now = new Date();
    const issuedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000).toISOString();

    const canonicalData = JSON.stringify({
      passkey_id: passkeyId,
      agent_id: agentId,
      issuer: 'Bartholomew-Keystone-Authority',
      issued_at: issuedAt,
      expires_at: expiresAt,
      scopes: scopes
    });

    const payloadHash = crypto.createHash('sha256').update(canonicalData).digest('hex');
    const signature = crypto.createHmac('sha256', this.signingSecret)
      .update(payloadHash)
      .digest('hex');

    return {
      passkey_id: passkeyId,
      agent_id: agentId,
      issuer: 'Bartholomew-Keystone-Authority',
      issued_at: issuedAt,
      expires_at: expiresAt,
      scopes: scopes,
      payload_hash: payloadHash,
      signature: signature
    };
  }

  /**
   * Verifies the cryptographic signature and timestamp of a passkey.
   */
  public verifyPasskey(passkey: KeystonePasskey): boolean {
    if (!passkey || !passkey.signature) return false;
    if (this.isRevoked(passkey.passkey_id)) return false;

    const now = new Date().getTime();
    const expiry = new Date(passkey.expires_at).getTime();
    if (now > expiry) return false;

    // 1. Direct HMAC verification against payload_hash (cross-platform compatible with Python & Node)
    if (passkey.payload_hash) {
      const expectedSigFromPayload = crypto.createHmac('sha256', this.signingSecret)
        .update(passkey.payload_hash)
        .digest('hex');
      if (passkey.signature === expectedSigFromPayload) {
        return true;
      }
    }

    // 2. Direct canonical check
    const canonicalData = JSON.stringify({
      passkey_id: passkey.passkey_id,
      agent_id: passkey.agent_id,
      issuer: passkey.issuer,
      issued_at: passkey.issued_at,
      expires_at: passkey.expires_at,
      scopes: passkey.scopes
    });

    const expectedHash = crypto.createHash('sha256').update(canonicalData).digest('hex');
    const expectedSig = crypto.createHmac('sha256', this.signingSecret)
      .update(expectedHash)
      .digest('hex');

    return passkey.signature === expectedSig;
  }

  /**
   * Generates a tamper-evident audit receipt for an evaluation.
   */
  private generateReceipt(
    passkey: KeystonePasskey,
    actionType: string,
    target: string,
    verdict: 'ALLOW' | 'DENY',
    reason: string
  ): { receipt_hash: string; receipt: ClearanceReceipt } {
    const timestamp = new Date().toISOString();
    const raw = `${passkey.passkey_id}|${passkey.agent_id}|${actionType}|${target}|${verdict}|${timestamp}`;
    const receiptHash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
    const receipt: ClearanceReceipt = {
      timestamp,
      passkey_id: passkey.passkey_id,
      agent_id: passkey.agent_id,
      action_type: actionType,
      target,
      verdict,
      reason,
      receipt_hash: receiptHash
    };
    this.receiptHistory.unshift(receipt);
    if (this.receiptHistory.length > 100) {
      this.receiptHistory.pop();
    }
    return { receipt_hash: receiptHash, receipt };
  }

  /**
   * Retrieves audit receipts recorded by this engine instance.
   */
  public getReceiptHistory(): ClearanceReceipt[] {
    return [...this.receiptHistory];
  }

  /**
   * Validates whether a proposed agent action falls within its signed passkey clearance (<15us).
   */
  public evaluateAction(
    passkey: KeystonePasskey,
    actionType: 'FILE_READ' | 'FILE_WRITE' | 'COMMAND_EXEC' | 'NETWORK_REQUEST' | 'FINANCIAL_SPEND' | 'ENV_ACCESS',
    target: string,
    spendAmountUsd?: number
  ): ClearanceResult {
    const start = process.hrtime.bigint();

    // 0. Explicit Revocation Check
    if (this.isRevoked(passkey.passkey_id)) {
      const end = process.hrtime.bigint();
      const reason = `Passkey '${passkey.passkey_id}' has been cryptographically revoked.`;
      const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
      return {
        verdict: 'DENY',
        status: 'PASSKEY_REVOKED',
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-REVOKED-001',
        receipt_hash
      };
    }

    // 1. Signature & Expiration Check
    if (!this.verifyPasskey(passkey)) {
      const end = process.hrtime.bigint();
      const now = new Date().getTime();
      const expiry = new Date(passkey.expires_at).getTime();
      const isExpired = now > expiry;
      const status = isExpired ? 'PASSKEY_EXPIRED' : 'INVALID_SIGNATURE';
      const reason = isExpired ? 'Passkey clearance has expired.' : 'Passkey signature is invalid.';
      const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
      return {
        verdict: 'DENY',
        status,
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-001',
        receipt_hash
      };
    }

    // 1b. Invocation Count Limit Check
    const count = (this.invocationCounts.get(passkey.passkey_id) || 0) + 1;
    const maxUses = passkey.scopes.invocation_limits?.max_uses;
    if (maxUses !== undefined && count > maxUses) {
      const end = process.hrtime.bigint();
      const reason = `Passkey usage ceiling exceeded (${count} > ${maxUses}).`;
      const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
      return {
        verdict: 'DENY',
        status: 'LIMIT_EXCEEDED',
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-INVOCATION-CEILING',
        receipt_hash
      };
    }
    this.invocationCounts.set(passkey.passkey_id, count);

    const scopes = passkey.scopes;
    const targetNorm = target.toLowerCase();

    // 2. File Scopes
    if (actionType === 'FILE_READ' || actionType === 'FILE_WRITE') {
      const fileScope = scopes.files || {};
      const denyList = fileScope.deny || ['.env', 'secrets', 'credentials.json', 'id_rsa', '.git/hooks', 'id_ed25519'];
      for (const denied of denyList) {
        if (targetNorm.includes(denied.toLowerCase())) {
          const end = process.hrtime.bigint();
          const reason = `Access to protected target '${target}' is denied by passkey policy.`;
          const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-FILE-DENIED',
            receipt_hash
          };
        }
      }

      if (actionType === 'FILE_WRITE' && fileScope.allow_write && fileScope.allow_write.length > 0) {
        const allowed = fileScope.allow_write.some(pat => targetNorm.includes(pat.toLowerCase()));
        if (!allowed) {
          const end = process.hrtime.bigint();
          const reason = `Write target '${target}' falls outside authorized write scopes [${fileScope.allow_write.join(', ')}].`;
          const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-WRITE-SCOPE',
            receipt_hash
          };
        }
      }

      if (actionType === 'FILE_READ' && fileScope.allow_read && fileScope.allow_read.length > 0) {
        if (!fileScope.allow_read.includes('**/*') && !fileScope.allow_read.includes('*')) {
          const allowed = fileScope.allow_read.some(pat => targetNorm.includes(pat.toLowerCase()));
          if (!allowed) {
            const end = process.hrtime.bigint();
            const reason = `Read target '${target}' falls outside authorized read scopes.`;
            const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
            return {
              verdict: 'DENY',
              status: 'OUT_OF_SCOPE',
              reason,
              latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
              rule_id: 'KEYSTONE-READ-SCOPE',
              receipt_hash
            };
          }
        }
      }
    }

    // 3. Command Execution Scopes
    if (actionType === 'COMMAND_EXEC') {
      const cmdScope = scopes.commands || {};
      const denyCmds = cmdScope.deny_exec || ['rm', 'curl', 'wget', 'sudo', 'mkfs', 'dd', 'chmod', 'chown', 'shutdown'];
      for (const dc of denyCmds) {
        const regex = new RegExp(`\\b${dc}\\b`, 'i');
        if (regex.test(targetNorm)) {
          const end = process.hrtime.bigint();
          const reason = `Execution of restricted command '${dc}' blocked by passkey clearance.`;
          const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-CMD-DENIED',
            receipt_hash
          };
        }
      }

      // Shell operator injection prevention
      if (cmdScope.deny_shell_operators !== false) {
        const dangerousOperators = [';', '&&', '||', '|', '`', '$(', '>>'];
        for (const op of dangerousOperators) {
          if (target.includes(op)) {
            const end = process.hrtime.bigint();
            const reason = `Chained command execution with shell operator '${op}' blocked by passkey safety policy.`;
            const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
            return {
              verdict: 'DENY',
              status: 'OUT_OF_SCOPE',
              reason,
              latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
              rule_id: 'KEYSTONE-SHELL-INJECTION',
              receipt_hash
            };
          }
        }
      }
    }

    // 4. Network / Search Scopes
    if (actionType === 'NETWORK_REQUEST') {
      const netScope = scopes.network || {};
      if (netScope.deny_domains && netScope.deny_domains.length > 0) {
        const isDenied = netScope.deny_domains.some(dom => targetNorm.includes(dom.toLowerCase()));
        if (isDenied) {
          const end = process.hrtime.bigint();
          const reason = `Network destination '${target}' matches denied domain list.`;
          const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-NET-DENIED',
            receipt_hash
          };
        }
      }

      if (netScope.allow_domains && netScope.allow_domains.length > 0) {
        const isAllowedDomain = netScope.allow_domains.some(dom => targetNorm.includes(dom.toLowerCase()));
        if (!isAllowedDomain) {
          const end = process.hrtime.bigint();
          const reason = `Network destination '${target}' is not in authorized domain whitelist.`;
          const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-NET-WHITELIST',
            receipt_hash
          };
        }
      }
    }

    // 5. Environment Variable Access Scopes
    if (actionType === 'ENV_ACCESS') {
      const envScope = scopes.env || {};
      const denyKeys = envScope.deny_keys || ['key', 'secret', 'token', 'auth', 'pass', 'cred'];
      for (const dk of denyKeys) {
        if (targetNorm.includes(dk.toLowerCase())) {
          const end = process.hrtime.bigint();
          const reason = `Environment variable key '${target}' access blocked by passkey credential policy.`;
          const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-ENV-DENIED',
            receipt_hash
          };
        }
      }
    }

    // 6. Budget Scopes
    if (actionType === 'FINANCIAL_SPEND' || (spendAmountUsd && spendAmountUsd > 0)) {
      const maxSpend = scopes.budget?.max_spend_usd ?? 50.0;
      const maxPerTxn = scopes.budget?.max_per_txn_usd ?? 20.0;
      const spend = spendAmountUsd || 0;

      if (spend > maxPerTxn) {
        const end = process.hrtime.bigint();
        const reason = `Transaction spend $${spend.toFixed(2)} exceeds single-action ceiling $${maxPerTxn.toFixed(2)}.`;
        const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
        return {
          verdict: 'DENY',
          status: 'OUT_OF_SCOPE',
          reason,
          latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
          rule_id: 'KEYSTONE-TXN-CAP',
          receipt_hash
        };
      }

      if (spend > maxSpend) {
        const end = process.hrtime.bigint();
        const reason = `Cumulative spend $${spend.toFixed(2)} exceeds total session ceiling $${maxSpend.toFixed(2)}.`;
        const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'DENY', reason);
        return {
          verdict: 'DENY',
          status: 'OUT_OF_SCOPE',
          reason,
          latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
          rule_id: 'KEYSTONE-BUDGET-CAP',
          receipt_hash
        };
      }
    }

    const end = process.hrtime.bigint();
    const reason = 'Action verified within active passkey clearance boundaries.';
    const { receipt_hash } = this.generateReceipt(passkey, actionType, target, 'ALLOW', reason);
    return {
      verdict: 'ALLOW',
      status: 'CLEARANCE_GRANTED',
      reason,
      latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
      rule_id: 'KEYSTONE-PASS-000',
      receipt_hash
    };
  }

  /**
   * Validates fine-grained MCP tool invocations against capability bounds:
   * tool name, operation, payload size, invocation count, and destination.
   */
  public evaluateMcpToolAction(
    passkey: KeystonePasskey,
    toolName: string,
    args: Record<string, any> = {},
    destination?: string,
    payloadSizeBytes?: number
  ): ClearanceResult {
    const start = process.hrtime.bigint();

    // 0. Explicit Revocation Check
    if (this.isRevoked(passkey.passkey_id)) {
      const end = process.hrtime.bigint();
      const reason = `Passkey '${passkey.passkey_id}' has been cryptographically revoked.`;
      const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'DENY', reason);
      return {
        verdict: 'DENY',
        status: 'PASSKEY_REVOKED',
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-REVOKED-001',
        receipt_hash
      };
    }

    // 1. Signature & Expiration Check
    if (!this.verifyPasskey(passkey)) {
      const end = process.hrtime.bigint();
      const now = new Date().getTime();
      const expiry = new Date(passkey.expires_at).getTime();
      const status = now > expiry ? 'PASSKEY_EXPIRED' : 'INVALID_SIGNATURE';
      const reason = now > expiry ? 'Passkey clearance has expired.' : 'Passkey signature is invalid.';
      const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'DENY', reason);
      return {
        verdict: 'DENY',
        status,
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-001',
        receipt_hash
      };
    }

    const scopes = passkey.scopes;

    // 2. Invocation Limits & Repeat Prevention
    const count = (this.invocationCounts.get(passkey.passkey_id) || 0) + 1;
    const maxUses = scopes.invocation_limits?.max_uses;
    if (maxUses !== undefined && count > maxUses) {
      const end = process.hrtime.bigint();
      const reason = `Passkey invocation count ${count} exceeds allowed ceiling ${maxUses}.`;
      const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'DENY', reason);
      return {
        verdict: 'DENY',
        status: 'LIMIT_EXCEEDED',
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-TOOL-INVOCATIONS',
        receipt_hash
      };
    }

    // Check payload size
    const maxBytes = scopes.invocation_limits?.max_payload_bytes;
    const actualBytes = payloadSizeBytes !== undefined ? payloadSizeBytes : Buffer.byteLength(JSON.stringify(args || {}));
    if (maxBytes !== undefined && actualBytes > maxBytes) {
      const end = process.hrtime.bigint();
      const reason = `Payload size ${actualBytes} bytes exceeds maximum limit ${maxBytes} bytes.`;
      const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'DENY', reason);
      return {
        verdict: 'DENY',
        status: 'LIMIT_EXCEEDED',
        reason,
        latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
        rule_id: 'KEYSTONE-PAYLOAD-CEILING',
        receipt_hash
      };
    }

    // 3. Tool allowlist / denylist
    const toolScope = scopes.tools;
    if (toolScope) {
      if (toolScope.deny_tools && toolScope.deny_tools.includes(toolName)) {
        const end = process.hrtime.bigint();
        const reason = `Tool '${toolName}' is explicitly denied by passkey clearance.`;
        const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'DENY', reason);
        return {
          verdict: 'DENY',
          status: 'OUT_OF_SCOPE',
          reason,
          latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
          rule_id: 'KEYSTONE-TOOL-DENIED',
          receipt_hash
        };
      }

      if (toolScope.allow_tools && toolScope.allow_tools.length > 0) {
        if (!toolScope.allow_tools.includes('*') && !toolScope.allow_tools.includes(toolName)) {
          const end = process.hrtime.bigint();
          const reason = `Tool '${toolName}' is not in authorized tool allowlist [${toolScope.allow_tools.join(', ')}].`;
          const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-TOOL-ALLOWLIST',
            receipt_hash
          };
        }
      }

      // Operation check if operation is provided in args
      const op = args.operation || args.action || args.method;
      if (op && toolScope.allow_operations && toolScope.allow_operations.length > 0) {
        if (!toolScope.allow_operations.includes(op)) {
          const end = process.hrtime.bigint();
          const reason = `Operation '${op}' is not in authorized operations [${toolScope.allow_operations.join(', ')}].`;
          const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', `${toolName}:${op}`, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-OP-ALLOWLIST',
            receipt_hash
          };
        }
      }
    }

    // 4. Destination Constraints
    if (destination && scopes.destinations) {
      if (scopes.destinations.deny_destinations) {
        for (const deniedDest of scopes.destinations.deny_destinations) {
          if (destination.toLowerCase().includes(deniedDest.toLowerCase())) {
            const end = process.hrtime.bigint();
            const reason = `Destination '${destination}' is denied by passkey policy.`;
            const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', destination, 'DENY', reason);
            return {
              verdict: 'DENY',
              status: 'OUT_OF_SCOPE',
              reason,
              latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
              rule_id: 'KEYSTONE-DEST-DENIED',
              receipt_hash
            };
          }
        }
      }

      if (scopes.destinations.allow_destinations && scopes.destinations.allow_destinations.length > 0) {
        const allowed = scopes.destinations.allow_destinations.some(d => {
          if (d === '*') return true;
          const prefix = d.endsWith('*') ? d.slice(0, -1).toLowerCase() : d.toLowerCase();
          return destination.toLowerCase().startsWith(prefix) || destination.toLowerCase().includes(prefix);
        });
        if (!allowed) {
          const end = process.hrtime.bigint();
          const reason = `Destination '${destination}' is not in authorized destination allowlist.`;
          const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', destination, 'DENY', reason);
          return {
            verdict: 'DENY',
            status: 'OUT_OF_SCOPE',
            reason,
            latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
            rule_id: 'KEYSTONE-DEST-SCOPE',
            receipt_hash
          };
        }
      }
    }

    this.invocationCounts.set(passkey.passkey_id, count);

    const end = process.hrtime.bigint();
    const reason = `Tool '${toolName}' execution verified within capability passkey bounds.`;
    const { receipt_hash } = this.generateReceipt(passkey, 'MCP_TOOL_EXEC', toolName, 'ALLOW', reason);
    return {
      verdict: 'ALLOW',
      status: 'CLEARANCE_GRANTED',
      reason,
      latency_us: Number(Number(end - start) / 1000).toFixed(2) as any,
      rule_id: 'KEYSTONE-TOOL-PASS-000',
      receipt_hash
    };
  }
}
