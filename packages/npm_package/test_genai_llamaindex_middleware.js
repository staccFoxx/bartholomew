import assert from 'assert';
import {
  GoogleGenAIMiddleware,
  LlamaIndexMiddleware,
  createGoogleGenAIMiddleware,
  createLlamaIndexWorkflowMiddleware,
  ClaudeCodeAdapter
} from './universal_adapters.js';

console.log('[*] Running Bartholomew Google GenAI & LlamaIndex Middleware Test Suite...');

async function testGoogleGenAIMiddleware() {
  console.log('  Testing GoogleGenAIMiddleware...');
  const genai = createGoogleGenAIMiddleware();

  // 1. Safe function call
  const safeCall = genai.interceptFunctionCall({
    name: 'fetch_weather_forecast',
    args: { city: 'Denver', days: 5 }
  });
  assert.strictEqual(safeCall.allowed, true, 'Safe tool call must be allowed');
  assert.strictEqual(safeCall.verdict, 'ALLOW');
  assert.ok(safeCall.merkle_turn_receipt, 'Must generate merkle receipt');
  console.log('    [PASS] Safe Gemini function call allowed with Merkle receipt');

  // 2. Destructive command interception
  const dangerousCall = genai.interceptFunctionCall({
    name: 'execute_command',
    args: { command: 'rm -rf / --no-preserve-root' }
  });
  assert.strictEqual(dangerousCall.allowed, false, 'Destructive command must be vetoed');
  assert.strictEqual(dangerousCall.verdict, 'VETO');
  assert.ok(dangerousCall.error.includes('[BTP VETO]'), 'Must return formatted veto error');
  console.log('    [PASS] Destructive Gemini tool call vetoed fail-closed');

  // 3. Tool wrapper
  const testTool = async (args) => `Processed: ${args.query}`;
  const guardedTool = genai.wrapToolFunction(testTool, 'search_docs');
  const safeResult = await guardedTool({ query: 'construction code section 12' });
  assert.strictEqual(safeResult, 'Processed: construction code section 12');
  console.log('    [PASS] Guarded tool wrapper passes valid invocation');

  let vetoCaught = false;
  const dangerousWrappedTool = genai.wrapToolFunction(testTool, 'system_exec');
  try {
    await dangerousWrappedTool({ command: 'rm -rf /' });
  } catch (err) {
    vetoCaught = true;
    assert.ok(err.message.includes('[BTP VETO]'), 'Must throw BTP VETO error');
  }
  assert.strictEqual(vetoCaught, true, 'Dangerous call must throw error');
  console.log('    [PASS] Guarded tool wrapper throws on veto');

  let sqlVetoCaught = false;
  const dangerousSqlTool = genai.wrapToolFunction(testTool, 'sql_query');
  try {
    await dangerousSqlTool({ query: 'DROP TABLE users;' });
  } catch (err) {
    sqlVetoCaught = true;
    assert.ok(err.message.includes('[BTP VETO]'), 'Must throw SQL BTP VETO error');
  }
  assert.strictEqual(sqlVetoCaught, true, 'Dangerous SQL query must throw error');
  console.log('    [PASS] Guarded SQL tool wrapper throws on veto');
}

async function testLlamaIndexMiddleware() {
  console.log('  Testing LlamaIndexMiddleware...');
  const llama = createLlamaIndexWorkflowMiddleware();

  // 1. Safe workflow step
  const safeStep = llama.interceptWorkflowStep('retrieve_documents', { query: 'building permits' });
  assert.strictEqual(safeStep.proceed, true, 'Safe workflow step must proceed');
  assert.strictEqual(safeStep.verdict, 'ALLOW');
  console.log('    [PASS] Safe workflow step approved');

  // 2. Destructive workflow step
  const dangerousStep = llama.interceptWorkflowStep('execute_command', { command: 'mkfs.ext4 /dev/sda1' });
  assert.strictEqual(dangerousStep.proceed, false, 'Destructive step must be blocked');
  assert.ok(dangerousStep.verdict === 'DENY' || dangerousStep.verdict === 'VETO', 'Verdict must be DENY or VETO');
  console.log('    [PASS] Destructive workflow step intercepted');

  // 3. Tool wrapping
  const mockLlamaTool = {
    metadata: { name: 'terminal_command' },
    call: async (args) => `Executed ${args.command}`
  };
  const wrappedLlamaTool = llama.wrapTool(mockLlamaTool);

  let caught = false;
  try {
    await wrappedLlamaTool.call({ command: 'rm -rf /projects' });
  } catch (e) {
    caught = true;
    assert.ok(e.message.includes('[BTP VETO]'));
  }
  assert.strictEqual(caught, true, 'Tool invocation with destructive command must throw');
  console.log('    [PASS] Wrapped LlamaIndex tool intercepted destructive invocation');
}

async function testClaudeCodeAdapter() {
  console.log('  Testing ClaudeCodeAdapter...');
  const executor = async (tool, input) => `Ran ${tool}`;
  const claude = new ClaudeCodeAdapter(executor);

  // 1. Safe tool call (Bash with safe command)
  const safeRes = await claude.handleToolInvocation('Bash', { command: 'git status' });
  assert.strictEqual(safeRes.allowed, true, 'Safe git status must be allowed');
  assert.strictEqual(safeRes.verdict, 'ALLOW');
  assert.ok(safeRes.merkle_turn_receipt, 'Receipt must be generated');
  console.log('    [PASS] Safe Claude Code Bash invocation allowed with Merkle receipt');

  // 2. Destructive Bash tool call
  const vetoRes = await claude.handleToolInvocation('Bash', { command: 'rm -rf / --no-preserve-root' });
  assert.strictEqual(vetoRes.allowed, false, 'Destructive command must be vetoed');
  assert.strictEqual(vetoRes.verdict, 'VETO');
  console.log('    [PASS] Destructive Claude Code Bash command vetoed fail-closed');

  // 3. Sensitive file access / secret exfiltration
  const fileRes = await claude.handleToolInvocation('FileEdit', { path: '/etc/shadow' });
  assert.strictEqual(fileRes.allowed, false, 'Access to /etc/shadow must be vetoed');
  console.log('    [PASS] Sensitive credential path access vetoed fail-closed');

  // 4. Destructive SQL / Database drop
  const dropRes = await claude.handleToolInvocation('db_query', { query: 'DROP DATABASE production;' });
  assert.strictEqual(dropRes.allowed, false, 'SQL drop must be vetoed');
  console.log('    [PASS] Destructive DDL command vetoed fail-closed');
}

async function run() {
  await testGoogleGenAIMiddleware();
  await testLlamaIndexMiddleware();
  await testClaudeCodeAdapter();
  console.log('\n[+] ALL GOOGLE GENAI, LLAMINDEX & CLAUDE CODE MIDDLEWARE TESTS PASSED (100% RELIABILITY)!');
}

run().catch((err) => {
  console.error('[FAIL] Test suite error:', err);
  process.exit(1);
});
