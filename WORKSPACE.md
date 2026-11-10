# Bartholomew Suite Monorepo // Operational Architecture

Institutional-grade security, spend governance, and zero-gas prediction market toolchain.

---

## 1. Directory Structure

```
bartholomew/
├── package.json                         # Root workspace configuration & execution pipeline
├── WORKSPACE.md                         # Monorepo architecture & developer workflow guide
├── scripts/
│   ├── sync-ui.js                       # Universal asset sync pipeline
│   └── package_all_vsix.py              # Automated VSIX packager
├── shared-ui-core/                      # Central Svelte + Vite + Tailwind Visual Core
│   ├── package.json
│   ├── vite.config.ts
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── build.cjs                        # Fast headless bundler
│   ├── dist/assets/                     # Compiled asset distribution (index.js & index.css)
│   └── src/
│       ├── main.ts
│       ├── App.svelte                   # Unified Master HUD layout (Tabbed Pro HUD)
│       ├── lib/
│       │   └── vscode.ts                # VS Code Webview API bridge with mock fallback
│       ├── styles/
│       │   └── tailwind.css             # Tailwind design tokens
│       └── components/                  # Core reusable visualization modules
│           ├── RiskGraph.svelte         # Tortuga Bayesian probability curve
│           ├── ThreatRadar.svelte       # Bartholomew Guard AST threat radar
│           ├── BurnMeter.svelte         # Keystone autonomous spend governor
│           ├── TokenDiff.svelte         # PromptSmith token efficiency matrix
│           └── SignalVisualizer.svelte  # Kyro photonic optical DSP oscilloscope
├── packages/
│   ├── vscode-extension/                # Bartholomew Guard (AST security & invariant firewall)
│   ├── bartholomew-keystone/            # Bartholomew Keystone (Ed25519 passkey spend governor)
│   ├── promptsmith-vscode/              # PromptSmith (Prompt engineering & token optimization)
│   ├── bartholomew-trinity/             # Bartholomew Trinity (Autonomous security suite)
│   └── bartholomew-vault/               # Bartholomew Vault (Zero-knowledge secret tokenization)
├── ../prediction-exchange-core/
│   └── axiom-vscode/                    # Tortuga Markets (Prediction engine & work hedging)
└── ../acoustic-cloak/
    └── extensions/vscode/               # Kyro (Photonic DSP & acoustic noise cloaking)
```

---

## 2. Daily Development Workflow Checklist

### Step 1: Iterate on UI Components
Run the Svelte development server inside `shared-ui-core`:
```bash
npm run dev:ui
```
Preview probability curves, spend meters, threat radars, token analyzers, and photonic oscilloscopes with hot module replacement (HMR).

### Step 2: Build & Propagate Across the Suite
When changes are ready to deploy across all extensions, run from the monorepo root:
```bash
npm run release:suite
```
This single command executes:
1. `npm run build:ui`: Compiles the visual core into `shared-ui-core/dist/assets`.
2. `npm run sync:ui`: Distributes the updated assets to all 7 target extension packages.

### Step 3: Package & Test
```bash
# Verify Keystone formal capability proofs
npm run test:keystone

# Package all VSIX bundles
npm run package:all
```

---

## 3. Extension Target Mapping

| Tool | Directory | Primary Component | Capability |
| :--- | :--- | :--- | :--- |
| **Bartholomew Guard** | `packages/vscode-extension` | `ThreatRadar.svelte` | Real-time AST threat radar & automated WorkspaceEdit quickfixes |
| **Bartholomew Keystone** | `packages/bartholomew-keystone` | `BurnMeter.svelte` | Spend governor burn meter & Ed25519 capability passkey grants |
| **Tortuga Markets** | `../prediction-exchange-core/axiom-vscode` | `RiskGraph.svelte` | Bayesian belief update curves & zero-gas work hedging |
| **PromptSmith** | `packages/promptsmith-vscode` | `TokenDiff.svelte` | Token diff efficiency matrix & prompt variable chips |
| **Kyro** | `../acoustic-cloak/extensions/vscode` | `SignalVisualizer.svelte` | 100 GHz optical bus telemetry scope & duplex acoustic cloaking |
| **Trinity** | `packages/bartholomew-trinity` | Unified HUD | Unified autonomous agent security package |
| **Vault** | `packages/bartholomew-vault` | Unified HUD | Tokenized secret rotation & leak defense |
