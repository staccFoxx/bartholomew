#!/usr/bin/env node

import { spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { scrubSecrets, evaluateToolCall, loadLicense } from '../index.js';

const VERSION = "6.6.2";
const args = process.argv.slice(2);
const command = args[0];

if (command === 'activate') {
  runActivate(args[1]);
} else if (command === 'status') {
  runStatus();
} else if (command === 'test') {
  runSelfTest();
} else if (command === 'install' || command === 'harden') {
  runAutoInstall();
} else if (command === 'config' || command === 'init') {
  runConfig(args[1]);
} else if (command === '--' || (args.length > 0 && !['help', '-h', '--help', '-v', '--version'].includes(command))) {
  const targetArgs = command === '--' ? args.slice(1) : args;
  runProxy(targetArgs);
} else if (command === '-v' || command === '--version') {
  console.log(`mcp-proxy-guard v${VERSION} (BTP Protocol)`);
} else {
  printHelp();
}

function printHelp() {
  console.log(`
\x1b[1m\x1b[36m
        ★ MCP-PROXY-GUARD (BTP v${VERSION}) — ACTIVE ★         
   In-Process Security Gateway & Credential Scrubber for MCP Servers 
\x1b[0m

\x1b[1mUsage:\x1b[0m
  # 1-Line Transparent Wrap for Any MCP Server:
  \x1b[32mnpx mcp-proxy-guard -- <mcp-server-command> [args...]\x1b[0m

\x1b[1mCommands:\x1b[0m
  \x1b[1mmcp-proxy-guard install\x1b[0m               Auto-detect & harden Claude Desktop, Cursor, and Windsurf configs
  \x1b[1mmcp-proxy-guard config [cursor|claude]\x1b[0m Print configuration template for Claude Desktop or Cursor
  \x1b[1mmcp-proxy-guard activate [api_key]\x1b[0m    Configure metered API token for enterprise audit sync
  \x1b[1mmcp-proxy-guard status\x1b[0m                 Inspect active license, audit ledger, and security engine
  \x1b[1mmcp-proxy-guard test\x1b[0m                   Run self-contained security verification suite

\x1b[1mExamples:\x1b[0m
  # Guard the official filesystem MCP server:
  npx mcp-proxy-guard -- npx -y @modelcontextprotocol/server-filesystem ./

  # Guard a Postgres or SQLite MCP server:
  npx mcp-proxy-guard -- npx -y @modelcontextprotocol/server-postgres postgresql://...

  # Auto-harden all local MCP clients:
  npx mcp-proxy-guard install
`);
}

function getMcpConfigPaths() {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const appData = process.env.APPDATA || '';
  const configs = [];

  // Claude Desktop
  if (process.platform === 'win32' && appData) {
    configs.push({ client: 'Claude Desktop (Windows)', path: path.join(appData, 'Claude', 'claude_desktop_config.json') });
  } else if (process.platform === 'darwin' && home) {
    configs.push({ client: 'Claude Desktop (macOS)', path: path.join(home, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json') });
  } else if (home) {
    configs.push({ client: 'Claude Desktop (Linux)', path: path.join(home, '.config', 'Claude', 'claude_desktop_config.json') });
  }

  // Cursor Global & Workspace
  if (home) {
    configs.push({ client: 'Cursor Global Config', path: path.join(home, '.cursor', 'mcp.json') });
  }
  const cwdCursor = path.join(process.cwd(), '.cursor', 'mcp.json');
  if (fs.existsSync(cwdCursor)) {
    configs.push({ client: 'Workspace Cursor (.cursor/mcp.json)', path: cwdCursor });
  }

  // Windsurf
  if (home) {
    configs.push({ client: 'Windsurf Global Config', path: path.join(home, '.codeium', 'windsurf', 'mcp_config.json') });
  }

  return configs;
}

function runAutoInstall() {
  console.log(`\n\x1b[1m[MCP-PROXY-GUARD] AUTO-HARDENING WIZARD (BTP v${VERSION})\x1b[0m`);
  console.log('='.repeat(65));

  const configs = getMcpConfigPaths();
  let totalShielded = 0;
  let configsFound = 0;

  for (const cfg of configs) {
    if (!fs.existsSync(cfg.path)) continue;
    configsFound++;
    console.log(`[*] Discovered ${cfg.client}: ${cfg.path}`);

    try {
      const raw = fs.readFileSync(cfg.path, 'utf8');
      const parsed = JSON.parse(raw);
      const servers = parsed.mcpServers || {};
      let modified = false;

      for (const [serverName, serverCfg] of Object.entries(servers)) {
        if (!serverCfg || typeof serverCfg !== 'object') continue;
        const cmd = serverCfg.command || '';
        const sArgs = serverCfg.args || [];

        // Already shielded
        if (cmd === 'mcp-proxy-guard' || sArgs.includes('mcp-proxy-guard')) {
          console.log(`    [i] Server '${serverName}' is already hardened.`);
          continue;
        }

        // Backup original
        const backupPath = cfg.path + '.bak';
        if (!fs.existsSync(backupPath)) {
          fs.writeFileSync(backupPath, raw, 'utf8');
          console.log(`    [+] Backup created: ${backupPath}`);
        }

        // Shield server: wrap with mcp-proxy-guard
        serverCfg.command = 'npx';
        serverCfg.args = ['-y', 'mcp-proxy-guard', '--', cmd, ...sArgs];
        modified = true;
        totalShielded++;
        console.log(`    [+] Shielded '${serverName}' -> in-process <20µs AST & secret gate active.`);
      }

      if (modified) {
        fs.writeFileSync(cfg.path, JSON.stringify(parsed, null, 2), 'utf8');
        console.log(`[OK] Successfully hardened ${cfg.client}.\n`);
      } else {
        console.log(`[i] No unhardened servers found in ${cfg.client}.\n`);
      }
    } catch (err) {
      console.error(`[!] Error processing ${cfg.path}: ${err.message}\n`);
    }
  }

  if (configsFound === 0) {
    console.log('[-] No default Claude Desktop or Cursor configuration files found in default system paths.');
    console.log('    You can run servers directly: npx mcp-proxy-guard -- <command> [args...]\n');
  } else {
    console.log(`[SUMMARY] Hardened ${totalShielded} MCP server(s) across ${configsFound} configuration(s).`);
    console.log('Zero configuration overhead. In-process <20µs protection is active.\n');
  }
}

function runConfig(target) {
  const type = (target || 'all').toLowerCase();
  console.log(`\n\x1b[1m[MCP-PROXY-GUARD] CLIENT CONFIGURATION GUIDE (BTP v${VERSION})\x1b[0m`);
  console.log('='.repeat(65));

  if (type === 'claude' || type === 'all') {
    console.log(`\n\x1b[1m[1] Claude Desktop (claude_desktop_config.json):\x1b[0m`);
    console.log(JSON.stringify({
      mcpServers: {
        "guarded-filesystem": {
          "command": "npx",
          "args": ["-y", "mcp-proxy-guard", "--", "npx", "-y", "@modelcontextprotocol/server-filesystem", "./"]
        }
      }
    }, null, 2));
  }

  if (type === 'cursor' || type === 'all') {
    console.log(`\n\x1b[1m[2] Cursor (.cursor/mcp.json):\x1b[0m`);
    console.log(JSON.stringify({
      mcpServers: {
        "guarded-terminal": {
          "command": "npx",
          "args": ["-y", "mcp-proxy-guard", "--", "bash"]
        }
      }
    }, null, 2));
  }
  console.log('\nAll commands dispatched through this gateway are checked against Keystone AST invariants in <20 microseconds.\n');
}

function runStatus() {
  const lic = loadLicense();
  console.log(`\n\x1b[1m[MCP-PROXY-GUARD] SECURITY RUNTIME STATUS\x1b[0m`);
  console.log('='.repeat(55));
  console.log(`  * Active Tier         : \x1b[1m\x1b[32m${lic.tier}\x1b[0m (${lic.status})`);
  console.log(`  * In-Process Latency  : <20 microseconds (SLA: compiled byte-scanner)`);
  console.log(`  * In-Flight Scrubbing : Enabled (OpenAI, Anthropic, AWS, GitHub, Stripe, Private Keys)`);
  console.log(`  * Destructive Filter  : Active (rm -rf, DROP TABLE, mkfs, shadow, chmod 777)`);
  console.log(`  * Audit Trail         : ${path.join(process.cwd(), '.btp', 'audit.log')}`);
  console.log(`  * Config Directory    : ${path.join(os.homedir(), '.btp')}\n`);
}

function runSelfTest() {
  console.log(`\n\x1b[1m[MCP-PROXY-GUARD] EXECUTING SELF-TEST\x1b[0m`);
  console.log('='.repeat(55));

  // 1. Test destructive command veto
  const veto = evaluateToolCall('execute_shell', { cmd: 'rm -rf /var/data' });
  console.log(`  [1] Destructive Filter Check : ${!veto.allowed ? '\x1b[32mPASSED (BLOCKED)\x1b[0m' : '\x1b[31mFAILED\x1b[0m'}`);
  console.log(`      Reason: ${veto.reason}`);
  console.log(`      Latency: ${veto.latency_us} µs`);

  // 2. Test in-flight secret scrubber
  const sampleKey = ["sk-proj", "synthetic_test_token_1234567890"].join("-");
  const scrub = scrubSecrets({ payload: `Exporting token ${sampleKey} to logs` });
  const passedScrub = scrub.redactionCount > 0 && !scrub.data.payload.includes("synthetic_test_token");
  console.log(`  [2] In-Flight Secret Scrub   : ${passedScrub ? '\x1b[32mPASSED (SCRUBBED)\x1b[0m' : '\x1b[31mFAILED\x1b[0m'}`);
  console.log(`      Result: ${scrub.data.payload}\n`);
}

function runActivate(key) {
  console.log(`\n\x1b[1m[MCP-PROXY-GUARD] METERED API KEY CONFIGURATION\x1b[0m`);
  console.log('='.repeat(55));

  const btpDir = path.join(os.homedir(), '.btp');
  if (!fs.existsSync(btpDir)) fs.mkdirSync(btpDir, { recursive: true });

  if (key) {
    const cleanKey = key.trim().replace(/^["'`]+|["'`]+$/g, '');
    const tier = cleanKey.startsWith("btp_ent_") || cleanKey.toLowerCase().includes("enterprise") ? "ENTERPRISE_METERED" : "PRO_METERED";
    fs.writeFileSync(path.join(btpDir, 'license.json'), JSON.stringify({
      key: cleanKey,
      tier: tier,
      model: "metered_api_wrap",
      activated_at: Date.now(),
      status: "ACTIVE"
    }, null, 2));
    console.log(`\n\x1b[32m Metered API key configured successfully!\x1b[0m`);
    console.log(`  -> Tier: \x1b[1m${tier}\x1b[0m`);
    console.log(`  -> Mode: Metered Token Consumption ($0.005 / audit receipt)`);
    console.log(`  -> Status: ACTIVE\n`);
    return;
  }

  console.log(`\x1b[32m MCP-PROXY-GUARD Sovereign Local Tier Active (Free Forever)\x1b[0m`);
  console.log(`  All credentials scrubbed in-flight and destructive commands vetoed.`);
  console.log(`  Portal: https://bartholomew.info\n`);
}

function reportMeteredCall(toolName, elapsedUs, allowed) {
  const meterKey = process.env.BTP_METER_KEY || process.env.BTP_API_KEY;
  if (!meterKey) return;

  const endpoint = process.env.BTP_GATEWAY_URL || "https://bartholomew.info/api/meter";
  try {
    const payload = JSON.stringify({
      tool: toolName,
      latency_us: elapsedUs,
      verdict: allowed ? "ALLOW" : "VETO",
      timestamp: Date.now()
    });
    const req = spawn('curl', ['-s', '-X', 'POST', '-H', 'Content-Type: application/json', '-H', `Authorization: Bearer ${meterKey}`, '-d', payload, endpoint], {
      stdio: 'ignore',
      detached: true
    });
    req.unref();
  } catch {}
}

function runProxy(targetArgs) {
  if (!targetArgs || targetArgs.length === 0) {
    console.error("Error: No target MCP server command specified.");
    process.exit(1);
  }

  const [targetCmd, ...cmdArgs] = targetArgs;

  // Spawn child MCP server
  const child = spawn(targetCmd, cmdArgs, {
    stdio: ['pipe', 'pipe', 'inherit'],
    shell: true
  });

  child.on('error', (err) => {
    console.error(`[MCP-PROXY-GUARD ERROR] Failed to start server: ${err.message}`);
    process.exit(1);
  });

  // Client -> Server (stdin)
  const rlClient = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rlClient.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);

      // Intercept tool calls
      if (msg.method === 'tools/call') {
        const params = msg.params || {};
        const toolName = params.name || 'unknown';
        const toolArgs = params.arguments || {};

        // In-process AST & destructive command check (<20µs)
        const check = evaluateToolCall(toolName, toolArgs);
        reportMeteredCall(toolName, check.latency_us, check.allowed);

        if (!check.allowed) {
          const vetoResp = {
            jsonrpc: "2.0",
            id: msg.id,
            error: {
              code: -32000,
              message: check.reason,
              data: {
                receipt: check.receipt_hash,
                latency_us: check.latency_us
              }
            }
          };
          process.stdout.write(JSON.stringify(vetoResp) + '\n');
          return;
        }

        // In-flight credential scrubbing before passing to tool
        const scrubbedArgs = scrubSecrets(toolArgs);
        params.arguments = scrubbedArgs.data;
        line = JSON.stringify(msg);
      }
    } catch {}

    child.stdin.write(line + '\n');
  });

  // Server -> Client (stdout)
  const rlServer = readline.createInterface({ input: child.stdout, terminal: false });
  rlServer.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      // Scrub any leaked credentials in tool responses before Claude/Cursor reads them
      if (msg.result) {
        const scrubbed = scrubSecrets(msg.result);
        msg.result = scrubbed.data;
        line = JSON.stringify(msg);
      }
    } catch {}

    process.stdout.write(line + '\n');
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}
