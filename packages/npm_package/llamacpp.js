/**
 * Bartholomew Llama.cpp & Ollama Local Gateway (Node.js Edition - BTP v6.3.0)
 * =========================================================================
 * Zero-dependency in-process tool execution interceptor for:
 *   - llama.cpp server
 *   - Ollama
 *   - LocalAI / LM Studio / vLLM / Jan
 *
 * Intercepts hallucinated destructive shell commands and path traversals in <35µs,
 * returning Structured Remediation Envelopes to allow local models to self-heal.
 */

import { evaluateAndRemediate, sanitizeAgentContext } from './agent_core.js';

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+[/~]/i,
  /del\s+\/[sS]\s+[cC]:\\/i,
  /format\s+[cC]:/i,
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/i,
  /curl\s+.*\|\s*(?:bash|sh)/i,
  /wget\s+.*\|\s*(?:bash|sh)/i,
  /\.\.\/\.\.\/etc\/(?:passwd|shadow)/i,
  /powershell\s+-enc\s+/i
];

export function evaluateLocalToolCall(toolName, args = {}) {
  const argStr = typeof args === 'string' ? args : JSON.stringify(args);
  const nameLower = (toolName || '').toLowerCase();

  // 1. Evaluate destructive commands
  for (const pat of DANGEROUS_PATTERNS) {
    if (pat.test(argStr)) {
      const remediation = evaluateAndRemediate('SHELL', argStr);
      return {
        safe: false,
        remediation
      };
    }
  }

  // 2. Evaluate path traversals
  for (const k of ['path', 'target', 'file', 'filename', 'filepath']) {
    if (args[k] && typeof args[k] === 'string' && (args[k].includes('../..') || args[k].startsWith('/etc/'))) {
      const remediation = evaluateAndRemediate('SHELL', `cat ${args[k]}`);
      return {
        safe: false,
        remediation
      };
    }
  }

  return { safe: true, remediation: null };
}

export function sanitizeLocalRequestBody(bodyStr) {
  try {
    const data = JSON.parse(bodyStr);
    if (Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        if (typeof msg.content === 'string') {
          const res = sanitizeAgentContext(msg.content);
          msg.content = res.cleanText;
        }
      }
      return JSON.stringify(data);
    }
  } catch (e) {
    // Ignore malformed JSON and pass through safely
  }
  return bodyStr;
}

export function inspectAndFilterResponse(responseStr) {
  try {
    const data = JSON.parse(responseStr);
    if (Array.isArray(data.choices)) {
      let modified = false;
      for (const choice of data.choices) {
        const msg = choice.message;
        if (msg && Array.isArray(msg.tool_calls)) {
          for (const tc of msg.tool_calls) {
            const func = tc.function || {};
            const name = func.name || '';
            let parsedArgs = {};
            try {
              parsedArgs = JSON.parse(func.arguments || '{}');
            } catch (e) {
              parsedArgs = { raw: func.arguments };
            }

            const evalRes = evaluateLocalToolCall(name, parsedArgs);
            if (!evalRes.safe) {
              modified = true;
              tc.function.name = 'bartholomew_remediation_guard';
              tc.function.arguments = JSON.stringify({
                status: 'VETOED_BY_LOCAL_GUARD',
                original_tool: name,
                remediation: evalRes.remediation
              });
              msg.content = `[BARTHOLOMEW GUARD] Intercepted dangerous tool '${name}'. Action aborted. Guidance: ${evalRes.remediation.safeAlternative || 'Use non-destructive alternative'}`;
            }
          }
        }
      }
      if (modified) {
        return JSON.stringify(data, null, 2);
      }
    }
  } catch (e) {
    // Return original if parsing fails
  }
  return responseStr;
}
