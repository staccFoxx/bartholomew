<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export interface Violation {
    id: string;
    type: string;
    file: string;
    severity: 'critical' | 'warning' | 'info';
    line: number;
    code: string;
    description?: string;
    quickFixText?: string;
    diffOriginal?: string;
    diffReplacement?: string;
  }

  export let violations: Violation[] = [];
  export let nonceActive: boolean = true;
  export let latencyMicros: number = 12.4;
  export let rulesActive: number = 15;

  const dispatch = createEventDispatcher();

  let activeFilter: 'all' | 'critical' | 'warning' = 'all';

  $: criticalCount = violations.filter(v => v.severity === 'critical').length;
  $: warningCount = violations.filter(v => v.severity === 'warning').length;
  $: filteredViolations = activeFilter === 'all' 
    ? violations 
    : violations.filter(v => v.severity === activeFilter);

  function handleQuickFix(v: Violation) {
    dispatch('quickfix', { violation: v });
  }

  function handlePreviewDiff(v: Violation) {
    dispatch('previewDiff', { violation: v });
  }

  function handleNavigate(v: Violation) {
    dispatch('navigate', { file: v.file, line: v.line });
  }
</script>

<div class="flex flex-col h-full bg-vscode-bg text-vscode-fg p-6 font-sans select-none">
  <!-- Header Telemetry HUD -->
  <div class="flex items-center justify-between pb-5 border-b border-vscode-border">
    <div class="flex items-center space-x-3.5">
      <div class="relative flex items-center justify-center">
        <span class="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="absolute w-6 h-6 rounded-full border border-emerald-400/40 animate-ping"></span>
      </div>
      <div>
        <h1 class="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">
          Bartholomew Guard // AST Sentinel Active
        </h1>
        <p class="text-[11px] text-zinc-400 font-mono mt-0.5">
          In-Process CodeAction Firewall &bull; Zero-Latency AST Interceptor ({latencyMicros}&mu;s)
        </p>
      </div>
    </div>

    <!-- Telemetry Badges & Filter Controls -->
    <div class="flex items-center space-x-2 font-mono text-xs">
      <button 
        on:click={() => activeFilter = 'all'}
        class="px-2.5 py-1 rounded transition border {activeFilter === 'all' ? 'bg-zinc-800 text-white border-zinc-500 font-semibold shadow-sm' : 'bg-vscode-card text-zinc-400 border-vscode-border hover:border-zinc-700'}"
      >
        All: {violations.length}
      </button>

      <button 
        on:click={() => activeFilter = 'critical'}
        class="px-2.5 py-1 rounded transition border {activeFilter === 'critical' ? 'bg-red-950 text-red-200 border-red-600 font-semibold shadow-sm' : 'bg-red-950/40 text-red-400 border-red-900/60 hover:border-red-700'}"
      >
        Critical: {criticalCount}
      </button>

      <button 
        on:click={() => activeFilter = 'warning'}
        class="px-2.5 py-1 rounded transition border {activeFilter === 'warning' ? 'bg-amber-950 text-amber-200 border-amber-600 font-semibold shadow-sm' : 'bg-amber-950/40 text-amber-400 border-amber-900/60 hover:border-amber-700'}"
      >
        Warnings: {warningCount}
      </button>

      <div class="h-4 w-px bg-vscode-border mx-1"></div>

      <span class="px-2 py-1 rounded bg-emerald-950/50 text-emerald-300 font-mono border border-emerald-800/80 flex items-center space-x-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>Pillars: {rulesActive} Active</span>
      </span>

      <span class="px-2 py-1 rounded bg-cyan-950/50 text-cyan-300 font-mono border border-cyan-800/80 flex items-center space-x-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        <span>Nonce: {nonceActive ? 'Guarded' : 'Bypassed'}</span>
      </span>
    </div>
  </div>

  <!-- Real-Time Radar Vector Canvas -->
  <div class="my-5 p-4 rounded-xl bg-vscode-card border border-vscode-border flex items-center justify-between">
    <div class="flex items-center space-x-6">
      <!-- Animated Threat Radar Circle -->
      <div class="relative w-20 h-20 flex items-center justify-center">
        <svg class="w-20 h-20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(16, 185, 129, 0.15)" stroke-width="1.5" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(16, 185, 129, 0.25)" stroke-width="1" stroke-dasharray="3 3" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(16, 185, 129, 0.35)" stroke-width="1" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(16, 185, 129, 0.2)" stroke-width="1" />
          <!-- Sweeper Line -->
          <line x1="50" y1="50" x2="88" y2="20" stroke="rgba(52, 211, 153, 0.85)" stroke-width="2" class="origin-center animate-spin" style="animation-duration: 4s;" />
          <!-- Blip Dots -->
          {#if criticalCount > 0}
            <circle cx="68" cy="36" r="3.5" class="fill-red-400 animate-ping" />
            <circle cx="68" cy="36" r="3" class="fill-red-500" />
          {/if}
          {#if warningCount > 0}
            <circle cx="34" cy="62" r="3" class="fill-amber-400" />
          {/if}
          {#if violations.length === 0}
            <circle cx="50" cy="50" r="3" class="fill-emerald-400" />
          {/if}
        </svg>
      </div>

      <div>
        <div class="text-xs font-mono uppercase tracking-wider text-zinc-400">Threat Invariant Radar</div>
        <div class="text-base font-mono font-bold text-zinc-100 mt-0.5">
          {violations.length === 0 ? 'Perimeter Pristine & Bullish' : `${violations.length} Active AST Invariant Anomalies`}
        </div>
        <div class="text-xs text-zinc-400 mt-1">
          {violations.length === 0 
            ? 'All buffer modifications pass 15-pillar cryptographic validation.' 
            : 'Unbounded shell actions, credential leaks, or dynamic execution intercepted before save.'}
        </div>
      </div>
    </div>

    <!-- Quick Action -->
    <div class="flex items-center space-x-3">
      <button 
        on:click={() => dispatch('immunize')}
        class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium rounded-lg transition shadow-md shadow-emerald-950/40 flex items-center space-x-2"
      >
        <span>&bull;</span>
        <span>Immunize Workspace</span>
      </button>
    </div>
  </div>

  <!-- Incident Stream Table Header -->
  <div class="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-wider mb-2.5 px-2">
    <span>Detected AST Violation / Rule</span>
    <span>Target Location &amp; Remediation</span>
  </div>

  <!-- Incident Stream List -->
  <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
    {#if filteredViolations.length === 0}
      <div class="h-44 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-xl text-center p-6">
        <div class="w-8 h-8 rounded-full bg-emerald-950/50 border border-emerald-600/40 flex items-center justify-center text-emerald-400 mb-2">
          &check;
        </div>
        <div class="text-xs font-mono font-bold text-zinc-200">Zero Security Invariant Violations</div>
        <div class="text-xs text-zinc-500 font-mono mt-1 max-w-sm">
          In-process AST parser is scanning editor keystrokes continuously. No API leaks, shell injections, or malicious evaluations found.
        </div>
      </div>
    {:else}
      {#each filteredViolations as v (v.id)}
        <div class="p-4 rounded-xl bg-vscode-card border border-vscode-border hover:border-emerald-500/40 transition-all flex items-center justify-between group">
          <div class="flex items-start space-x-3.5">
            <span class="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 {v.severity === 'critical' ? 'bg-red-500 shadow-md shadow-red-500/50' : 'bg-amber-400 shadow-md shadow-amber-400/50'}"></span>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-mono font-semibold text-zinc-100">{v.type}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-mono {v.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
                  {v.code}
                </span>
              </div>
              <button 
                on:click={() => handleNavigate(v)}
                class="text-xs font-mono text-zinc-400 hover:text-cyan-400 transition mt-1 text-left flex items-center space-x-1"
              >
                <span>&rarr;</span>
                <span class="underline decoration-zinc-700 underline-offset-2">{v.file}</span>
                <span class="text-zinc-500">: line {v.line}</span>
              </button>
              {#if v.description}
                <p class="text-xs text-zinc-400 font-sans mt-1 max-w-xl">{v.description}</p>
              {/if}
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button 
              on:click={() => handlePreviewDiff(v)}
              class="px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded-lg font-mono text-xs transition"
            >
              Inspect Diff
            </button>
            <button 
              on:click={() => handleQuickFix(v)}
              class="px-3.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-600/50 hover:border-emerald-500 rounded-lg font-mono text-xs font-medium transition shadow-sm"
            >
              Apply QuickFix
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
