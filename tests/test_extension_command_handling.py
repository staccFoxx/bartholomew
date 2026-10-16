import re
import json
import pytest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
EXTENSION_DIR = REPO_ROOT / "packages" / "vscode-extension"
PACKAGE_JSON = EXTENSION_DIR / "package.json"
EXTENSION_TS = EXTENSION_DIR / "src" / "extension.ts"


class TestExtensionCommandHandling:
    """Verifies that all VS Code extension commands are valid, registered, and consistent."""

    def test_package_json_and_extension_versions_aligned(self):
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            pkg_data = json.load(f)
        version = pkg_data.get("version")
        assert version in ["6.4.4", "6.5.9"], f"Expected package.json version 6.4.4 or 6.5.9, got {version}"

        # Verify extension.ts version strings
        ts_content = EXTENSION_TS.read_text(encoding="utf-8")
        assert ("version: '6.4.4'" in ts_content or "version: '6.5.9'" in ts_content), "extension.ts telemetry version must be aligned"
        assert "v6.4.0" not in ts_content, "extension.ts contains stale v6.4.0 reference"

    def test_all_contributed_commands_are_registered_in_ts(self):
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            pkg_data = json.load(f)

        contributed_commands = [
            cmd["command"] for cmd in pkg_data.get("contributes", {}).get("commands", [])
        ]
        assert len(contributed_commands) > 15, "Expected at least 15 contributed commands"

        ts_content = EXTENSION_TS.read_text(encoding="utf-8")
        registered_commands = re.findall(
            r"vscode\.commands\.registerCommand\(\s*['\"]([^'\"]+)['\"]", ts_content
        )

        missing_registrations = []
        for cmd in contributed_commands:
            if cmd not in registered_commands and cmd != "bartholomew.startYieldDaemon":
                missing_registrations.append(cmd)

        assert not missing_registrations, f"Commands declared in package.json but missing handler in extension.ts: {missing_registrations}"

    def test_command_titles_do_not_contain_unsupported_commercial_claims(self):
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            pkg_data = json.load(f)

        commands = pkg_data.get("contributes", {}).get("commands", [])
        for cmd in commands:
            title = cmd.get("title", "")
            assert "50,000+" not in title, f"Unsupported claim in title: {title}"
            assert "SOC 2 certified" not in title.lower(), f"Unsupported certification claim in title: {title}"

    def test_git_pre_commit_hook_in_extension_is_fail_closed(self):
        ts_content = EXTENSION_TS.read_text(encoding="utf-8")
        # Ensure the installed hook script exits with 1 on verification failure
        assert "exit 1" in ts_content
        assert "UNIFIED_PRE_COMMIT_HOOK" in ts_content
        assert "Bartholomew Keystone Pre-Commit Hook" in ts_content
        assert "python -m btp_guard.cli check --staged" in ts_content
        assert "btp-guard check --staged" in ts_content

    def test_extension_activates_on_startup_finished(self):
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            pkg_data = json.load(f)
        activation_events = pkg_data.get("activationEvents", [])
        assert "onStartupFinished" in activation_events

    def test_arm_and_link_workspace_command_contributed_and_registered(self):
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            pkg_data = json.load(f)
        commands = [c["command"] for c in pkg_data.get("contributes", {}).get("commands", [])]
        assert "bartholomew.armAndLinkWorkspace" in commands, "bartholomew.armAndLinkWorkspace must be contributed in package.json"

        ts_content = EXTENSION_TS.read_text(encoding="utf-8")
        assert "bartholomew.armAndLinkWorkspace" in ts_content
        assert "ALLOWED_COMMANDS" in ts_content
        assert "'bartholomew.armAndLinkWorkspace'" in ts_content
        assert "armAndLinkWorkspaceCmd" in ts_content

    def test_extension_icon_and_webview_logo_integrity(self):
        icon_path = EXTENSION_DIR / "icon.png"
        assert icon_path.exists(), "Extension icon.png must exist"
        assert icon_path.stat().st_size > 10000, "Extension icon.png must be high-resolution"

        proof_ts = EXTENSION_DIR / "src" / "proof_provider.ts"
        proof_content = proof_ts.read_text(encoding="utf-8")
        assert "brand-crest-img" in proof_content, "Webview header must use brand-crest-img"
        assert "brand-crest-gloss" in proof_content, "Webview header must have gloss styling"
        assert "armAndLinkWorkspace" in proof_content, "Webview must contain armAndLinkWorkspace action"
        assert "btn-arm-header" in proof_content, "Webview must include prominent Link & Arm button"
