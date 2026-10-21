/**
 * Bartholomew BTP v6.5.6 — Universal Model & Runtime Adapters
 * Path: packages/npm_package/universal_adapters.js
 * 
 * Provides model-agnostic and runtime-agnostic adapters sharing the single
 * BTP in-process enforcement core (enforceToolBoundary).
 * 
 * Supported Adapters:
 * 1. MCPAdapter (Anthropic / Claude Desktop / Cursor MCP JSON-RPC protocol)
 * 2. OpenAIToolAdapter (OpenAI / Anthropic / Gemini standard tool_calls format)
 * 3. LangChainFrameworkAdapter (LangChain / LlamaIndex / AutoGen / CrewAI tools)
 * 4. MediatedProcessAdapter (Terminal, child_process, and shell mediated execution)
 * 5. MultiAgentDelegationAdapter (Multi-agent supervisor-to-worker delegation)
 * 6. UniversalBTPDispatcher (Auto-detecting unified execution gateway)
 */

import { enforceToolBoundary, auditToolBoundary, BTP_CAPABILITY_MANIFEST } from './agent_core.js';
import crypto from 'crypto';

/**
 * Canonical BTP Action Representation
 */
export function normalizeActionRequest(rawAction, callerType = 'generic') {
  if (!rawAction) {
    return {
      tool: 'unknown',
      input: {},
      caller_type: callerType,
      agent_id: 'anonymous',
      session_id: 'default'
    };
  }

  // Format 1: OpenAI Tool Call ({ function: { name, arguments } })
  if (rawAction.function && rawAction.function.name) {
    let args = rawAction.function.arguments;
    if (typeof args === 'string') {
      try { args = JSON.parse(args); } catch (_) { args = { raw: args }; }
    }
    return {
      tool: rawAction.function.name,
      input: args || {},
      caller_type: 'openai_tool_call',
      tool_call_id: rawAction.id,
      agent_id: rawAction.agent_id || 'openai_agent',
      session_id: rawAction.session_id || 'default'
    };
  }

  // Format 2: Anthropic Tool Use ({ name, input })
  if (rawAction.name && rawAction.input !== undefined && rawAction.type === 'tool_use') {
    return {
      tool: rawAction.name,
      input: rawAction.input || {},
      caller_type: 'anthropic_tool_use',
      tool_call_id: rawAction.id,
      agent_id: rawAction.agent_id || 'claude_agent',
      session_id: rawAction.session_id || 'default'
    };
  }

  // Format 3: MCP JSON-RPC params ({ name, arguments })
  if (rawAction.name && rawAction.arguments !== undefined) {
    return {
      tool: rawAction.name,
      input: rawAction.arguments || {},
      caller_type: 'mcp_json_rpc',
      agent_id: rawAction.agent_id || 'mcp_client',
      session_id: rawAction.session_id || 'default'
    };
  }

  // Format 4: Direct { tool, input }
  const toolName = rawAction.tool || rawAction.tool_name || rawAction.name || 'generic_tool';
  const toolInput = rawAction.input !== undefined ? rawAction.input : (rawAction.payload || rawAction.args || {});

  return {
    tool: String(toolName),
    input: toolInput,
    caller_type: callerType,
    agent_id: rawAction.agent_id || 'default_agent',
    session_id: rawAction.session_id || 'default',
    clearance_token: rawAction.clearance_token || null
  };
}

/**
 * 1. MCP Gateway Adapter
 */
export class MCPAdapter {
  constructor(executor, options = {}) {
    this.executor = executor;
    this.options = options;
    this.adapterType = 'mcp_protocol';
  }

  async handleCallToolRequest(request) {
    const params = (request && typeof request === 'object') ? (request.params !== undefined ? request.params : request) : {};
    const normalized = normalizeActionRequest(params, this.adapterType);

    // Enforce via shared BTP core
    const decision = enforceToolBoundary(normalized.tool, normalized.input, this.options);

    if (!decision.allowed) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `[BTP-VETO] ${decision.rule_id || 'POLICY_VIOLATION'}: ${decision.reason} (Remediation: ${decision.remediation_hint || 'N/A'})`
          }
        ],
        _btp_verdict: decision.verdict,
        _btp_rule_id: decision.rule_id,
        _executor_called: false
      };
    }

    // Execute downstream
    let result = null;
    if (typeof this.executor === 'function') {
      result = await this.executor(normalized.tool, normalized.input);
    }

    return {
      isError: false,
      content: [
        {
          type: "text",
          text: typeof result === 'object' ? JSON.stringify(result) : String(result || "SUCCESS")
        }
      ],
      _btp_verdict: "ALLOW",
      _btp_receipt: decision.merkle_turn_receipt,
      _executor_called: true,
      result
    };
  }
}

/**
 * 2. OpenAI / Frontier Model Tool-Calling Adapter
 */
export class OpenAIToolAdapter {
  constructor(executor, options = {}) {
    this.executor = executor;
    this.options = options;
    this.adapterType = 'openai_frontier_tool_call';
  }

  async handleToolCall(toolCall) {
    const normalized = normalizeActionRequest(toolCall, this.adapterType);
    const decision = enforceToolBoundary(normalized.tool, normalized.input, this.options);

    if (!decision.allowed) {
      return {
        tool_call_id: normalized.tool_call_id || 'call_' + crypto.randomBytes(6).toString('hex'),
        role: "tool",
        name: normalized.tool,
        content: JSON.stringify({
          error: "BTP_POLICY_VETO",
          verdict: decision.verdict,
          rule_id: decision.rule_id,
          reason: decision.reason,
          safe_alternative: decision.safe_alternative || null
        }),
        _btp_blocked: true,
        _executor_called: false
      };
    }

    let execResult = null;
    if (typeof this.executor === 'function') {
      execResult = await this.executor(normalized.tool, normalized.input);
    }

    return {
      tool_call_id: normalized.tool_call_id || 'call_' + crypto.randomBytes(6).toString('hex'),
      role: "tool",
      name: normalized.tool,
      content: typeof execResult === 'object' ? JSON.stringify(execResult) : String(execResult || "SUCCESS"),
      _btp_blocked: false,
      _btp_receipt: decision.merkle_turn_receipt,
      _executor_called: true,
      result: execResult
    };
  }
}

/**
 * 3. LangChain / Agent Framework Tool Wrapper
 */
export class LangChainFrameworkAdapter {
  constructor(options = {}) {
    this.options = options;
    this.adapterType = 'langchain_framework';
  }

  wrapTool(toolInstance) {
    if (!toolInstance) return toolInstance;
    const toolName = toolInstance.name || 'langchain_tool';
    const originalCall = (toolInstance._call || toolInstance.call || toolInstance.invoke || toolInstance.execute).bind(toolInstance);

    const wrappedCall = async (input) => {
      const normalized = normalizeActionRequest({ tool: toolName, input }, this.adapterType);
      const decision = enforceToolBoundary(normalized.tool, normalized.input, this.options);

      if (!decision.allowed) {
        throw new Error(`[BTP-VETO] ${toolName} execution denied by ${decision.rule_id}: ${decision.reason}`);
      }

      return await originalCall(normalized.input);
    };

    if (toolInstance._call) toolInstance._call = wrappedCall;
    if (toolInstance.call) toolInstance.call = wrappedCall;
    if (toolInstance.invoke) toolInstance.invoke = wrappedCall;
    if (toolInstance.execute) toolInstance.execute = wrappedCall;

    toolInstance._btp_mediated = true;
    return toolInstance;
  }
}

/**
 * 4. Mediated Subprocess & Process Launcher Adapter
 */
export class MediatedProcessAdapter {
  constructor(executor, options = {}) {
    this.executor = executor;
    this.options = options;
    this.adapterType = 'mediated_subprocess';
  }

  async executeCommand(command, args = [], envOverrides = {}) {
    const fullCmd = Array.isArray(args) && args.length > 0 ? `${command} ${args.join(' ')}` : String(command);
    const normalized = normalizeActionRequest({
      tool: 'run_command',
      input: { command: fullCmd, env: envOverrides }
    }, this.adapterType);

    const decision = enforceToolBoundary('run_command', normalized.input, this.options);

    if (!decision.allowed) {
      return {
        success: false,
        blocked: true,
        exit_code: 126,
        verdict: decision.verdict,
        rule_id: decision.rule_id,
        reason: decision.reason,
        _executor_called: false
      };
    }

    let execOutput = null;
    if (typeof this.executor === 'function') {
      execOutput = await this.executor(fullCmd, envOverrides);
    }

    return {
      success: true,
      blocked: false,
      exit_code: 0,
      verdict: "ALLOW",
      output: execOutput,
      merkle_turn_receipt: decision.merkle_turn_receipt,
      _executor_called: true
    };
  }
}

/**
 * 5. Multi-Agent Delegation Adapter
 */
export class MultiAgentDelegationAdapter {
  constructor(workerExecutor, options = {}) {
    this.workerExecutor = workerExecutor;
    this.options = options;
    this.adapterType = 'multi_agent_delegation';
  }

  async delegateTask(delegationRequest) {
    const { supervisor_agent_id, worker_agent_id, task_action, payload, clearance_token } = delegationRequest;
    const normalized = normalizeActionRequest({
      tool: task_action,
      input: payload,
      agent_id: worker_agent_id,
      clearance_token
    }, this.adapterType);

    // Policy check clearance token if required
    if (this.options.requireClearanceToken && !clearance_token) {
      return {
        success: false,
        verdict: "HOLD_FOR_APPROVAL",
        rule_id: "BTP-DELEGATION-TOKEN-REQUIRED",
        reason: `Delegation from ${supervisor_agent_id} to ${worker_agent_id} requires cryptographic clearance token.`,
        _executor_called: false
      };
    }

    const decision = enforceToolBoundary(normalized.tool, normalized.input, this.options);

    if (!decision.allowed) {
      return {
        success: false,
        verdict: decision.verdict,
        rule_id: decision.rule_id,
        reason: decision.reason,
        supervisor_agent_id,
        worker_agent_id,
        _executor_called: false
      };
    }

    let result = null;
    if (typeof this.workerExecutor === 'function') {
      result = await this.workerExecutor(normalized.tool, normalized.input);
    }

    return {
      success: true,
      verdict: "ALLOW",
      supervisor_agent_id,
      worker_agent_id,
      task_action,
      result,
      merkle_turn_receipt: decision.merkle_turn_receipt,
      _executor_called: true
    };
  }
}

/**
 * 6. Universal BTP Dispatcher (Unified Facade)
 */
export class UniversalBTPDispatcher {
  constructor(executorMap = {}, defaultOptions = {}) {
    this.executorMap = executorMap;
    this.defaultOptions = defaultOptions;
  }

  async dispatch(actionRequest, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const normalized = normalizeActionRequest(actionRequest);
    const decision = enforceToolBoundary(normalized.tool, normalized.input, mergedOptions);

    if (!decision.allowed) {
      return {
        verdict: decision.verdict,
        allowed: false,
        rule_id: decision.rule_id,
        reason: decision.reason,
        remediation_hint: decision.remediation_hint,
        safe_alternative: decision.safe_alternative,
        normalized_action: normalized,
        executor_invocations: 0
      };
    }

    const executor = this.executorMap[normalized.tool] || this.executorMap['*'];
    let result = null;
    if (typeof executor === 'function') {
      result = await executor(normalized.tool, normalized.input);
    }

    return {
      verdict: "ALLOW",
      allowed: true,
      merkle_turn_receipt: decision.merkle_turn_receipt,
      normalized_action: normalized,
      executor_invocations: 1,
      result
    };
  }
}

/**
 * 7. Framework Helper Hooks (LangGraph, CrewAI, AutoGen, OpenHands)
 */
export function createLangGraphToolNode(tools = [], options = {}) {
  const adapter = new LangChainFrameworkAdapter(options);
  const guardedTools = tools.map(t => adapter.wrapTool(t));
  return {
    tools: guardedTools,
    invoke: async (state) => {
      const toolCall = state.toolCall || state.pending_tool || {};
      const decision = enforceToolBoundary(toolCall.name || 'unknown_tool', toolCall.args || {}, options);
      if (!decision.allowed) {
        return {
          ...state,
          error: `[BTP VETO] ${decision.rule_id}: ${decision.reason}`,
          status: 'BLOCKED',
          verdict: decision.verdict
        };
      }
      return { ...state, status: 'ALLOWED', verdict: 'ALLOW' };
    }
  };
}

export function createCrewAIStepCallback(options = {}) {
  return function btpCrewAIStepCallback(stepOutput) {
    const raw = typeof stepOutput === 'object' ? JSON.stringify(stepOutput) : String(stepOutput);
    const decision = enforceToolBoundary('crewai_step', { output: raw }, options);
    if (!decision.allowed) {
      throw new Error(`[BTP VETO] CrewAI step halted by ${decision.rule_id}: ${decision.reason}`);
    }
    return true;
  };
}

export function createAutoGenPreFilter(options = {}) {
  return function btpAutoGenFilter(recipient, messages, sender, config) {
    const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1] : {};
    const content = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg);
    const decision = enforceToolBoundary('autogen_message', { content }, options);
    return {
      proceed: decision.allowed,
      verdict: decision.verdict,
      reason: decision.reason
    };
  };
}

export function createOpenHandsHook(options = {}) {
  return async function btpOpenHandsHook(event) {
    if (event.action === 'run' || event.action === 'command' || event.action === 'tool') {
      const payload = event.args || { command: event.command };
      const decision = enforceToolBoundary(event.action, payload, options);
      if (!decision.allowed) {
        return {
          status: 'REJECTED',
          rule_id: decision.rule_id,
          reason: decision.reason
        };
      }
    }
    return { status: 'APPROVED' };
  };
}

/**
 * 8. Google GenAI / Gemini Agent Middleware (BTP v6.5.9)
 * Intercepts @google/genai function declarations and model tool calls
 */
export class GoogleGenAIMiddleware {
  constructor(options = {}) {
    this.options = {
      strictAst: true,
      blockDestructiveCommands: true,
      redactSecrets: true,
      maxExecutionLatencyUs: 35,
      ...options
    };
    this.auditLog = [];
  }

  /**
   * Intercept and evaluate a Gemini function call before execution
   */
  interceptFunctionCall(functionCall, agentContext = {}) {
    const fnName = functionCall?.name || 'gemini_tool';
    const fnArgs = functionCall?.args || {};

    const decision = enforceToolBoundary(fnName, fnArgs, this.options);

    const logEntry = {
      timestamp: new Date().toISOString(),
      framework: 'google_genai',
      tool: fnName,
      allowed: decision.allowed,
      verdict: decision.verdict,
      rule_id: decision.rule_id || null,
      reason: decision.reason || null,
      merkle_turn_receipt: decision.merkle_turn_receipt
    };
    this.auditLog.push(logEntry);

    if (!decision.allowed) {
      return {
        allowed: false,
        verdict: 'VETO',
        rule_id: decision.rule_id,
        reason: decision.reason,
        merkle_turn_receipt: decision.merkle_turn_receipt,
        error: `[BTP VETO] Execution halted by ${decision.rule_id}: ${decision.reason}`
      };
    }

    return {
      allowed: true,
      verdict: 'ALLOW',
      merkle_turn_receipt: decision.merkle_turn_receipt,
      sanitizedArgs: decision.sanitized_payload || fnArgs
    };
  }

  /**
   * Decorator/Wrapper for Gemini function implementations
   */
  wrapToolFunction(toolFn, name = null) {
    const fnName = name || toolFn.name || 'gemini_tool';
    const self = this;

    return async function btpGuardedGenAIFunction(args) {
      const evaluation = self.interceptFunctionCall({ name: fnName, args });
      if (!evaluation.allowed) {
        throw new Error(evaluation.error);
      }
      return await toolFn(evaluation.sanitizedArgs || args);
    };
  }
}

/**
 * 9. LlamaIndex Workflow Middleware (BTP v6.5.9)
 * Intercepts LlamaIndex agent workflow steps and tool boundaries
 */
export class LlamaIndexMiddleware {
  constructor(options = {}) {
    this.options = {
      strictAst: true,
      blockDestructiveCommands: true,
      redactSecrets: true,
      ...options
    };
    this.auditLog = [];
  }

  interceptWorkflowStep(stepName, stepInput) {
    const rawPayload = typeof stepInput === 'object' ? stepInput : { input: String(stepInput) };
    const decision = enforceToolBoundary(stepName, rawPayload, this.options);

    const logEntry = {
      timestamp: new Date().toISOString(),
      framework: 'llamaindex_workflow',
      step: stepName,
      allowed: decision.allowed,
      verdict: decision.verdict,
      merkle_turn_receipt: decision.merkle_turn_receipt
    };
    this.auditLog.push(logEntry);

    return {
      proceed: decision.allowed,
      verdict: decision.verdict,
      rule_id: decision.rule_id || null,
      reason: decision.reason || null,
      merkle_turn_receipt: decision.merkle_turn_receipt
    };
  }

  wrapTool(tool) {
    const toolName = tool?.metadata?.name || tool?.name || 'llamaindex_tool';
    const originalCall = tool?.call?.bind(tool) || tool?.invoke?.bind(tool);
    const self = this;

    return {
      ...tool,
      metadata: tool?.metadata || { name: toolName },
      call: async (args) => {
        const decision = enforceToolBoundary(toolName, typeof args === 'object' ? args : { input: args }, self.options);
        if (!decision.allowed) {
          throw new Error(`[BTP VETO] LlamaIndex tool execution halted: ${decision.reason}`);
        }
        return await originalCall(decision.sanitized_payload || args);
      }
    };
  }
}

export function createGoogleGenAIMiddleware(options = {}) {
  return new GoogleGenAIMiddleware(options);
}

export function createLlamaIndexWorkflowMiddleware(options = {}) {
  return new LlamaIndexMiddleware(options);
}

/**
 * 10. Claude Code & Autonomous CLI Tool Adapter (BTP v6.6.3)
 * Intercepts Claude Code tool calls (Bash, FileEdit, FileWrite, Read, Glob, Grep)
 */
export class ClaudeCodeAdapter {
  constructor(executor, options = {}) {
    this.executor = executor;
    this.options = {
      strictAst: true,
      blockDestructiveCommands: true,
      redactSecrets: true,
      maxExecutionLatencyUs: 35,
      ...options
    };
    this.adapterType = 'claude_code';
    this.auditLog = [];
  }

  async handleToolInvocation(toolName, toolInput = {}) {
    let mappedTool = toolName;
    let mappedInput = toolInput;

    if (toolName === 'Bash') {
      mappedTool = 'run_command';
      mappedInput = typeof toolInput === 'string'
        ? { command: toolInput }
        : (toolInput.command ? toolInput : { command: toolInput.cmd || '' });
    } else if (toolName === 'FileWrite' || toolName === 'FileEdit') {
      mappedTool = 'write_file';
      mappedInput = typeof toolInput === 'object' ? toolInput : { path: String(toolInput) };
    }

    const decision = enforceToolBoundary(mappedTool, mappedInput, this.options);

    const logEntry = {
      timestamp: new Date().toISOString(),
      framework: 'claude_code',
      tool: toolName,
      mappedTool,
      allowed: decision.allowed,
      verdict: decision.verdict,
      rule_id: decision.rule_id || null,
      reason: decision.reason || null,
      merkle_turn_receipt: decision.merkle_turn_receipt
    };
    this.auditLog.push(logEntry);

    if (!decision.allowed) {
      return {
        allowed: false,
        isError: true,
        verdict: 'VETO',
        rule_id: decision.rule_id || 'BTP_POLICY_VETO',
        reason: decision.reason,
        merkle_turn_receipt: decision.merkle_turn_receipt,
        content: `[BTP VETO] Execution halted by ${decision.rule_id}: ${decision.reason}`,
        error: `[BTP VETO] Claude Code tool ${toolName} halted: ${decision.reason}`
      };
    }

    let result = null;
    if (typeof this.executor === 'function') {
      result = await this.executor(toolName, decision.sanitized_payload || toolInput);
    }

    return {
      allowed: true,
      isError: false,
      verdict: 'ALLOW',
      merkle_turn_receipt: decision.merkle_turn_receipt,
      sanitizedInput: decision.sanitized_payload || toolInput,
      result
    };
  }
}

export function createClaudeCodeHook(executor, options = {}) {
  const adapter = new ClaudeCodeAdapter(executor, options);
  return adapter.handleToolInvocation.bind(adapter);
}



