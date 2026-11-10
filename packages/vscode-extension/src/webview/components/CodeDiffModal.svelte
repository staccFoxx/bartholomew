<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Violation } from './ThreatRadar.svelte';

  export let violation: Violation | null = null;
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch('close');
  }

  function handleConfirm() {
    if (violation) {
      dispatch('confirm', { violation });
    }
  }
</script>

{#if isOpen && violation}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-6 select-none animate-in fade-in duration-200">
    <div class="bg-vscode-bg border border-zinc-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-vscode-border bg-vscode-card">
        <div class="flex items-center space-x-2.5">
          <span class="w-2.5 h-2.5 rounded-full {violation.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'}"></span>
          <div>
            <h2 class="text-xs font-mono font-bold uppercase tracking-wider text-zinc-100">
              QuickFix Remediation Preview // {violation.code}
            </h2>
            <div class="text-[11px] font-mono text-zinc-400">
              {violation.file} (Line {violation.line})
            </div>
          </div>
        </div>
        <button 
          on:click={handleClose}
          class="text-zinc-400 hover:text-white p-1 rounded transition text-sm"
        >
          &times;
        </button>
      </div>

      <!-- Diff Preview Body -->
      <div class="p-6 space-y-4">
        <div>
          <div class="text-xs font-mono text-zinc-400 mb-1">Violation Category:</div>
          <div class="text-sm font-mono font-semibold text-zinc-200">{violation.type}</div>
          {#if violation.description}
            <p class="text-xs text-zinc-400 mt-1">{violation.description}</p>
          {/if}
        </div>

        <div class="border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs">
          <!-- Diff Header -->
          <div class="bg-zinc-900 px-4 py-2 border-b border-zinc-800 text-zinc-400 flex justify-between items-center text-[11px]">
            <span>Unified Diff Preview</span>
            <span class="text-emerald-400 font-bold">+1 / -1</span>
          </div>

          <!-- Diff Lines -->
          <div class="p-4 space-y-2 bg-[#090d16]">
            <!-- Red Original Line -->
            <div class="flex items-start space-x-2 p-2 rounded bg-red-950/40 border border-red-900/50 text-red-200 overflow-x-auto">
              <span class="text-red-400 select-none">-</span>
              <code>{violation.diffOriginal || "// original violating buffer line"}</code>
            </div>

            <!-- Green Replacement Line -->
            <div class="flex items-start space-x-2 p-2 rounded bg-emerald-950/40 border border-emerald-900/50 text-emerald-200 overflow-x-auto">
              <span class="text-emerald-400 select-none">+</span>
              <code>{violation.diffReplacement || "// safe Bartholomew Vault tokenized variant"}</code>
            </div>
          </div>
        </div>

        <div class="p-3 bg-vscode-card rounded-xl border border-vscode-border text-xs text-zinc-400 flex items-center space-x-2">
          <span class="text-emerald-400 font-bold">&check;</span>
          <span>Zero runtime modification risk: AST changes are applied via deterministic VS Code WorkspaceEdit.</span>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 py-4 border-t border-vscode-border bg-vscode-card flex justify-end space-x-3">
        <button 
          on:click={handleClose}
          class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 font-mono text-xs hover:bg-zinc-800 transition"
        >
          Dismiss
        </button>
        <button 
          on:click={handleConfirm}
          class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-medium transition shadow-md shadow-emerald-950/50"
        >
          Apply QuickFix to File
        </button>
      </div>
    </div>
  </div>
{/if}
