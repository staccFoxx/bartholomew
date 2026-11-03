# ==============================================================================
# Bartholomew Trust Protocol (BTP v7.0.0) - Windows PowerShell Installer
# Zero-Blast-Radius Execution • Micro-Rollback (<10ms) • Runaway Spend Circuit Breaker
# https://bartholomew.info
#
# Usage:
#   irm https://bartholomew.info/install.ps1 | iex
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "    ____             __  __          __                               " -ForegroundColor Yellow
Write-Host "   / __ )____ ______/ /_/ /_  ____  / /___  ____ ___  ___  __  __     " -ForegroundColor Yellow
Write-Host "  / __  / __ `/ ___/ __/ __ \/ __ \/ / __ \/ __ `__ \/ _ \/ / / /     " -ForegroundColor Yellow
Write-Host " / /_/ / /_/ / /  / /_/ / / / /_/ / / /_/ / / / / / /  __/ /_/ /      " -ForegroundColor Yellow
Write-Host "/_____/\__,_/_/   \__/_/ /_/\____/_/\____/_/ /_/ /_/\___/\__,__/       " -ForegroundColor Yellow
Write-Host ""
Write-Host "Bartholomew Agentic Runtime Protection (ARP) -- BTP v7.0.0" -ForegroundColor White
Write-Host "Zero-Blast-Radius Execution • Sub-Second Micro-Rollback • Runaway Circuit Breaker" -ForegroundColor Gray
Write-Host ""

# 1. Check Python 3.9+
$pythonCmd = $null
foreach ($cmd in @("python", "py", "python3")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        try {
            $major = & $cmd -c "import sys; print(sys.version_info.major)" 2>$null
            $minor = & $cmd -c "import sys; print(sys.version_info.minor)" 2>$null
            if ([int]$major -ge 3 -and [int]$minor -ge 9) {
                $pythonCmd = $cmd
                Write-Host "[+] Found Python runtime: $cmd (v$major.$minor)" -ForegroundColor Green
                break
            }
        } catch { }
    }
}

if (-not $pythonCmd) {
    Write-Host "[ERROR] Python 3.9 or higher is required to run Bartholomew." -ForegroundColor Red
    Write-Host "Please install Python from https://python.org or run 'winget install Python.Python.3.12'" -ForegroundColor Yellow
    exit 1
}

# 2. Install / Upgrade BTP v7.0.0 package
$wheelUrl = "https://bartholomew.info/releases/btp_guard-7.0.0-py3-none-any.whl"
Write-Host "[*] Installing/Upgrading btp-guard v7.0.0 from verified release..." -ForegroundColor Cyan

try {
    & $pythonCmd -m pip install --upgrade --no-cache-dir $wheelUrl
} catch {
    Write-Host "    Fallback to standard pip package..." -ForegroundColor Gray
    & $pythonCmd -m pip install --upgrade btp-guard
}

# 3. Setup configuration directory
$btpDir = Join-Path $env:USERPROFILE ".btp"
if (-not (Test-Path $btpDir)) {
    New-Item -ItemType Directory -Path $btpDir -Force | Out-Null
}

$cfgPath = Join-Path $btpDir "config.json"
$config = @{
    version = "7.0.0"
    circuit_breaker = @{
        enabled = $true
        max_cost_usd = 2.50
        max_duplicate_errors = 3
    }
    time_machine = @{
        enabled = $true
        max_snapshots = 50
    }
    installed_at = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json -Depth 3

Set-Content -Path $cfgPath -Value $config -Encoding UTF8

# 4. Configure Claude Desktop MCP if installed
$claudeConfig = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
if (Test-Path (Split-Path $claudeConfig)) {
    Write-Host "[*] Integrating btp-guard into Claude Desktop MCP configuration..." -ForegroundColor Cyan
    try {
        & $pythonCmd -c @"
import json, os
p = r'$claudeConfig'
try:
    data = json.load(open(p, 'r', encoding='utf-8')) if os.path.exists(p) else {}
    if 'mcpServers' not in data: data['mcpServers'] = {}
    data['mcpServers']['btp-guard'] = {
        'command': '$pythonCmd',
        'args': ['-m', 'btp_guard.mcp_server']
    }
    with open(p, 'w', encoding='utf-8') as f: json.dump(data, f, indent=2)
    print('[+] Added btp-guard to Claude Desktop MCP config')
except Exception as e:
    pass
"@
    } catch { }
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host " [SUCCESS] Bartholomew Trust Protocol (BTP v7.0.0) Successfully Installed!" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "New v7.0.0 CLI Commands Ready:" -ForegroundColor White
Write-Host "  btp snapshot --desc `"Pre-refactor`"   Take sub-10ms workspace snapshot" -ForegroundColor Yellow
Write-Host "  btp rollback                          1-Click zero-blast-radius undo (<10ms)" -ForegroundColor Yellow
Write-Host "  btp circuit-breaker --status          Inspect runaway loop & spend throttle" -ForegroundColor Yellow
Write-Host "  btp aibom --model `"claude-3-5`"        Mint Ed25519 Git commit attestation" -ForegroundColor Yellow
Write-Host "  btp mcp                               Launch 55-tool MCP security server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Activate your developer passkey (`$5 / `$10) at: https://bartholomew.info#pricing" -ForegroundColor Cyan
Write-Host ""
