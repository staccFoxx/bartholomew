<script lang="ts">
  import { onMount } from 'svelte';
  import ThreatRadar, { type Violation } from './components/ThreatRadar.svelte';
  import CodeDiffModal from './components/CodeDiffModal.svelte';

  declare const acquireVsCodeApi: any;
  const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : null;

  let violations: Violation[] = [
    {
      id: 'v-mock-1',
      type: 'Unbounded Shell Execution',
      file: 'src/cli/deploy.ts',
      severity: 'critical',
      line: 42,
      code: 'BTP-VETO-001',
      description: 'Root recursive deletion or unbounded command invocation intercepted by in-process AST gate.',
      diffOriginal: "exec('rm -rf /tmp/build && ./deploy.sh');",
      diffReplacement: "execFile('./deploy.sh', ['--clean'], { timeout: 30000 });"
    },
    {
      id: 'v-mock-2',
      type: 'Hardcoded API Secret Leak',
      file: 'src/auth/provider.ts',
      severity: 'warning',
      line: 18,
      code: 'BTP-LEAK-001',
      description: 'Plaintext secret key in buffer violates OWASP LLM02. Must tokenize via Bartholomew Vault.',
      diffOriginal: "const apiKey = 'sk-proj-91048102948102948102';",
      diffReplacement: "const apiKey = process.env.OPENAI_API_KEY || '';"
    }
  ];

  let selectedViolationForDiff: Violation | null = null;
  let isDiffModalOpen: boolean = false;
  let nonceActive: boolean = true;
  let latencyMicros: number = 11.8;
  let rulesActive: number = 15;

  onMount(() => {
    // Listen for real-time messages from VS Code Extension Host
    window.addEventListener('message', event => {
      const message = event.data;
      if (!message) return;

      switch (message.type) {
        case 'SYNC_VIOLATIONS':
          if (Array.isArray(message.violations)) {
            violations = message.violations;
          }
          if (message.latencyMicros) latencyMicros = message.latencyMicros;
          if (message.nonceActive !== undefined) nonceActive = message.nonceActive;
          if (message.rulesActive !== undefined) rulesActive = message.rulesActive;
          break;

        case 'VIOLATION_RESOLVED':
          violations = violations.filter(v => v.id !== message.violationId);
          break;
      }
    });

    // Notify extension host that UI is ready
    vscode?.postMessage({ command: 'dashboardReady' });
  });

  function handleQuickFix(event: CustomEvent<{ violation: Violation }>) {
    const v = event.detail.violation;
    vscode?.postMessage({
      command: 'applyQuickFix',
      violationId: v.id,
      code: v.code,
      file: v.file,
      line: v.line
    });
  }

  function handlePreviewDiff(event: CustomEvent<{ violation: Violation }>) {
    selectedViolationForDiff = event.detail.violation;
    isDiffModalOpen = true;
  }

  function handleNavigate(event: CustomEvent<{ file: string; line: number }>) {
    vscode?.postMessage({
      command: 'navigateToCode',
      file: event.detail.file,
      line: event.detail.line
    });
  }

  function handleConfirmDiff(event: CustomEvent<{ violation: Violation }>) {
    const v = event.detail.violation;
    isDiffModalOpen = false;
    vscode?.postMessage({
      command: 'applyQuickFix',
      violationId: v.id,
      code: v.code,
      file: v.file,
      line: v.line
    });
  }

  function handleImmunize() {
    vscode?.postMessage({ command: 'immunizeWorkspace' });
  }
</script>

<main class="flex flex-col h-screen w-screen overflow-hidden bg-vscode-bg">
  <ThreatRadar 
    {violations}
    {nonceActive}
    {latencyMicros}
    {rulesActive}
    on:quickfix={handleQuickFix}
    on:previewDiff={handlePreviewDiff}
    on:navigate={handleNavigate}
    on:immunize={handleImmunize}
  />

  <CodeDiffModal 
    violation={selectedViolationForDiff}
    isOpen={isDiffModalOpen}
    on:close={() => isDiffModalOpen = false}
    on:confirm={handleConfirmDiff}
  />
</main>
