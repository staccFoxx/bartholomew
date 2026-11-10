<script lang="ts">
  import { onMount } from 'svelte';
  import RiskGraph from './components/RiskGraph.svelte';
  import ThreatRadar, { type Violation } from './components/ThreatRadar.svelte';
  import BurnMeter from './components/BurnMeter.svelte';
  import TokenDiff from './components/TokenDiff.svelte';
  import SignalVisualizer from './components/SignalVisualizer.svelte';
  import { dispatchAction } from './lib/vscode';

  type TabId = 'tortuga' | 'guard' | 'keystone' | 'promptsmith' | 'kyro';
  let activeTab: TabId = 'tortuga';

  // Tortuga State
  let confidence: number = 0.742;

  // Guard State
  let violations: Violation[] = [
    {
      id: 'v-1',
      type: 'Unbounded Shell Execution',
      file: 'src/cli/deploy.ts',
      severity: 'critical',
      line: 42,
      code: 'BTP-VETO-001',
      description: 'Root command invocation intercepted by in-process AST gate.'
    },
    {
      id: 'v-2',
      type: 'Hardcoded API Secret Leak',
      file: 'src/auth/provider.ts',
      severity: 'warning',
      line: 18,
      code: 'BTP-LEAK-001',
      description: 'Plaintext secret key in buffer violates OWASP LLM02.'
    }
  ];

  // Keystone State
  let totalBudget: number = 1000.00;
  let consumedBudget: number = 420.50;
  let burnRatePerHour: number = 12.40;
  let resetTimeRemaining: string = "4h 12m";
  let maxPerTxn: number = 25.00;
  let tokensUsed: number = 148200;
  let tokenCap: number = 1000000;

  // PromptSmith State
  let originalTokens: number = 480;
  let optimizedTokens: number = 312;
  let reasoningScore: number = 94.5;

  // Kyro State
  let latencyFj: number = 0.85;
  let noiseAttenuationDb: number = -48.2;
  let isShieldActive: boolean = true;

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg) return;

      switch (msg.command || msg.type) {
        case 'UPDATE_CONFIDENCE':
          if (msg.payload?.confidence !== undefined) confidence = msg.payload.confidence;
          break;
        case 'SYNC_VIOLATIONS':
          if (Array.isArray(msg.violations)) violations = msg.violations;
          break;
        case 'UPDATE_BUDGET':
          if (msg.payload?.consumedBudget !== undefined) consumedBudget = msg.payload.consumedBudget;
          break;
        case 'UPDATE_TELEMETRY':
          if (msg.payload?.latencyFj !== undefined) latencyFj = msg.payload.latencyFj;
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    dispatchAction('dashboardReady');

    return () => window.removeEventListener('message', handleMessage);
  });

  function selectTab(tab: TabId) {
    activeTab = tab;
  }
</script>

<main class="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
  <!-- Master Navigation Header -->
  <header class="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90">
    <div class="flex items-center space-x-3">
      <span class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
      <h1 class="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
        Bartholomew // Unified Visual Core (Pro HUD)
      </h1>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
        v7.1.0
      </span>
    </div>

    <!-- Navigation Pills -->
    <nav class="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg font-mono text-xs">
      <button 
        on:click={() => selectTab('tortuga')}
        class="px-3 py-1 rounded transition {activeTab === 'tortuga' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
        Tortuga
      </button>
      <button 
        on:click={() => selectTab('guard')}
        class="px-3 py-1 rounded transition {activeTab === 'guard' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
        Guard
      </button>
      <button 
        on:click={() => selectTab('keystone')}
        class="px-3 py-1 rounded transition {activeTab === 'keystone' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
        Keystone
      </button>
      <button 
        on:click={() => selectTab('promptsmith')}
        class="px-3 py-1 rounded transition {activeTab === 'promptsmith' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
        PromptSmith
      </button>
      <button 
        on:click={() => selectTab('kyro')}
        class="px-3 py-1 rounded transition {activeTab === 'kyro' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}">
        Kyro
      </button>
    </nav>
  </header>

  <!-- Dynamic Content Deck -->
  <div class="flex-1 p-6 overflow-y-auto">
    {#if activeTab === 'tortuga'}
      <div class="max-w-4xl mx-auto space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-sm font-mono font-bold text-slate-200">Tortuga // Bayesian Work Hedging</h2>
            <p class="text-xs font-mono text-slate-400">Zero-gas prediction market distribution</p>
          </div>
          <button 
            on:click={() => dispatchAction('runBayesUpdate', { confidence: Math.min(0.98, confidence + 0.05) })}
            class="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs rounded transition">
            Run Bayes Filter
          </button>
        </div>
        <div class="p-4 bg-slate-900 border border-slate-800 rounded-xl h-64 flex items-center justify-center">
          <RiskGraph {confidence} />
        </div>
      </div>
    {:else if activeTab === 'guard'}
      <div class="max-w-4xl mx-auto space-y-4">
        <ThreatRadar 
          {violations} 
          nonceActive={true} 
          latencyMicros={11.8} 
          rulesActive={15} 
        />
      </div>
    {:else if activeTab === 'keystone'}
      <div class="max-w-4xl mx-auto space-y-4">
        <BurnMeter 
          {totalBudget} 
          {consumedBudget} 
          {burnRatePerHour} 
          {resetTimeRemaining} 
          {maxPerTxn} 
          {tokensUsed} 
          {tokenCap} 
        />
      </div>
    {:else if activeTab === 'promptsmith'}
      <div class="max-w-4xl mx-auto space-y-4">
        <TokenDiff 
          {originalTokens} 
          {optimizedTokens} 
          {reasoningScore} 
        />
      </div>
    {:else if activeTab === 'kyro'}
      <div class="max-w-4xl mx-auto space-y-4">
        <SignalVisualizer 
          {latencyFj} 
          {noiseAttenuationDb} 
          opticalClockGhz={100} 
          spanLengthKm={14.2} 
          isSecured={isShieldActive} 
        />
      </div>
    {/if}
  </div>
</main>
