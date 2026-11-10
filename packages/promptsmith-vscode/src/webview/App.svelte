<script lang="ts">
  import { onMount } from 'svelte';
  import TokenDiff from './components/TokenDiff.svelte';
  import VariableInjector, { type PromptVariable } from './components/VariableInjector.svelte';

  declare const acquireVsCodeApi: any;
  const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  let rawPrompt: string = "Write a fast python function to parse a large jsonl file and calculate user spend totals. Make sure it doesn't run out of memory.";
  let optimizedPrompt: string = `Role: Senior Distributed Systems Architect
Task: Author streaming chunk-based JSONL parser in Python.
Constraints:
- Generator-based streaming with ijson / orjson
- Memory footprint bounded to O(1) buffer space
- Hoare Invariant: Assert each record matches { user_id: str, amount_usd: float }
- Return generator yielding (user_id, total_spend) sorted in descending order`;

  let originalTokens: number = 28;
  let optimizedTokens: number = 64;
  let reasoningScore: number = 96.2;
  let activeProfile: string = "Reasoning Density";

  const profiles = [
    "Reasoning Density",
    "Cost & Token Squeeze",
    "Hoare Invariant Formalist",
    "Executive Brief"
  ];

  onMount(() => {
    window.addEventListener('message', event => {
      const msg = event.data;
      if (!msg) return;

      switch (msg.type) {
        case 'SYNC_PROMPT_STATE':
          if (msg.rawPrompt !== undefined) rawPrompt = msg.rawPrompt;
          if (msg.optimizedPrompt !== undefined) optimizedPrompt = msg.optimizedPrompt;
          if (msg.originalTokens) originalTokens = msg.originalTokens;
          if (msg.optimizedTokens) optimizedTokens = msg.optimizedTokens;
          if (msg.reasoningScore) reasoningScore = msg.reasoningScore;
          if (msg.activeProfile) activeProfile = msg.activeProfile;
          break;
      }
    });

    vscode?.postMessage({ command: 'dashboardReady' });
  });

  function handleInsertVariable(event: CustomEvent<{ token: string }>) {
    rawPrompt += ' ' + event.detail.token;
    triggerOptimize();
  }

  function triggerOptimize() {
    vscode?.postMessage({
      command: 'optimizePrompt',
      prompt: rawPrompt,
      profile: activeProfile
    });
  }

  function handleInject() {
    vscode?.postMessage({
      command: 'injectOptimizedPrompt',
      text: optimizedPrompt
    });
  }

  function handleCopy() {
    vscode?.postMessage({
      command: 'copyToClipboard',
      text: optimizedPrompt
    });
  }
</script>

<main class="flex flex-col h-screen w-screen overflow-hidden bg-vscode-bg text-vscode-fg font-sans select-none">
  <!-- Header -->
  <header class="flex items-center justify-between px-6 py-4 border-b border-vscode-border bg-vscode-card">
    <div class="flex items-center space-x-3.5">
      <div class="relative flex items-center justify-center">
        <span class="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="absolute w-6 h-6 rounded-full border border-cyan-400/40 animate-ping"></span>
      </div>
      <div>
        <h1 class="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
          PromptSmith // Prompt Engineering Playground
        </h1>
        <p class="text-[11px] text-zinc-400 font-mono mt-0.5">
          Autonomous RLHF Token Equalizer &bull; Sub-Token Precision &bull; Frontier Alignment
        </p>
      </div>
    </div>

    <!-- Profile Selector -->
    <div class="flex items-center space-x-2 font-mono text-xs">
      <span class="text-zinc-500 text-[10px] uppercase">Calibration Profile:</span>
      {#each profiles as prof}
        <button 
          on:click={() => { activeProfile = prof; triggerOptimize(); }}
          class="px-2.5 py-1 rounded-md transition border {activeProfile === prof ? 'bg-cyan-950 text-cyan-300 border-cyan-600 font-semibold shadow-sm' : 'bg-vscode-card text-zinc-400 border-vscode-border hover:border-zinc-700'}"
        >
          {prof}
        </button>
      {/each}
    </div>
  </header>

  <!-- Side-by-Side Workspace Grid -->
  <div class="grid grid-cols-12 flex-1 overflow-hidden p-6 gap-6">
    <!-- Left: Raw Input & Variables -->
    <div class="col-span-5 flex flex-col space-y-4 overflow-hidden">
      <div class="flex justify-between items-center text-xs font-mono text-zinc-400">
        <span class="font-bold uppercase tracking-wider">Input Prompt / Scratchpad</span>
        <span class="text-zinc-500">{rawPrompt.length} chars</span>
      </div>

      <textarea 
        bind:value={rawPrompt}
        on:input={triggerOptimize}
        placeholder="Type or paste prompt to analyze and squeeze..."
        class="flex-1 w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono text-xs focus:outline-none focus:border-cyan-500/70 resize-none leading-relaxed"
      ></textarea>

      <!-- Variable Injector Chips -->
      <VariableInjector on:insert={handleInsertVariable} />
    </div>

    <!-- Right: Optimized Preview & TokenDiff Matrix -->
    <div class="col-span-7 flex flex-col space-y-4 overflow-hidden">
      <!-- Optimization Matrix Metric Card -->
      <TokenDiff 
        {originalTokens}
        {optimizedTokens}
        {reasoningScore}
        on:inject={handleInject}
        on:copy={handleCopy}
      />

      <div class="flex justify-between items-center text-xs font-mono text-zinc-400 mt-2">
        <span class="font-bold uppercase tracking-wider text-cyan-400">Compiled Cognitive Prompt</span>
        <span class="text-zinc-500">Ready for Execution</span>
      </div>

      <!-- Compiled Prompt Output -->
      <div class="flex-1 p-4 rounded-xl bg-zinc-950 border border-zinc-800 overflow-y-auto font-mono text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed select-text">
        {optimizedPrompt}
      </div>
    </div>
  </div>
</main>
