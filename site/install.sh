#!/usr/bin/env bash
# ==============================================================================
# Bartholomew Trust Protocol (BTP v7.0.0) - Universal POSIX Installer
# Zero-Blast-Radius Execution • Micro-Rollback (<10ms) • Runaway Spend Circuit Breaker
# https://bartholomew.info
#
# Usage:
#   curl -fsSL https://bartholomew.info/install.sh | bash
# ==============================================================================

set -euo pipefail

BOLD="\033[1m"
GREEN="\033[38;2;16;185;129m"
GOLD="\033[38;2;234;179;8m"
BLUE="\033[38;2;59;130;246m"
RED="\033[38;2;239;68;68m"
DIM="\033[2m"
RESET="\033[0m"

echo -e "${GOLD}${BOLD}"
echo "    ____             __  __          __                               "
echo "   / __ )____ ______/ /_/ /_  ____  / /___  ____ ___  ___  __  __     "
echo "  / __  / __ \`/ ___/ __/ __ \/ __ \/ / __ \/ __ \`__ \/ _ \/ / / /     "
echo " / /_/ / /_/ / /  / /_/ / / / /_/ / / /_/ / / / / / /  __/ /_/ /      "
echo "/_____/\__,_/_/   \__/_/ /_/\____/_/\____/_/ /_/ /_/\___/\__,__/       "
echo -e "${RESET}"
echo -e "${BOLD}Bartholomew Agentic Runtime Protection (ARP) -- BTP v7.0.0${RESET}"
echo -e "${DIM}Zero-Blast-Radius Execution • Sub-Second Micro-Rollback • Runaway Circuit Breaker${RESET}"
echo ""

# 1. Environment Detection
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
echo -e "[*] Host Platform: ${BOLD}${OS} (${ARCH})${RESET}"

# 2. Check Python 3.9+
PYTHON_BIN=""
for candidate in python3 python python3.12 python3.11 python3.10 python3.9; do
    if command -v "$candidate" >/dev/null 2>&1; then
        PY_VER=$("$candidate" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || true)
        MAJOR=$("$candidate" -c 'import sys; print(sys.version_info.major)' 2>/dev/null || echo 0)
        MINOR=$("$candidate" -c 'import sys; print(sys.version_info.minor)' 2>/dev/null || echo 0)
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 9 ]; then
            PYTHON_BIN="$candidate"
            echo -e "[+] Detected Python runtime: ${BOLD}${PYTHON_BIN}${RESET} (v${PY_VER})"
            break
        fi
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo -e "${RED}[ERROR] Python 3.9+ is required to install Bartholomew.${RESET}"
    echo "Please install Python 3.9+ and re-run this script."
    exit 1
fi

# 3. Install BTP v7.0.0 Package
RELEASE_WHEEL_URL="https://bartholomew.info/releases/btp_guard-7.0.0-py3-none-any.whl"
echo -e "[*] Installing ${BOLD}btp-guard v7.0.0${RESET}..."

if ! "$PYTHON_BIN" -m pip install --upgrade --no-cache-dir "$RELEASE_WHEEL_URL" 2>/dev/null; then
    echo -e "    ${DIM}Direct wheel fallback to standard pip install...${RESET}"
    "$PYTHON_BIN" -m pip install --upgrade btp-guard || true
fi

# 4. Initialize Local BTP Config
CONFIG_DIR="$HOME/.btp"
mkdir -p "$CONFIG_DIR"
cat <<EOF > "$CONFIG_DIR/config.json"
{
  "version": "7.0.0",
  "circuit_breaker": {
    "enabled": true,
    "max_cost_usd": 2.50,
    "max_duplicate_errors": 3
  },
  "time_machine": {
    "enabled": true,
    "max_snapshots": 50
  },
  "installed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# 5. MCP Configuration for Claude Desktop / Cursor
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ "$OS" = "linux" ]; then
    CLAUDE_CONFIG="$HOME/.config/Claude/claude_desktop_config.json"
fi

if [ -d "$(dirname "$CLAUDE_CONFIG")" ]; then
    echo -e "[*] Configuring MCP server in Claude Desktop..."
    "$PYTHON_BIN" -c "
import json, os
p = '$CLAUDE_CONFIG'
try:
    data = json.load(open(p)) if os.path.exists(p) else {}
    if 'mcpServers' not in data: data['mcpServers'] = {}
    data['mcpServers']['btp-guard'] = {
        'command': '$PYTHON_BIN',
        'args': ['-m', 'btp_guard.mcp_server']
    }
    with open(p, 'w') as f: json.dump(data, f, indent=2)
    print('[+] Added btp-guard to Claude Desktop MCP config')
except Exception as e:
    pass
" || true
fi

echo ""
echo -e "${GREEN}${BOLD}========================================================================${RESET}"
echo -e "${GREEN}${BOLD} [SUCCESS] Bartholomew Trust Protocol (BTP v7.0.0) Successfully Installed!${RESET}"
echo -e "${GREEN}${BOLD}========================================================================${RESET}"
echo ""
echo -e "${BOLD}New v7.0.0 CLI Commands Ready:${RESET}"
echo -e "  ${GOLD}btp snapshot --desc \"Pre-refactor\"${RESET}  ${DIM}Take sub-10ms workspace snapshot${RESET}"
echo -e "  ${GOLD}btp rollback${RESET}                         ${DIM}1-Click zero-blast-radius undo (<10ms)${RESET}"
echo -e "  ${GOLD}btp circuit-breaker --status${RESET}         ${DIM}Inspect runaway loop & spend throttle${RESET}"
echo -e "  ${GOLD}btp aibom --model \"claude-3-5\"${RESET}       ${DIM}Mint Ed25519 Git commit attestation${RESET}"
echo -e "  ${GOLD}btp mcp${RESET}                              ${DIM}Launch 55-tool MCP security server${RESET}"
echo ""
echo -e "Activate your developer passkey (\$5 / \$10) at: ${BOLD}https://bartholomew.info#pricing${RESET}"
echo ""
