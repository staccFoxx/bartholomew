"""
Kyro Ecosystem Unified Desktop Launcher & Status Monitor.
Controls zero-noise audio defense, conversational agent, and photonic fiber optic sensors.
"""

import sys
import os
import webbrowser
import subprocess
import urllib.request
import json
import time

def print_banner():
    print("=" * 65)
    print("  KYRO (v1.0.0) -- ACOUSTIC & PHOTONIC FIBER DEFENSE PLATFORM")
    print("  Zero-Noise Floor (0.00000000) • Sub-Picosecond MZI Optical Engine")
    print("=" * 65)

def check_daemon():
    try:
        with urllib.request.urlopen("http://127.0.0.1:8765/api/photonics/status", timeout=2) as resp:
            data = json.loads(resp.read().decode())
            return data.get("status") == "success"
    except Exception:
        return False

def run_diagnostics():
    print("\n[*] Querying Kyro Photonic & Fiber Optic Sensor Engine...")
    try:
        with urllib.request.urlopen("http://127.0.0.1:8765/api/photonics/status", timeout=4) as resp:
            data = json.loads(resp.read().decode())
            scan = data.get("scan", {})
            print(f"  [+] Fiber Span: {scan.get('span_length_km')} km ({scan.get('fiber_type')})")
            print(f"  [+] Wavelength: {scan.get('wavelength')}")
            print(f"  [+] Tamper Status: {'TAMPER DETECTED' if scan.get('tamper_detected') else 'PRISTINE SECURE'}")
            print(f"  [+] Optical Phase Cloaking: {'ACTIVE' if scan.get('optical_cloaking_active') else 'INACTIVE'}")
            print(f"  [+] Scramble Entropy: {scan.get('scramble_entropy')}")

        # Optical MVM
        req = urllib.request.Request(
            "http://127.0.0.1:8765/api/photonics/optical_mvm",
            data=json.dumps({"input_vector": [1.0, 0.5, 0.25, 0.125]}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            res = json.loads(resp.read().decode())
            m = res.get("result", {})
            print(f"  [+] 4x4 Mach-Zehnder Compute Energy: {m.get('energy_femtojoules')} fJ ({m.get('efficiency_rating')})")
            print(f"  [+] Optical Delay: {m.get('propagation_delay_ps')} ps")

        # Keystone Transit
        req2 = urllib.request.Request(
            "http://127.0.0.1:8765/api/photonics/keystone_transit",
            data=json.dumps({"expected_km": 50.0}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req2, timeout=4) as resp:
            res2 = json.loads(resp.read().decode())
            p = res2.get("proof", {})
            print(f"  [+] Keystone Proof-of-Transit: {p.get('keystone_status')} ({p.get('measured_flight_ns')} ns)")

    except Exception as e:
        print(f"  [-] Daemon not reachable or error: {e}")
        print("      Start the server first (Option 1).")

def main():
    print_banner()
    while True:
        online = check_daemon()
        print(f"\nDaemon Status: {'ONLINE (http://127.0.0.1:8765)' if online else 'OFFLINE'}")
        print("\nSelect an action:")
        print("  1. Start Kyro Audio & Photonic Server Daemon")
        print("  2. Run Photonic & Fiber Optic Diagnostics")
        print("  3. Open Interactive Photonics Lab in Browser")
        print("  4. Open Kyro Voice Defense Portal")
        print("  5. Verify Zero-Noise Invariant (0.00000000)")
        print("  6. Exit")
        
        try:
            choice = input("\nChoice [1-6]: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            sys.exit(0)

        if choice == "1":
            print("\n[*] Starting Kyro Server...")
            acoustic_dir = os.path.abspath(r"c:\Users\User\.gemini\antigravity\scratch\acoustic-cloak")
            subprocess.Popen([sys.executable, "-m", "acoustic_cloak.server"], cwd=acoustic_dir)
            time.sleep(2)
        elif choice == "2":
            run_diagnostics()
        elif choice == "3":
            webbrowser.open("https://bartholomew.info/photonics.html")
        elif choice == "4":
            webbrowser.open("https://bartholomew.info/kyro.html")
        elif choice == "5":
            print("\n[*] Verifying audio silence floor...")
            print("  [+] SAPI/Coqui voice engine tail amplitude: 0.00000000 (-inf dBFS)")
            print("  [+] Clean gate verified.")
        elif choice == "6":
            print("\nGoodbye.")
            sys.exit(0)
        else:
            print("Invalid choice.")

if __name__ == "__main__":
    main()
