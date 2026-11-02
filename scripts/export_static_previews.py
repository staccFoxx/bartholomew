#!/usr/bin/env python3
"""
Exports static, high-converting partner preview pages to site/preview/
so all preview links are hosted directly on official https://bartholomew.info/preview/{slug}.
Eliminates third-party tunnel dependency and suspicious URLs.
"""

import os
import sys
from pathlib import Path

# Add network to sys.path
AD_DIR = Path("C:/Users/User/.gemini/antigravity/scratch/bartholomew_ad_network")
if str(AD_DIR) not in sys.path:
    sys.path.insert(0, str(AD_DIR))

from preview_generator import render_preview_html, PARTNER_PROFILES

SITE_DIR = Path("C:/Users/User/.gemini/antigravity/scratch/autonomous-circularity-network/site")
PREVIEW_DIR = SITE_DIR / "preview"
PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

# Extended list of all brands in our network
ALL_BRANDS = list(PARTNER_PROFILES.keys()) + [
    "cerebras", "baseten", "octoai", "unstructured", "arize", "deepset",
    "llamaindex", "chroma", "runway", "modal", "neon", "posthog", "groq",
    "together", "turso", "inngest", "sentry", "warp", "fly", "railway",
    "datadog", "snyk", "grafana", "kong", "pulumi", "launchdarkly", "elastic",
    "ngrok", "astronomer", "zilliz", "keychron", "lemon", "magicmind", "runpod",
    "trigger", "hookdeck", "unkey", "scraperapi", "bootdev", "bytebytego",
    "executeprogram", "vastai", "hetzner", "axiom", "langchain", "pinecone",
    "prisma", "postman", "raycast", "linear", "mintlify", "dailydev", "sourcegraph",
    "fireworks", "replicate", "anyscale", "qdrant", "weaviate", "render",
    "koyeb", "clerk", "workos", "socket", "langfuse", "helicone", "temporal",
    "upstash", "tinybird", "meilisearch", "hasura", "deepgram", "gitguardian",
    "chainguard", "wandb", "stytch"
]

print(f"[*] Generating static preview pages for {len(ALL_BRANDS)} partner brands...")

for brand in set(ALL_BRANDS):
    html_content = render_preview_html(brand)
    # Ensure all links on the page point to official bartholomew.info
    html_content = html_content.replace(
        "https://colored-boundary-cst-higher.trycloudflare.com",
        "https://bartholomew.info"
    )
    dest_file = PREVIEW_DIR / f"{brand}.html"
    with open(dest_file, "w", encoding="utf-8") as f:
        f.write(html_content)

# Also generate a smart client-side router for site/preview/index.html
index_html = render_preview_html("partner")
# Inject client-side router into index.html
client_router_script = """
  <script>
    (function() {
      // Dynamic client-side slug resolution
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === 'preview') {
        const slug = pathParts[1].toLowerCase().replace('.html', '');
        if (slug && slug !== 'index') {
          // If already on a brand path, load dynamic brand data
          const brandTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
          document.title = brandTitle + ' x Bartholomew | Native Ecosystem Integration';
          const nameEls = document.querySelectorAll('.brand-duo span:nth-child(3)');
          nameEls.forEach(el => el.textContent = brandTitle);
        }
      }
    })();
  </script>
"""
index_html = index_html.replace("</body>", client_router_script + "\n</body>")
with open(PREVIEW_DIR / "index.html", "w", encoding="utf-8") as f:
    f.write(index_html)

print(f"[+] Successfully exported {len(list(PREVIEW_DIR.glob('*.html')))} static preview pages into {PREVIEW_DIR}")
