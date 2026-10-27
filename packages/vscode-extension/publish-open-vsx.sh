#!/bin/bash
set -e
echo "Packaging Bartholomew Agent Guard v6.6.7 for Open VSX and VS Code Marketplace..."
npx @vscode/vsce package --no-git-tag-version

if [ -n "$OVSX_PAT" ]; then
  echo "Publishing to Open VSX Registry..."
  npx ovsx publish bartholomew-guard-vscode-6.6.7.vsix -p "$OVSX_PAT"
  echo "Successfully published to Open VSX!"
else
  echo "OVSX_PAT not set. Set OVSX_PAT to publish directly to open-vsx.org"
fi
