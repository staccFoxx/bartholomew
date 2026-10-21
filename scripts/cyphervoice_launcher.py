"""
CypherVoice legacy launcher forwarder.
Directs all commands and invocations to the upgraded Kyro launcher.
"""

import sys
import os

if __name__ == "__main__":
    kyro_launcher = os.path.join(os.path.dirname(__file__), "kyro_launcher.py")
    if os.path.exists(kyro_launcher):
        import importlib.util
        spec = importlib.util.spec_from_file_location("kyro_launcher", kyro_launcher)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        mod.main()
    else:
        print("[!] Kyro launcher not found.")
