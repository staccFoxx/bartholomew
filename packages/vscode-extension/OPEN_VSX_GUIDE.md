# Open VSX Registry & Cursor Marketplace Publishing Guide (v6.6.7)

This guide documents the exact 1-command publication workflow for **Bartholomew Agent Guard** (`Bartholomew.bartholomew-guard-vscode`) on the [Open VSX Registry](https://open-vsx.org/).

---

## 1. Quick Publication (1-Liner)

Once your `OVSX_PAT` environment variable is set:

### On Linux / macOS / Git Bash:
```bash
export OVSX_PAT="your-open-vsx-access-token"
./publish-open-vsx.sh
```

### On Windows Command Prompt:
```cmd
set OVSX_PAT=your-open-vsx-access-token
publish-open-vsx.bat
```

### Direct CLI command via npx:
```bash
npx ovsx publish bartholomew-guard-vscode-6.6.7.vsix -p $OVSX_PAT
```

---

## 2. Generating Your Open VSX Personal Access Token (PAT)

1. Navigate to [https://open-vsx.org/](https://open-vsx.org/) and log in using your GitHub account (`staccFoxx`).
2. Click your avatar in the upper right corner and select **Access Tokens**.
3. Click **Generate Token**, name it `bartholomew-release-v6.6.7`, and copy the generated token string.
4. If you have not claimed the namespace yet, visit [Open VSX Namespaces](https://open-vsx.org/user-settings/namespaces) and claim `Bartholomew`.

---

## 3. Automated GitHub Actions CI/CD

Publication is also fully automated via GitHub Actions in [`.github/workflows/publish-extensions.yml`](../../.github/workflows/publish-extensions.yml):
- Add your Open VSX token as a repository secret: `OVSX_PAT` in **GitHub Repository Settings > Secrets and variables > Actions**.
- Trigger the workflow on demand via the **Actions** tab ("Run workflow") or by pushing a new release tag `git tag v6.6.7 && git push origin v6.6.7`.

---

## 4. Verification

After publishing, the extension will be instantly searchable and installable in:
- **Cursor IDE**: `cursor --install-extension Bartholomew.bartholomew-guard-vscode`
- **Windsurf IDE**: `windsurf --install-extension Bartholomew.bartholomew-guard-vscode`
- **VS Code**: `code --install-extension Bartholomew.bartholomew-guard-vscode`
- **Open VSX Web Registry**: [https://open-vsx.org/extension/Bartholomew/bartholomew-guard-vscode](https://open-vsx.org/extension/Bartholomew/bartholomew-guard-vscode)
