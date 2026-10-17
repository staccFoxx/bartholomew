<p align="center">
  <img src="https://acn-26670.web.app/assets/keystone_logo.png" width="96" height="96" alt="Bartholomew Keystone Logo" />
</p>

# Bartholomew Keystone

**Cryptographic Passkeys & Spend Governor for Autonomous AI Agents**

`[VERIFIED]` | `[SIGNED TOKENS]` | `[BUDGET GOVERNOR]`

---

## What is Bartholomew Keystone?
Bartholomew Keystone issues time-limited, cryptographically signed passkeys that define exactly what autonomous AI agents are allowed to do.

Instead of giving AI agents unrestricted access to your files, terminal commands, and API spend, Keystone enforces explicit boundary permissions signed with Ed25519 cryptography.

---

## Why You Need Keystone
- **Granular Permissions**: Specify which file paths an agent can edit, which shell commands it can execute, and which networks it can reach.
- **Hard Spend Limits**: Set strict micro-budget caps per tool call and per day to prevent unexpected API bills.
- **Instant Revocation**: Revoke an agent's access in one click if it begins behaving unexpectedly.
- **Cryptographic Audit Log**: Every approved action generates a verifiable signature logged to `.btp/audit.log`.

---

## How to Use Keystone
1. **Install**: Install the Bartholomew Keystone extension.
2. **Issue Passkeys**: Click **Issue Agent Keystone** in the sidebar to generate a signed capability token for your agent session.
3. **Verify Compliance**: Inspect active agent permissions and budget usage directly from the sidebar dashboard.
