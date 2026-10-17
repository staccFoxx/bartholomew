<p align="center">
  <img src="https://acn-26670.web.app/assets/guard_logo.png" width="96" height="96" alt="Bartholomew Guard Logo" />
</p>

# Bartholomew Guard

**Deterministic Execution Firewall for AI Coding Agents**

`[ARMED]` | `[AST FIREWALL]` | `[FAIL-CLOSED]`

---

## What is Bartholomew Guard?
Bartholomew Guard is an in-process security firewall for developers using AI coding assistants like Cursor, Claude Code, Copilot, Cline, and Windsurf.

It inspects agent-generated actions and terminal commands using sub-35µs Abstract Syntax Tree (AST) analysis to block dangerous operations before they can execute.

---

## Why You Need Guard
- **Destructive Command Blocking**: Intercepts `rm -rf`, recursive deletions, disk writes outside the project directory, and rogue shell loops.
- **Safe Pre-Commit Sentinel**: Blocks unauthorized code changes or secret insertions from entering your Git repository.
- **Local AST Validation**: Runs entirely in-process on your machine without sending your proprietary code to third parties.
- **Multi-Assistant Support**: Works with VS Code, Cursor, Windsurf, Claude Code, Copilot, and Cline.

---

## How to Use Guard
1. **Install**: Install Bartholomew Guard from the marketplace.
2. **Automatic Shielding**: Guard detects your project boundaries and automatically activates invariant rules.
3. **Check Safety Status**: View real-time security telemetry and passkey status from the status bar or sidebar.
