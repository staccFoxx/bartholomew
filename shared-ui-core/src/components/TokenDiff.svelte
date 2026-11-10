<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let originalTokens: number = 480;
  export let optimizedTokens: number = 312;
  export let reasoningScore: number = 94.5;
  export let costUsd: number = 0.0048;
  export let optimizedCostUsd: number = 0.0031;

  const dispatch = createEventDispatcher();

  $: savedPercent = originalTokens > 0 
    ? (((originalTokens - optimizedTokens) / originalTokens) * 100).toFixed(1)
    : '0.0';

  function handleInject() {
    dispatch('inject');
  }

  function handleCopy() {
    dispatch('copy');
  }
</script>

<div class="p-4 bg-vscode-card border border-vscode-border rounded-xl flex flex-col space-y-4 font-sans select-none shadow-lg shadow-black/20">
  <div class="flex justify-between items-center">
    <div>
      <h3 class="text-sm font-mono font-bold text-zinc-100 flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>PromptSmith // Optimization Matrix</span>
      </h3>
      <p class="text-xs font-mono text-zinc-400 mt-0.5">Frontier Model Token &amp; Reasoning Analyzer</p>
    </div>
    <div class="flex items-center space-x-2">
      <span class="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
        Reasoning: {reasoningScore}%
      </span>
    </div>
  </div>

  <!-- Comparative Metrics Grid -->
  <div class="grid grid-cols-3 gap-3 font-mono">
    <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
      <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Original Tokens</div>
      <div class="text-lg font-bold text-zinc-300 mt-1">{originalTokens}</div>
      <div class="text-[10px] text-zinc-600 mt-0.5">${costUsd.toFixed(4)}</div>
    </div>

    <div class="p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
      <div class="text-[10px] text-zinc-500 uppercase tracking-wider">Optimized Tokens</div>
      <div class="text-lg font-bold text-cyan-400 mt-1">{optimizedTokens}</div>
      <div class="text-[10px] text-cyan-600 mt-0.5">${optimizedCostUsd.toFixed(4)}</div>
    </div>

    <div class="p-3 bg-emerald-950/20 border border-emerald-800/50 rounded-lg">
      <div class="text-[10px] text-emerald-400 uppercase tracking-wider">Efficiency Gain</div>
      <div class="text-lg font-bold text-emerald-400 mt-1">-{savedPercent}%</div>
      <div class="text-[10px] text-emerald-600 mt-0.5">Zero Lost Signal</div>
    </div>
  </div>

  <!-- Action Bar -->
  <div class="flex justify-between items-center pt-2 border-t border-vscode-border">
    <div class="text-[11px] font-mono text-zinc-500">
      Calibrated for: Claude 3.7 &bull; GPT-4o &bull; DeepSeek V3
    </div>
    <div class="flex items-center space-x-2">
      <button 
        on:click={handleCopy}
        class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-lg font-mono text-xs transition"
      >
        Copy Buffer
      </button>
      <button 
        on:click={handleInject}
        class="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold rounded-lg transition shadow-md shadow-cyan-950/40 flex items-center space-x-1.5"
      >
        <span>&check;</span>
        <span>Inject Optimized Prompt</span>
      </button>
    </div>
  </div>
</div>
