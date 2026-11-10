<script lang="ts">
  export let confidence: number = 0.5;

  // Compute SVG coordinates based on confidence (0 to 1)
  // We map confidence to the peak offset of the Gaussian curve
  $: peakX = 50 + (confidence * 150);
  $: priorPath = `M 20 180 Q 100 20 180 180`;
  $: posteriorPath = `M 20 180 Q ${peakX} ${20 + (1 - confidence) * 40} 220 180`;
</script>

<div class="w-full h-full flex flex-col justify-between relative">
  <!-- Chart Canvas Overlay -->
  <svg class="w-full h-48 overflow-visible" viewBox="0 0 240 200">
    <!-- Grid Lines -->
    <line x1="20" y1="180" x2="220" y2="180" stroke="var(--vscode-panel-border)" stroke-width="1" />
    <line x1="20" y1="20" x2="20" y2="180" stroke="var(--vscode-panel-border)" stroke-width="1" />
    
    <!-- Prior Distribution Curve (Ghosted) -->
    <path 
      d="M 20 180 Q 110 50 200 180" 
      fill="none" 
      stroke="rgba(113, 113, 122, 0.3)" 
      stroke-width="2" 
      stroke-dasharray="4 4"
    />

    <!-- Posterior Distribution Curve (Active Dynamic Curve) -->
    <path 
      d={posteriorPath} 
      fill="rgba(6, 182, 212, 0.1)" 
      stroke="rgba(6, 182, 212, 0.9)" 
      stroke-width="2.5" 
      class="transition-all duration-700 ease-out"
    />

    <!-- Peak Indicator Dot -->
    <circle 
      cx={peakX} 
      cy={60 + (1 - confidence) * 30} 
      r="4" 
      class="fill-cyan-400 animate-ping"
    />
  </svg>

  <!-- Legend & Metrics -->
  <div class="flex justify-between items-center text-xs font-mono pt-2 border-t border-vscode-border mt-2">
    <div class="flex items-center space-x-3">
      <span class="flex items-center space-x-1 text-zinc-500">
        <span class="w-2 h-2 rounded-full bg-zinc-500 inline-block"></span>
        <span>Prior: 50.0%</span>
      </span>
      <span class="flex items-center space-x-1 text-cyan-400 font-bold">
        <span class="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
        <span>Posterior: {(confidence * 100).toFixed(1)}%</span>
      </span>
    </div>
    <span class="text-zinc-400">Status: Collateralized</span>
  </div>
</div>
