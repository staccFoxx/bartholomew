<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export interface CapabilityRequest {
    id: string;
    agent: string;
    scope: string;
    target: string;
    costUSD?: number;
    timestamp: string;
    hash?: string;
  }

  export let request: CapabilityRequest = {
    id: 'req-01',
    agent: 'Claude Code Agent #3',
    scope: 'shell:exec',
    target: 'npm publish --access public',
    costUSD: 0.00,
    timestamp: 'Just now',
    hash: '8f9a2b4c'
  };

  const dispatch = createEventDispatcher();

  function respond(approved: boolean) {
    dispatch('resolve', { approved, requestId: request.id, target: request.target, scope: request.scope });
  }
</script>

<div class="p-4 rounded-xl bg-vscode-card border border-cyan-500/30 hover:border-cyan-400/50 shadow-lg shadow-cyan-950/20 flex flex-col space-y-3 transition-all select-none">
  <!-- Header -->
  <div class="flex justify-between items-start">
    <div class="flex items-center space-x-2.5">
      <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
      <div>
        <span class="text-xs font-mono text-cyan-400 font-semibold tracking-wide uppercase">{request.agent}</span>
        <h3 class="text-sm font-mono font-bold text-zinc-100 mt-0.5">Capability Scope Request</h3>
      </div>
    </div>
    <div class="flex items-center space-x-1.5">
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
        Pending Auth
      </span>
      <span class="text-[10px] font-mono text-zinc-500">{request.timestamp}</span>
    </div>
  </div>

  <!-- Target Payload Box with Terminal Aesthetic -->
  <div class="p-3 rounded-lg bg-zinc-950 border border-zinc-800/90 font-mono text-xs text-zinc-200 overflow-x-auto flex items-center space-x-2">
    <span class="text-emerald-400 font-bold select-none">&gt;</span>
    <code class="text-zinc-100">{request.target}</code>
  </div>

  <!-- Permission Pills & Security Metadata -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
        Scope: <strong class="text-cyan-300">{request.scope}</strong>
      </span>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-emerald-400 border border-zinc-800 flex items-center space-x-1">
        <span>&bull;</span>
        <span>Merkle Verified</span>
      </span>
    </div>

    {#if request.costUSD && request.costUSD > 0}
      <span class="text-[11px] font-mono text-zinc-400">
        Est: <strong class="text-zinc-200">${request.costUSD.toFixed(2)}</strong>
      </span>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="flex items-center justify-end space-x-2 pt-2.5 border-t border-vscode-border">
    <button 
      on:click={() => respond(false)}
      class="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-300 border border-zinc-700/80 rounded-lg font-mono text-xs transition"
    >
      Deny (Esc)
    </button>
    <button 
      on:click={() => respond(true)}
      class="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-mono text-xs font-semibold transition shadow-md shadow-cyan-950/40 flex items-center space-x-1.5"
    >
      <span>&check;</span>
      <span>Sign &amp; Authorize (&crarr;)</span>
    </button>
  </div>
</div>
