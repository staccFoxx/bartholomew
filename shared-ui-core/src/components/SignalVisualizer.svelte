<script lang="ts">
  export let latencyFj: number = 0.85; // <1.0 fJ/MAC
  export let noiseAttenuationDb: number = -48.2;
  export let opticalClockGhz: number = 100;
  export let spanLengthKm: number = 14.2;
  export let isSecured: boolean = true;
</script>

<div class="p-4 bg-vscode-card border border-vscode-border rounded-xl flex flex-col space-y-4 font-mono">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h3 class="text-sm font-bold text-cyan-400">Kyro // Photonic & Acoustic Defense</h3>
      <p class="text-xs text-zinc-400">Mach-Zehnder DSP & Zero-Noise Telemetry</p>
    </div>
    <span class="text-xs px-2 py-0.5 rounded {isSecured ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'} animate-pulse">
      {isSecured ? 'Active Lock' : 'Standby / Bypass'}
    </span>
  </div>

  <!-- Simulated Oscilloscope Waveform Box -->
  <div class="h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 relative flex items-center justify-center overflow-hidden">
    <svg class="w-full h-full overflow-visible" viewBox="0 0 300 100">
      <!-- Grid Lines -->
      <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(113, 113, 122, 0.2)" stroke-width="1" stroke-dasharray="2 2" />
      <line x1="75" y1="0" x2="75" y2="100" stroke="rgba(113, 113, 122, 0.15)" stroke-width="1" stroke-dasharray="2 2" />
      <line x1="150" y1="0" x2="150" y2="100" stroke="rgba(113, 113, 122, 0.15)" stroke-width="1" stroke-dasharray="2 2" />
      <line x1="225" y1="0" x2="225" y2="100" stroke="rgba(113, 113, 122, 0.15)" stroke-width="1" stroke-dasharray="2 2" />
      
      <!-- Waveform Path -->
      <path 
        d="M 0 50 Q 30 10 60 50 T 120 50 T 180 50 T 240 50 T 300 50" 
        fill="none" 
        stroke="rgba(6, 182, 212, 0.85)" 
        stroke-width="2" 
        class="transition-all duration-300"
      />
      <!-- Secondary Harmonic (Optical Phase Delay) -->
      <path 
        d="M 0 50 Q 30 25 60 50 T 120 50 T 180 50 T 240 50 T 300 50" 
        fill="none" 
        stroke="rgba(16, 185, 129, 0.35)" 
        stroke-width="1.5" 
        stroke-dasharray="4 2"
      />
    </svg>
    <div class="absolute bottom-2 left-3 text-[10px] text-zinc-500 font-mono">
      Clock: {opticalClockGhz}GHz Optical Bus // OTN Link Stable ({spanLengthKm}km SMF-28)
    </div>
  </div>

  <!-- Telemetry Metrics -->
  <div class="grid grid-cols-2 gap-3 text-xs">
    <div class="p-2.5 bg-zinc-950 border border-zinc-800 rounded">
      <span class="text-zinc-500 block">Switching Energy</span>
      <span class="text-cyan-400 font-bold text-sm">{latencyFj} fJ/MAC</span>
    </div>
    <div class="p-2.5 bg-zinc-950 border border-zinc-800 rounded">
      <span class="text-zinc-500 block">Noise Attenuation</span>
      <span class="text-emerald-400 font-bold text-sm">{noiseAttenuationDb} dB</span>
    </div>
  </div>
</div>
