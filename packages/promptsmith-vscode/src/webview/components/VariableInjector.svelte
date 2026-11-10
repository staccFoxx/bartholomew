<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export interface PromptVariable {
    key: string;
    label: string;
    example: string;
    category: 'context' | 'schema' | 'runtime' | 'agent';
  }

  export let variables: PromptVariable[] = [
    { key: 'code_context', label: 'Code Context', example: 'Current file AST & dependencies', category: 'context' },
    { key: 'error_trace', label: 'Error Trace', example: 'Stack trace from terminal output', category: 'runtime' },
    { key: 'expected_schema', label: 'Expected Schema', example: 'TypeScript interface / Zod schema', category: 'schema' },
    { key: 'rag_chunks', label: 'RAG Chunks', example: 'Vector store search snippets', category: 'context' },
    { key: 'model_persona', label: 'Model Persona', example: 'Senior Staff Distributed Systems Architect', category: 'agent' },
    { key: 'hoare_invariants', label: 'Hoare Invariants', example: 'Pre/post-conditions & loop assertions', category: 'schema' }
  ];

  const dispatch = createEventDispatcher();

  function selectVariable(v: PromptVariable) {
    dispatch('insert', { token: `{{${v.key}}}` });
  }
</script>

<div class="flex flex-col space-y-2 font-mono text-xs select-none">
  <div class="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
    <span>Dynamic Template Variables</span>
    <span>Click to Inject</span>
  </div>

  <div class="flex flex-wrap gap-1.5">
    {#each variables as v}
      <button 
        on:click={() => selectVariable(v)}
        class="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-zinc-300 hover:text-cyan-300 transition text-[11px] flex items-center space-x-1.5 group"
        title="{v.label}: {v.example}"
      >
        <span class="text-cyan-400 font-bold text-[10px] select-none group-hover:scale-110 transition-transform">&#123;&#123;</span>
        <span>{v.key}</span>
        <span class="text-cyan-400 font-bold text-[10px] select-none group-hover:scale-110 transition-transform">&#125;&#125;</span>
      </button>
    {/each}
  </div>
</div>
