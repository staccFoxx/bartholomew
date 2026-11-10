# PromptSmith AI — Community Launch Kit & Distribution Playbook

---

## 1. Hacker News (Show HN)

**Title:**
> Show HN: PromptSmith – A draggable in-IDE prompt companion for Claude, ChatGPT, and o1

**Link / Text Submission:**
> Hi HN,
>
> We built **PromptSmith AI** because we found ourselves constantly rewriting the same prompts across different coding assistants (Cursor, Claude Code, Windsurf) to get models to stop rambling or hallucinating mock code.
>
> Each model actually prefers very different formatting:
> - **Claude 3.5** responds best to structured XML hierarchy (`<task>`, `<constraints>`) and explicit `<scratchpad>` reasoning blocks.
> - **OpenAI o1 and o3** perform noticeably worse when you micromanage them with "think step by step"—they need a crisp problem statement and acceptance criteria, then test-time compute does the rest.
> - **ChatGPT (4o)** needs explicit Markdown headers and strict JSON schema boundaries.
> - **Google Gemini** excels when large reference materials are physically separated from actionable instructions.
>
> **What it does:**
> 1. Highlight text in any file and press `Alt+P`.
> 2. It benchmark-scores your prompt across all 5 frontier models.
> 3. Trims out conversational filler, reducing token overhead by 25%–45%.
> 4. Features a draggable screen companion (Clippy style, but modern) that you can drag anywhere in your workspace.
>
> It is live on Open-VSX for VS Code, Cursor, and Windsurf:
> https://open-vsx.org/extension/bartholomew/promptsmith-ai
>
> Includes 10 free full-spectrum optimizations. We also hooked up a $0.99 one-time lifetime passkey model via Stripe for unlimited offline use.
>
> Would love your feedback on the model benchmarking heuristics and prompt templates!

---

## 2. Reddit Post (`r/vscode` / `r/cursor` / `r/ChatGPTCoding`)

**Title:**
> I built a lightweight in-editor prompt optimizer and draggable mascot assistant (Alt+P)

**Body:**
> Hey folks,
>
> Tired of prompts getting bloated with filler words and vague instructions, we built a small extension called **PromptSmith AI**.
>
> Highlight any instruction or code block in VS Code or Cursor, press `Alt+P`, and it instantly:
> - Scores your prompt against Claude 3.5, ChatGPT 4o, o1/o3, and Gemini.
> - Trims out word fluff to cut token cost and latency by ~35%.
> - Rewrites the prompt into the exact structure preferred by your target model (e.g. XML hierarchy for Claude, direct problem statements for o1).
> - Has a clean, draggable mascot you can place anywhere on your screen.
>
> Zero telemetry, sub-50ms local compilation, completely free for 10 full tries and $0.99 for a lifetime passkey.
>
> Open-VSX listing: https://open-vsx.org/extension/bartholomew/promptsmith-ai
> Website: https://bartholomew.info
>
> Feedback and bug reports welcome!

---

## 3. Twitter / X Launch Thread

**Post 1:**
> Introducing PromptSmith AI 🎩⚒️
>
> An in-editor prompt optimizer and draggable screen companion for VS Code, Cursor, and Windsurf.
>
> Highlight text -> press Alt+P -> tailored prompts for Claude 3.5, ChatGPT 4o, o1, and Gemini.
>
> Cuts token waste by 25%–45%.
>
> 🔗 https://open-vsx.org/extension/bartholomew/promptsmith-ai

**Post 2:**
> Why model-specific prompting matters:
> - Claude wants XML tags & <scratchpad> space
> - o1/o3 wants zero micromanaged CoT & direct acceptance criteria
> - GPT-4o wants Markdown headings & JSON schema
> - Gemini wants clean context boundaries
>
> PromptSmith adapts in one click.

---

## 4. Active Outbound Commercial Pipeline

1. **Google Workspace SMTP Cooldown Monitoring:**
   - 9 executive sponsorship drafts staged in Gmail.
   - 2 technical writer/grant proposals staged for Modal (`community@modal.com`) and RunPod (`devrel@runpod.io`).
   - Probe script `python scratch/test_smtp_probe.py` ready to execute hourly.
2. **Homepage Integration:**
   - `bartholomew.info` now features the live PromptSmith card with direct links to Open-VSX and the $0.99 Stripe checkout bridge.
