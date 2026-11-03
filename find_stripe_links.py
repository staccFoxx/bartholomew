import os
import re

pattern = re.compile(r'buy\.stripe\.com[^\s"\'<>]+')
found = set()
root_dir = r"C:\Users\User\.gemini\antigravity\scratch\autonomous-circularity-network"

for root, dirs, files in os.walk(root_dir):
    if any(skip in root for skip in ['.git', 'node_modules', '.btp_snapshots']):
        continue
    for f in files:
        if f.endswith(('.html', '.py', '.json', '.md', '.ts')):
            fp = os.path.join(root, f)
            try:
                with open(fp, 'r', encoding='utf-8', errors='ignore') as s:
                    for m in pattern.findall(s.read()):
                        found.add(m)
            except Exception:
                pass

print("Found Stripe links:")
for link in sorted(found):
    print(" - https://" + link)
