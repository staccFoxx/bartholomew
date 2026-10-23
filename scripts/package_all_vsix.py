from __future__ import annotations

import json
import os
import subprocess
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape


def run_command(cmd, cwd):
    result = subprocess.run(
        cmd,
        cwd=str(cwd),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        raise subprocess.CalledProcessError(
            result.returncode,
            cmd,
            output=result.stdout,
            stderr=result.stderr,
        )
    return result


def ensure_package_ready(pkg_dir):
    pkg_dir = Path(pkg_dir)
    pkg_json_path = pkg_dir / "package.json"
    if not pkg_json_path.exists():
        raise FileNotFoundError(f"Package manifest missing: {pkg_json_path}")

    with open(pkg_json_path, "r", encoding="utf-8") as f:
        pkg_json = json.load(f)

    if "extensionPack" in pkg_json:
        return None

    scripts = pkg_json.get("scripts", {})
    if "compile" not in scripts and "build" not in scripts:
        raise FileNotFoundError(
            f"{pkg_dir / 'dist' / 'extension.js'} is missing and this package does not define a compile/build script."
        )

    dist_entry = pkg_dir / "dist" / "extension.js"
    if not dist_entry.exists():
        if not (pkg_dir / "node_modules").exists():
            print(f"[*] Installing npm dependencies for {pkg_dir.name}...")
            run_command(["npm", "install", "--no-audit", "--no-fund"], pkg_dir)
        print(f"[*] Building {pkg_dir.name} bundle...")
        run_command(["npm", "run", "compile"], pkg_dir)

    if not dist_entry.exists():
        raise FileNotFoundError(
            f"{dist_entry} is missing after compile; refusing to package a stale or incomplete extension."
        )

    return dist_entry


def pack_package(pkg_dir, package_id, display_name, description):
    pkg_dir = Path(pkg_dir)
    ensure_package_ready(pkg_dir)

    pkg_json_path = pkg_dir / "package.json"
    with open(pkg_json_path, "r", encoding="utf-8") as f:
        vinfo = json.load(f)

    version = vinfo.get("version", "0.0.0")
    publisher = vinfo.get("publisher", "bartholomew")
    keywords_list = list(vinfo.get("keywords", ["ai", "security", "guardrails"]))
    sponsor_info = vinfo.get("sponsor", {})
    sponsor_url = sponsor_info.get("url") if isinstance(sponsor_info, dict) else None
    if sponsor_url and "__sponsor_extension" not in keywords_list:
        keywords_list.append("__sponsor_extension")
    keywords = ",".join(keywords_list)
    categories = ",".join(vinfo.get("categories", ["Other", "Security"]))
    sponsor_prop = f'\n      <Property Id="Microsoft.VisualStudio.Code.SponsorLink" Value="{xml_escape(sponsor_url)}" />' if sponsor_url else ''

    out_vsix_name = f"{package_id}-{version}.vsix"
    out_vsix = pkg_dir / out_vsix_name

    for stale_vsix in pkg_dir.glob(f"{package_id}-*.vsix"):
        if stale_vsix.name != out_vsix_name:
            stale_vsix.unlink()
            print(f"[-] Removed stale VSIX: {stale_vsix}")

    content_types_xml = """<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension=".json" ContentType="application/json"/>
  <Default Extension=".vsixmanifest" ContentType="text/xml"/>
  <Default Extension=".js" ContentType="application/javascript"/>
  <Default Extension=".png" ContentType="image/png"/>
  <Default Extension=".svg" ContentType="image/svg+xml"/>
  <Default Extension=".md" ContentType="text/markdown"/>
  <Default Extension=".ts" ContentType="video/mp2t"/>
</Types>"""

    ext_pack_val = ",".join(vinfo.get("extensionPack", []))
    executes_code = "false" if ext_pack_val else "true"

    vsixmanifest_xml = f"""<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
  <Metadata>
    <Identity Language="en-US" Id="{package_id}" Version="{version}" Publisher="{publisher}" />
    <DisplayName>{xml_escape(display_name)}</DisplayName>
    <Description xml:space="preserve">{xml_escape(description)}</Description>
    <Tags>{keywords}</Tags>
    <Categories>{categories}</Categories>
    <GalleryFlags>Public</GalleryFlags>
    <Properties>
      <Property Id="Microsoft.VisualStudio.Code.Engine" Value="^1.80.0" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="{ext_pack_val}" />
      <Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="workspace" />
      <Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.EnabledApiProposals" Value="" />
      <Property Id="Microsoft.VisualStudio.Code.ExecutesCode" Value="{executes_code}" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Source" Value="https://github.com/ivegotahunnitonit/bartholomew.git" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Getstarted" Value="https://github.com/ivegotahunnitonit/bartholomew.git" />
      <Property Id="Microsoft.VisualStudio.Services.Links.GitHub" Value="https://github.com/ivegotahunnitonit/bartholomew.git" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Support" Value="https://github.com/ivegotahunnitonit/bartholomew/issues" />
      <Property Id="Microsoft.VisualStudio.Services.Links.Learn" Value="https://github.com/ivegotahunnitonit/bartholomew#readme" />
      <Property Id="Microsoft.VisualStudio.Services.GitHubFlavoredMarkdown" Value="true" />
      <Property Id="Microsoft.VisualStudio.Services.Content.Pricing" Value="Free"/>{sponsor_prop}
    </Properties>
    <License>extension/LICENSE.md</License>
    <Icon>extension/icon.png</Icon>
  </Metadata>
  <Installation>
    <InstallationTarget Id="Microsoft.VisualStudio.Code"/>
  </Installation>
  <Dependencies/>
  <Assets>
    <Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.Details" Path="extension/README.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Content.License" Path="extension/LICENSE.md" Addressable="true" />
    <Asset Type="Microsoft.VisualStudio.Services.Icons.Default" Path="extension/icon.png" Addressable="true" />
  </Assets>
</PackageManifest>"""

    allowlist_exact_files = {"package.json", "README.md", "LICENSE.md", "icon.png", "icon.svg", "keystone_logo_1024.png"}
    allowlist_dir_prefixes = {"dist", "images"}

    with zipfile.ZipFile(out_vsix, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types_xml)
        z.writestr("extension.vsixmanifest", vsixmanifest_xml)
        for root, _, files in os.walk(pkg_dir):
            if "node_modules" in root or ".git" in root or ".vsix" in root:
                continue
            for f in files:
                if f.endswith(".vsix"):
                    continue
                fp = os.path.join(root, f)
                rel = os.path.relpath(fp, pkg_dir).replace("\\", "/")
                top_part = rel.split("/")[0]
                if rel in allowlist_exact_files or top_part in allowlist_dir_prefixes or (top_part == "dist" and f.endswith((".js", ".map"))):
                    z.write(fp, "extension/" + rel)

    size = os.path.getsize(out_vsix)
    print(f"[+] Successfully packaged {out_vsix} ({size:,} bytes) with explicit allowlist & GalleryFlags=Public")
    return out_vsix


if __name__ == "__main__":
    root = Path(__file__).resolve().parent.parent
    pack_package(
        root / "packages" / "bartholomew-vault",
        "bartholomew-vault",
        "Bartholomew Vault - In-Process Data & PII Tokenizer (Cursor, Claude, Copilot)",
        "Sub-millisecond in-process credential, PHI, and PII tokenization with just-in-time OS detokenization for Cursor, Claude Code, Windsurf, Copilot, and VS Code.",
    )
    pack_package(
        root / "packages" / "bartholomew-keystone",
        "bartholomew-keystone",
        "Bartholomew Keystone - AI Agent Capabilities & Passkeys (Cursor, Claude)",
        "Cryptographically signed clearance tokens granting autonomous AI agents fine-grained access across files, commands, and domains in Cursor, Claude Desktop, and VS Code.",
    )
    pack_package(
        root / "packages" / "vscode-extension",
        "bartholomew-guard-vscode",
        "Bartholomew AI Agent Guard - Security & Guardrails (Cursor, Claude, Copilot)",
        "Zero-trust firewall & security guardrails for AI agents. Prevents dangerous commands, secret exfiltration, and destructive file deletion in Cursor, Claude Desktop, and VS Code.",
    )
    pack_package(
        root / "packages" / "bartholomew-trinity",
        "bartholomew-trinity",
        "Trinity — Complete AI Agent Security Suite (Cursor, Claude, Copilot)",
        "Complete 3-phase developer runtime security suite for Cursor, Claude Code, Windsurf, Copilot, and VS Code. Installs Bartholomew Guard, Keystone, and Vault in 1 click.",
    )
