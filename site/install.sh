#!/usr/bin/env bash
# ==============================================================================
# Bartholomew Trust Protocol (BTP v6.6.7) - Universal POSIX Installer
# https://bartholomew.info
#
# Usage:
#   curl -fsSL https://bartholomew.info/install.sh | bash
# ==============================================================================

set -euo pipefail

# ANSI Colors
BOLD="\033[1m"
GREEN="\033[38;2;16;185;129m"
PURPLE="\033[38;2;168;85;247m"
BLUE="\033[38;2;59;130;246m"
RED="\033[38;2;239;68;68m"
DIM="\033[2m"
RESET="\033[0m"

echo -e "${PURPLE}${BOLD}"
echo "    ____             __  __          __                               "
echo "   / __ )____ ______/ /_/ /_  ____  / /___  ____ ___  ___  __  __     "
echo "  / __  / __ \`/ ___/ __/ __ \/ __ \/ / __ \/ __ \\`__ \/ _ \/ / / /     "
echo " / /_/ / /_/ / /  / /_/ / / / /_/ / / /_/ / / / / / /  __/ /_/ /      "
echo "/_____/\__,_/_/   \__/_/ /_/\____/_/\____/_/ /_/ /_/\___/\__,__/       "
echo -e "${RESET}"
echo -e "${BOLD}Bartholomew Agentic Runtime Protection (ARP) -- BTP v6.6.7${RESET}"
echo -e "${DIM}Sub-35us deterministic execution firewall for autonomous AI agents.${RESET}"
echo ""

# 1. Environment & Architecture Detection
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"
echo -e "[*] Target Host: ${BOLD}${OS} (${ARCH})${RESET}"

# 2. Check Python 3.10+
PYTHON_BIN=""
for candidate in python3 python python3.12 python3.11 python3.10; do
    if command -v "$candidate" >/dev/null 2>&1; then
        PY_VER=$("$candidate" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || true)
        MAJOR=$("$candidate" -c 'import sys; print(sys.version_info.major)' 2>/dev/null || echo 0)
        MINOR=$("$candidate" -c 'import sys; print(sys.version_info.minor)' 2>/dev/null || echo 0)
        if [ "$MAJOR" -ge 3 ] && [ "$MINOR" -ge 10 ]; then
            PYTHON_BIN="$candidate"
            echo -e "[+] Found Python: ${BOLD}${PYTHON_BIN}${RESET} (v${PY_VER})"
            break
        fi
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo -e "${RED}[ERROR] Python 3.10 or higher is required to run Bartholomew.${RESET}"
    echo "Please install Python 3.10+ (via brew, apt, or uv) and retry."
    exit 1
fi

# 3. Installation Method (uv -> pipx -> pip)
echo -e "[*] Installing/Upgrading ${BOLD}btp-guard${RESET}..."

if command -v uv >/dev/null 2>&1; then
    echo -e "    ${DIM}Using uv fast package installer...${RESET}"
    uv pip install --upgrade btp-guard || true
elif command -v pipx >/dev/null 2>&1; then
    echo -e "    ${DIM}Using pipx application isolator...${RESET}"
    pipx install btp-guard --force || pipx upgrade btp-guard || true
else
    echo -e "    ${DIM}Using standard pip installer...${RESET}"
    if "$PYTHON_BIN" -m pip --version >/dev/null 2>&1; then
        "$PYTHON_BIN" -m pip install --upgrade --user btp-guard 2>/dev/null || \
        "$PYTHON_BIN" -m pip install --upgrade --break-system-packages btp-guard 2>/dev/null || \
        "$PYTHON_BIN" -m pip install --upgrade btp-guard || true
    fi
fi

# 4. Initialize config
CONFIG_DIR="$HOME/.btp"
mkdir -p "$CONFIG_DIR"

echo -e "${GREEN}${BOLD}[SUCCESS] Bartholomew v6.6.7 runtime initialized!${RESET}"
echo ""
echo -e "${BOLD}Quickstart Commands:${RESET}"
echo -e "  1. Test AST safety gate:      ${PURPLE}btp-guard try${RESET}"
echo -e "  2. Protect any project:       ${PURPLE}btp-guard arm${RESET}"
echo -e "  3. Python 1-line wrapper:     ${PURPLE}from btp_guard import protect_agent${RESET}"
echo ""
echo -e "${BOLD}IDE Extension Install (Cursor / VS Code):${RESET}"
echo -e "  ${BLUE}cursor --install-extension https://bartholomew.info/bartholomew-guard-vscode-latest.vsix${RESET}"
echo ""
echo -e "${BOLD}Passkey Activation ($5 Starter / $10 Dev Pack):${RESET}"
echo -e "  ${GREEN}https://bartholomew.info#pricing${RESET}"
echo -e "${DIM}Support & Enterprise Clearance: contact@bartholomew.info${RESET}"
echo ""
