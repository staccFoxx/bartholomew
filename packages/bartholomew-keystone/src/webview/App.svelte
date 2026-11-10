<script lang="ts">
  import { onMount } from 'svelte';
  import BurnMeter from './components/BurnMeter.svelte';
  import GrantCard, { type CapabilityRequest } from './components/GrantCard.svelte';

  declare const acquireVsCodeApi: any;
  const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  let totalBudget: number = 1000.00;
  let consumedBudget: number = 420.50;
  let burnRatePerHour: number = 12.40;
  let resetTimeRemaining: string = "4h 12m";
  let maxPerTxn: number = 25.00;
  let tokensUsed: number = 148200;
  let tokenCap: number = 1000000;

  let activePasskey: any = {
    passkey_id: 'pk-ed25519-7f91a2',
    agent_id: 'claude-swe-autonomous',
    issuer: 'keystone-root-authority',
    status: 'ACTIVE_ARMED',
    latency_us: 11.4,
    writeScopes: ['src/**', 'tests/**', 'docs/**'],
    denyCommands: ['rm -rf', 'mkfs', 'sudo', 'dd', 'curl | sh']
  };

  let pendingRequests: CapabilityRequest[] = [
    {
      id: 'req-shell-01',
      agent: 'Claude Code Agent #3',
      scope: 'shell:exec',
      target: 'npm run build && git push origin main',
      costUSD: 0.00,
      timestamp: '2m ago',
      hash: '8f9a2b4c'
    },
    {
      id: 'req-budget-02',
      agent: 'Cursor Fast Model #1',
      scope: 'budget:spend',
      target: 'Anthropic Claude 3.5 Sonnet Batch (250k tokens)',
      costUSD: 3.75,
      timestamp: 'Just now',
      hash: '3e1c9d7a'
    }
  ];

  let recentReceipts: any[] = [
    { id: 'rcpt-101', action: 'FILE_WRITE', target: 'src/components/Header.tsx', verdict: 'ALLOW', latency_us: 12.1, time: '12s ago' },
    { id: 'rcpt-102', action: 'COMMAND_EXEC', target: 'git status -s', verdict: 'ALLOW', latency_us: 9.8, time: '45s ago' },
    { id: 'rcpt-103', action: 'COMMAND_EXEC', target: 'rm -rf /', verdict: 'VETO_DENY', latency_us: 14.2, time: '2m ago' }
  ];

  onMount(() => {
    window.addEventListener('message', event => {
      const msg = event.data;
      if (!msg) return;

      switch (msg.type) {
        case 'SYNC_KEYSTONE_STATE':
          if (msg.budget) {
            totalBudget = msg.budget.totalBudget ?? totalBudget;
            consumedBudget = msg.budget.consumedBudget ?? consumedBudget;
            burnRatePerHour = msg.budget.burnRatePerHour ?? burnRatePerHour;
            resetTimeRemaining = msg.budget.resetTimeRemaining ?? resetTimeRemaining;
            maxPerTxn = msg.budget.maxPerTxn ?? maxPerTxn;
            tokensUsed = msg.budget.tokensUsed ?? tokensUsed;
            tokenCap = msg.budget.tokenCap ?? tokenCap;
          }
          if (msg.activePasskey) activePasskey = msg.activePasskey;
          if (Array.isArray(msg.pendingRequests)) pendingRequests = msg.pendingRequests;
          if (Array.isArray(msg.recentReceipts)) recentReceipts = msg.recentReceipts;
          break;

        case 'REQUEST_RESOLVED':
          pendingRequests = pendingRequests.filter(r => r.id !== msg.requestId);
          break;
      }
    });

    vscode?.postMessage({ command: 'dashboardReady' });
  });

  function handleResolveRequest(event: CustomEvent<{ approved: boolean; requestId: string; target: string; scope: string }>) {
    const { approved, requestId, target, scope } = event.detail;
    vscode?.postMessage({
      command: 'resolveCapabilityRequest',
      approved,
      requestId,
      target,
      scope
    });
    pendingRequests = pendingRequests.filter(r => r.id !== requestId);
  }

  function handleIssueNewPasskey() {
    vscode?.postMessage({ command: 'issueNewPasskeyPrompt' });
  }

  function handleRevokePasskey() {
    vscode?.postMessage({ command: 'revokePasskeyPrompt' });
  }
</script>

<main class="flex flex-col h-screen w-screen overflow-hidden bg-vscode-bg text-vscode-fg font-sans select-none">
  <!-- Top Navigation Header -->
  <header class="flex items-center justify-between px-6 py-4 border-b border-vscode-border bg-vscode-card">
    <div class="flex items-center space-x-3.5">
      <div class="relative flex items-center justify-center">
        <span class="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="absolute w-6 h-6 rounded-full border border-cyan-400/40 animate-ping"></span>
      </div>
      <div>
        <h1 class="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
          Bartholomew Keystone // Zero-Trust Governance HUD
        </h1>
        <p class="text-[11px] text-zinc-400 font-mono mt-0.5">
          Ed25519 Capability Tokens &bull; Spend Governor &bull; Sub-15&mu;s In-Process Clearance
        </p>
      </div>
    </div>

    <!-- Actions & Status Badges -->
    <div class="flex items-center space-x-3 font-mono text-xs">
      <span class="px-2.5 py-1 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 flex items-center space-x-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        <span>Passkey: {activePasskey ? 'ARMED' : 'UNARMED'}</span>
      </span>

      <button 
        on:click={handleIssueNewPasskey}
        class="px-3.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition shadow-sm"
      >
        + Issue Passkey
      </button>

      {#if activePasskey}
        <button 
          on:click={handleRevokePasskey}
          class="px-3 py-1 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-zinc-700/80 rounded-lg transition"
        >
          Revoke
        </button>
      {/if}
    </div>
  </header>

  <!-- Main Grid Layout -->
  <div class="grid grid-cols-12 flex-1 overflow-hidden p-6 gap-6">
    <!-- Left Column: Spend Governor & Active Passkey -->
    <div class="col-span-5 flex flex-col space-y-5 overflow-y-auto pr-1">
      <!-- Dynamic Budget Burn Meter -->
      <BurnMeter 
        {totalBudget}
        {consumedBudget}
        {burnRatePerHour}
        {resetTimeRemaining}
        {maxPerTxn}
        {tokensUsed}
        {tokenCap}
      />

      <!-- Active Passkey Clearance Card -->
      <div class="p-5 bg-vscode-card border border-vscode-border rounded-2xl flex flex-col space-y-3.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-mono uppercase text-zinc-400 font-bold">Active Capability Scope</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            Ed25519 Signed
          </span>
        </div>

        <div class="space-y-2 text-xs font-mono">
          <div class="flex justify-between">
            <span class="text-zinc-500">Agent ID:</span>
            <span class="text-zinc-200 font-medium">{activePasskey?.agent_id || 'unassigned'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Token ID:</span>
            <span class="text-cyan-400">{activePasskey?.passkey_id || 'none'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-zinc-500">Clearance Latency:</span>
            <span class="text-emerald-400 font-semibold">{activePasskey?.latency_us || 11.4}&mu;s</span>
          </div>
        </div>

        <!-- Scopes -->
        <div class="pt-2 border-t border-vscode-border space-y-2 text-xs font-mono">
          <div>
            <span class="text-[10px] text-zinc-500 uppercase block mb-1">Permitted Write Paths:</span>
            <div class="flex flex-wrap gap-1">
              {#each (activePasskey?.writeScopes || ['src/**', 'tests/**']) as path}
                <span class="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                  {path}
                </span>
              {/each}
            </div>
          </div>

          <div>
            <span class="text-[10px] text-zinc-500 uppercase block mb-1 mt-2">Vetoed Commands:</span>
            <div class="flex flex-wrap gap-1">
              {#each (activePasskey?.denyCommands || ['rm -rf', 'sudo', 'mkfs']) as cmd}
                <span class="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 text-[11px] text-red-300">
                  {cmd}
                </span>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Pending Capability Requests & Audit Receipts -->
    <div class="col-span-7 flex flex-col space-y-6 overflow-y-auto pl-1">
      <!-- Section 1: Pending Capability Requests (GrantCards) -->
      <div>
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Pending Capability Authorizations ({pendingRequests.length})
          </h2>
          <span class="text-[11px] font-mono text-zinc-500">Zero-Trust Approval Gate</span>
        </div>

        {#if pendingRequests.length === 0}
          <div class="p-8 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
            <span class="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-800/60 text-cyan-400 flex items-center justify-center text-sm mb-2">
              &check;
            </span>
            <span class="text-xs font-mono font-bold text-zinc-200">No Pending Elevation Requests</span>
            <p class="text-xs font-mono text-zinc-500 mt-1 max-w-sm">
              Autonomous agents in Cursor and Claude Code are operating strictly within their pre-cleared capability bounds.
            </p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each pendingRequests as req (req.id)}
              <GrantCard request={req} on:resolve={handleResolveRequest} />
            {/each}
          </div>
        {/if}
      </div>

      <!-- Section 2: Live Merkle Audit Receipts Log -->
      <div class="flex-1 flex flex-col">
        <div class="flex justify-between items-center mb-2.5">
          <h2 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Recent Cryptographic Clearance Receipts
          </h2>
          <span class="text-[10px] font-mono text-emerald-400">Ed25519 Verified</span>
        </div>

        <div class="bg-vscode-card border border-vscode-border rounded-xl p-3 flex-1 overflow-y-auto space-y-2">
          {#each recentReceipts as rcpt}
            <div class="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div class="flex items-center space-x-3">
                <span class="w-1.5 h-1.5 rounded-full {rcpt.verdict === 'ALLOW' ? 'bg-emerald-400' : 'bg-red-400'}"></span>
                <span class="text-zinc-300 font-semibold">{rcpt.action}</span>
                <span class="text-zinc-400 text-[11px] truncate max-w-xs">{rcpt.target}</span>
              </div>
              <div class="flex items-center space-x-3 text-[11px]">
                <span class="{rcpt.verdict === 'ALLOW' ? 'text-emerald-400' : 'text-red-400'} font-bold">
                  {rcpt.verdict}
                </span>
                <span class="text-zinc-500">{rcpt.latency_us}&mu;s</span>
                <span class="text-zinc-600">{rcpt.time}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
