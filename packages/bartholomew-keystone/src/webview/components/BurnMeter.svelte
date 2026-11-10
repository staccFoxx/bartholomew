<script lang="ts">
  export let totalBudget: number = 1000.00;
  export let consumedBudget: number = 420.50;
  export let burnRatePerHour: number = 12.40;
  export let resetTimeRemaining: string = "4h 12m";
  export let maxPerTxn: number = 25.00;
  export let tokensUsed: number = 148200;
  export let tokenCap: number = 1000000;

  $: percentage = Math.min(100, (consumedBudget / totalBudget) * 100);
  $: tokenPercentage = Math.min(100, (tokensUsed / tokenCap) * 100);
  $: isNearCap = percentage > 80;
</script>

<div class="flex flex-col p-5 bg-vscode-card border border-vscode-border rounded-2xl shadow-lg shadow-black/20 font-sans select-none">
  <!-- Header -->
  <div class="flex justify-between items-center mb-3">
    <div class="flex items-center space-x-2">
      <span class="w-2 h-2 rounded-full {isNearCap ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}"></span>
      <span class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Autonomous Spend Governor</span>
    </div>
    <span class="text-[11px] font-mono px-2 py-0.5 rounded {isNearCap ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'}">
      {isNearCap ? 'Cap Warning (>80%)' : 'Nominal & Protected'}
    </span>
  </div>

  <!-- Big Numbers -->
  <div class="flex items-baseline space-x-3 my-2">
    <span class="text-3xl font-mono font-extrabold text-zinc-100 tracking-tight">
      ${consumedBudget.toFixed(2)}
    </span>
    <span class="text-xs font-mono text-zinc-400">
      / ${totalBudget.toFixed(2)} ceiling
    </span>
    <span class="ml-auto text-xs font-mono text-cyan-400 font-semibold">
      {percentage.toFixed(1)}%
    </span>
  </div>

  <!-- Animated Gradient Progress Bar -->
  <div class="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800 my-1 relative">
    <div 
      class="h-full transition-all duration-700 ease-out {isNearCap ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400'}" 
      style="width: {percentage}%"
    ></div>
  </div>

  <!-- Metrics Grid -->
  <div class="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-vscode-border text-xs font-mono">
    <div class="flex flex-col">
      <span class="text-[10px] text-zinc-500 uppercase">Burn Rate</span>
      <span class="text-zinc-200 font-semibold mt-0.5">${burnRatePerHour.toFixed(2)}/hr</span>
    </div>
    <div class="flex flex-col">
      <span class="text-[10px] text-zinc-500 uppercase">Per-Txn Cap</span>
      <span class="text-zinc-200 font-semibold mt-0.5">${maxPerTxn.toFixed(2)} max</span>
    </div>
    <div class="flex flex-col items-end">
      <span class="text-[10px] text-zinc-500 uppercase">Epoch Reset</span>
      <span class="text-zinc-200 font-semibold mt-0.5">{resetTimeRemaining}</span>
    </div>
  </div>

  <!-- Token Budget Micro Bar -->
  <div class="mt-3 pt-2 border-t border-vscode-border/50 flex justify-between items-center text-[10px] font-mono text-zinc-400">
    <span>Token Gauge: {(tokensUsed / 1000).toFixed(0)}k / {(tokenCap / 1000).toFixed(0)}k tokens</span>
    <span class="text-zinc-500">{(tokenPercentage).toFixed(0)}% consumed</span>
  </div>
</div>
