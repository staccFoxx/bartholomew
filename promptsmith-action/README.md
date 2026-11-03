# PromptSmith GitHub Action
### Automated Repository Prompt Optimizer, Token Saver & CI Lint Gate

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-PromptSmith%20Action-yellow.svg?logo=github)](https://github.com/marketplace/actions/promptsmith-token-optimizer)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![Verified Savings](https://img.shields.io/badge/Token%20Savings-30%25%20to%2045%25-brightgreen.svg)](https://bartholomew.info/tools/cursor-token-optimizer)

**PromptSmith Action** automatically audits and optimizes system prompts, evaluation templates, and LLM configuration files in your repository during pull requests. It detects conversational fluff, unstructured instructions, and high-entropy formatting, cutting token consumption by 30-40% per inference call.

---

## Quick Setup

Add the following step to your `.github/workflows/ci.yml` or create `.github/workflows/promptsmith.yml`:

```yaml
name: Prompt Quality & Token Audit

on:
  pull_request:
    paths:
      - 'prompts/**'
      - '**/*.prompt'
      - '**/*.txt'
      - '**/*.json'

jobs:
  audit-prompts:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Run PromptSmith Token Linter
        uses: staccFoxx/bartholomew/promptsmith-action@main
        with:
          path: './prompts'
          token-savings-threshold: '15'
```

---

## What It Does in Your PR

1. **Calculates Token Waste**: Scans all prompt templates for conversational padding, redundant phrasing, and missing boundary conditions.
2. **Generates Precision XML/Markdown Diffs**: Formats instructions into high-attention delimiters (`<instructions>`, `<constraints>`, `<output_format>`) tuned for Claude 3.7, DeepSeek-R1, and o3-mini.
3. **Posts an Instant Audit Summary**:
   ```
   [PromptSmith CI] Scanned 12 prompt templates across repository.
   [+] Estimated token reduction: 34.2% (-1,480 tokens per run)
   [+] Projected monthly API savings: $184.20 USD
   [+] Invariant safety index: 100/100 (Zero unhandled injection vectors)
   ```

---

## Resources & Extensions

- **Interactive Web Studio**: [Launch PromptSmith Studio](https://bartholomew.info/promptsmith)
- **Cursor & VS Code Extension**: [Install via Open VSX](https://open-vsx.org/extension/Bartholomew/promptsmith-ai)
- **Pro Passkey ($0.99 / week)**: [Activate Pro Passkey](https://bartholomew.info/checkout/promptsmith)
- **Support**: help@bartholomew.info
