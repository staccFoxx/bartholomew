<script lang="ts">
  import { onMount } from 'svelte';
  import { dispatchAction, createMessageListener } from '../lib/bridge';
  import { suiteState } from '../lib/store';

  export let activeModule: string = 'Bartholomew Trinity';
  export let status: string = 'Nominal';
  export let telemetryValue: string = '99.4%';
  export let voiceDuplexActive: boolean = true;
  export let isExpanded: boolean = true;
  export let lastHedgeCommitment: string = '';

  let wavePhase: number = 0;
  let wavePath: string = 'M 0 20 Q 25 5 50 20 T 100 20 T 150 20 T 200 20';

  onMount(() => {
    let animId: number;
    function updateWave() {
      wavePhase += 0.05;
      const pts: string[] = [];
      for (let x = 0; x <= 200; x += 20) {
        const y = 20 + Math.sin(wavePhase + (x * 0.08)) * 12;
        pts.push(`${x} ${y.toFixed(1)}`);
      }
      wavePath = 'M ' + pts.join(' L ');
      animId = requestAnimationFrame(updateWave);
    }
    animId = requestAnimationFrame(updateWave);

    const unsubscribe = createMessageListener((command, payload) => {
      if (command === 'HEDGE_CONFIRMED') {
        status = 'Hedge Active';
        telemetryValue = `${payload.exchange || 'ZK-CLOB'} (${payload.filled || 100} shares)`;
        lastHedgeCommitment = payload.commitment || 'verified';
        suiteState.update(s => ({ ...s, marketConfidence: 0.94 }));
      } else if (command === 'UPDATE_TELEMETRY') {
        if (payload.status) status = payload.status;
        if (payload.telemetryValue) telemetryValue = payload.telemetryValue;
      }
    });

    return () => {
      cancelAnimationFrame(animId);
      unsubscribe();
    };
  });

  function toggleVoice() {
    voiceDuplexActive = !voiceDuplexActive;
    dispatchAction('toggleVoiceDuplex', { active: voiceDuplexActive });
  }

  function executeOverride() {
    dispatchAction('executeSpatialOverride', { module: activeModule });
  }

  function runAttestedHedge() {
    status = 'Attesting Solvency...';
    dispatchAction('executeAttestedHedge', { marketId: 'active-branch', size: 100 });
  }
</script>

<div class="fixed bottom-6 right-6 z-50 font-mono select-none pointer-events-auto">
  <!-- Holographic Floating Frame -->
  <div class="relative bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl shadow-cyan-950/80 w-84 text-cyan-300 transition-all duration-500">
    <!-- Top Scanline Glow -->
    <div class="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>

    <!-- Header / Status Bar -->
    <div class="flex items-center justify-between pb-3 border-b border-cyan-900/50">
      <div class="flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
        <span class="text-[11px] uppercase tracking-widest text-cyan-400 font-bold">
          COMMAND // {activeModule}
        </span>
      </div>
      <button 
        on:click={() => isExpanded = !isExpanded} 
        class="text-[10px] text-zinc-500 hover:text-cyan-300 transition font-bold"
      >
        {isExpanded ? '[MIN]' : '[MAX]'}
      </button>
    </div>

    {#if isExpanded}
      <!-- Holographic Content Stream -->
      <div class="py-3 space-y-2.5 text-xs">
        <div class="flex justify-between items-center bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-900/40">
          <span class="text-zinc-400 text-[11px]">Runtime Status:</span>
          <span class="font-bold text-xs {status === 'Nominal' ? 'text-emerald-400' : 'text-amber-400'}">{status}</span>
        </div>

        <div class="flex justify-between items-center bg-cyan-950/30 p-2.5 rounded-lg border border-cyan-900/40">
          <span class="text-zinc-400 text-[11px]">Core Telemetry:</span>
          <span class="text-cyan-200 font-bold text-xs">{telemetryValue}</span>
        </div>

        <!-- Multi-Extension Suite Telemetry Grid -->
        <div class="grid grid-cols-3 gap-1.5 text-[10px]">
          <div class="p-1.5 bg-slate-900/90 border border-cyan-900/30 rounded text-center">
            <span class="text-zinc-500 block">SPEND</span>
            <span class="text-cyan-400 font-bold">${$suiteState.activeSpend.toFixed(0)}</span>
          </div>
          <div class="p-1.5 bg-slate-900/90 border border-cyan-900/30 rounded text-center">
            <span class="text-zinc-500 block">VAULT</span>
            <span class="text-emerald-400 font-bold">{$suiteState.vaultTokensMasked}</span>
          </div>
          <div class="p-1.5 bg-slate-900/90 border border-cyan-900/30 rounded text-center">
            <span class="text-zinc-500 block">CONF</span>
            <span class="text-cyan-400 font-bold">{($suiteState.marketConfidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        <!-- Mini Vector Waveform -->
        <div class="h-12 bg-slate-900/90 border border-cyan-900/40 rounded-lg flex items-center px-2 overflow-hidden relative">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 200 40">
            <path 
              d={wavePath} 
              fill="none" 
              stroke="rgba(6, 182, 212, 0.85)" 
              stroke-width="1.8" 
            />
          </svg>
          <span class="absolute bottom-1 right-2 text-[8px] text-cyan-500/70 font-mono">100 GHz BUS</span>
        </div>

        <!-- 1-Click ZK Solvency Attested Hedge Trigger -->
        <button 
          on:click={runAttestedHedge}
          class="w-full py-2 px-3 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400 rounded-lg text-cyan-300 font-bold text-[11px] flex items-center justify-center space-x-2 transition shadow-lg shadow-cyan-950/40 cursor-pointer"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>TRIGGER ZK-ATTESTED HEDGE</span>
        </button>
        {#if lastHedgeCommitment}
          <div class="text-[9px] text-zinc-500 text-center font-mono">
            ZK Commitment: <span class="text-cyan-400 font-semibold">{lastHedgeCommitment}</span>
          </div>
        {/if}
      </div>

      <!-- Spatial Quick Actions -->
      <div class="pt-2.5 border-t border-cyan-900/50 flex justify-between items-center text-[10px]">
        <button 
          on:click={toggleVoice}
          class="flex items-center space-x-1 text-zinc-400 hover:text-cyan-300 transition cursor-pointer"
        >
          <span class="w-1.5 h-1.5 rounded-full {voiceDuplexActive ? 'bg-emerald-400' : 'bg-zinc-600'}"></span>
          <span>Voice: {voiceDuplexActive ? 'Listening' : 'Muted'}</span>
        </button>
        <button 
          on:click={executeOverride}
          class="text-cyan-400 font-bold hover:underline transition cursor-pointer"
        >
          Execute Override
        </button>
      </div>
    {/if}
  </div>
</div>
