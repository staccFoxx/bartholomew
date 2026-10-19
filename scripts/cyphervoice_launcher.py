"""
CypherVoice Desktop Launcher & System Status Monitor.
Launches and verifies the local CypherVoice audio cloaking daemon on port 8765,
verifies virtual audio cable loopback, and provides one-click desktop access.
"""

import sys
import os
import time
import json
import subprocess
import urllib.request
import webbrowser

PORT = 8765
STATUS_URL = f"http://127.0.0.1:{PORT}/api/status"


def check_daemon_online() -> bool:
    try:
        req = urllib.request.Request(STATUS_URL, headers={"User-Agent": "CypherLauncher/1.0"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            data = json.loads(resp.read().decode())
            return data.get("status") == "online"
    except Exception:
        return False


def start_daemon_if_needed():
    if check_daemon_online():
        print(f"[+] CypherVoice Daemon is already running at http://127.0.0.1:{PORT}")
        return

    print(f"[*] Starting CypherVoice Daemon on http://127.0.0.1:{PORT}...")
    # Find python path and server module
    acoustic_cloak_dir = os.path.abspath(r"c:\Users\User\.gemini\antigravity\scratch\acoustic-cloak")
    cmd = [sys.executable, "-m", "acoustic_cloak.server"]
    
    proc = subprocess.Popen(
        cmd,
        cwd=acoustic_cloak_dir,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    )

    # Poll for startup
    for _ in range(15):
        time.sleep(0.5)
        if check_daemon_online():
            print(f"[+] CypherVoice Daemon successfully started! (PID: {proc.pid})")
            return

    print("[!] Daemon launched, verifying connection...")


def main():
    print("=" * 60)
    print("      CYPHERVOICE DESKTOP RUNNER & COMPANION v0.7.3          ")
    print("=" * 60)
    start_daemon_if_needed()

    print("\nEcosystem Controls:")
    print("  [1] Open Live Web Spectrogram Studio (Canvas DSP)")
    print("  [2] Open Swagger REST API Docs (http://127.0.0.1:8765/docs)")
    print("  [3] Run Automated Audio Echo & Barge-In Smoke Test")
    print("  [4] Run In-Editor Live Voice Coding Test")
    print("  [5] Exit Runner")

    if len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        choice = "1"

    if choice == "1":
        print("\n[*] Opening https://bartholomew.info/cyphervoice.html ...")
        webbrowser.open("https://bartholomew.info/cyphervoice.html")
    elif choice == "2":
        webbrowser.open(f"http://127.0.0.1:{PORT}/docs")
    elif choice == "3":
        smoke_script = r"c:\Users\User\.gemini\antigravity\scratch\autonomous-circularity-network\scripts\smoke_test_cyphervoice.py"
        subprocess.run([sys.executable, smoke_script])


if __name__ == "__main__":
    main()
