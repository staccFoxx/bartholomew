#!/usr/bin/env python3
"""
Bartholomew Guard (btp-guard) — Zero-Dependency CI/CD & GitHub Action Scanner.
Detects high-risk agent & MCP tool anti-patterns across Python/TypeScript/JavaScript:
- OWASP LLM05/LLM06: Direct eval/exec, shell=True subprocesses, os.system/execSync
- OWASP LLM06: Destructive filesystem mutations without visible workspace confinement
- OWASP LLM02: Raw credential reads (os.environ/process.env) without secret redaction
- Cost Guard: Missing token-budget / max-iteration ceilings across agent loops
"""
import argparse
import ast
import json
import os
import re
import sys
from pathlib import Path

SKIP_DIRS = {
    ".git", "node_modules", "dist", "build", ".venv", "venv", "tests", "test",
    "__tests__", "__pycache__", "docs", "examples", "example", "benchmarks",
    "benchmark", "bench", "evals", "eval", "e2e", "fixtures", "vendor",
    "migrations", ".next", ".nuxt", "coverage",
}

SKIP_NAME_TOKENS = (
    "test", "spec", "bench", "eval", "example", "fixture", "mock", "smoke", "e2e",
)


def iter_source_files(root_dir: Path):
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d.lower() not in SKIP_DIRS and not d.startswith(".")]
        for fn in files:
            low = fn.lower()
            if (
                low.endswith((".py", ".ts", ".js", ".mjs", ".cjs"))
                and not low.endswith((".min.js", ".bundle.js", ".d.ts"))
                and not any(tok in low for tok in SKIP_NAME_TOKENS)
            ):
                p = Path(root) / fn
                try:
                    if p.stat().st_size <= 200_000:
                        yield p
                except OSError:
                    continue


def scan_directory(root_dir: Path) -> dict:
    findings = []
    files_scanned = 0
    has_budget_guard = False

    for fp in iter_source_files(root_dir):
        files_scanned += 1
        rel = fp.relative_to(root_dir).as_posix()
        try:
            txt = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        low = txt.lower()
        if any(k in low for k in ("max_tokens", "token_budget", "rate_limit", "ratelimit", "max_iterations", "max_steps")):
            has_budget_guard = True

        lines = txt.splitlines()

        if fp.suffix == ".py":
            try:
                tree = ast.parse(txt)
                os_aliases, shutil_aliases = {"os"}, {"shutil"}
                direct_os, direct_shutil = set(), set()
                for imp in ast.walk(tree):
                    if isinstance(imp, ast.Import):
                        for alias in imp.names:
                            if alias.name == "os":
                                os_aliases.add(alias.asname or "os")
                            elif alias.name == "shutil":
                                shutil_aliases.add(alias.asname or "shutil")
                    elif isinstance(imp, ast.ImportFrom):
                        if imp.module == "os":
                            for alias in imp.names:
                                if alias.name in ("system", "popen", "remove", "unlink"):
                                    direct_os.add(alias.asname or alias.name)
                        elif imp.module == "shutil":
                            for alias in imp.names:
                                if alias.name == "rmtree":
                                    direct_shutil.add(alias.asname or alias.name)

                for node in ast.walk(tree):
                    if not isinstance(node, ast.Call):
                        continue
                    is_bare = isinstance(node.func, ast.Name)
                    is_attr = isinstance(node.func, ast.Attribute)
                    fn_name = node.func.id if is_bare else (node.func.attr if is_attr else "")
                    recv = node.func.value.id if (is_attr and isinstance(node.func.value, ast.Name)) else ""

                    if fn_name in ("eval", "exec") and (is_bare or recv == "builtins"):
                        findings.append({
                            "severity": "HIGH",
                            "rule": "BTP-AST-001",
                            "owasp": "LLM05 + LLM06",
                            "file": rel,
                            "line": node.lineno,
                            "message": f"Direct `{fn_name}()` call without an AST/sandbox policy gate.",
                        })
                    elif fn_name in ("system", "popen") and ((is_attr and recv in os_aliases) or (is_bare and fn_name in direct_os)):
                        findings.append({
                            "severity": "HIGH",
                            "rule": "BTP-SHELL-001",
                            "owasp": "LLM05 + LLM06",
                            "file": rel,
                            "line": node.lineno,
                            "message": f"Unconstrained shell invocation (`os.{fn_name}`) without command allowlist.",
                        })
                    elif fn_name in ("run", "Popen", "call", "check_output", "create_subprocess_shell"):
                        has_shell_true = any(
                            kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True
                            for kw in node.keywords
                        )
                        if has_shell_true or fn_name == "create_subprocess_shell":
                            findings.append({
                                "severity": "HIGH",
                                "rule": "BTP-SHELL-002",
                                "owasp": "LLM05 + LLM06",
                                "file": rel,
                                "line": node.lineno,
                                "message": f"Shell-enabled subprocess (`{fn_name}`) vulnerable to prompt-injected command chaining.",
                            })
                    elif (
                        (fn_name == "rmtree" and ((is_attr and recv in shutil_aliases) or (is_bare and fn_name in direct_shutil)))
                        or (fn_name in ("remove", "unlink") and ((is_attr and recv in os_aliases) or (is_bare and fn_name in direct_os)))
                    ):
                        findings.append({
                            "severity": "MEDIUM",
                            "rule": "BTP-FS-001",
                            "owasp": "LLM06",
                            "file": rel,
                            "line": node.lineno,
                            "message": f"Destructive filesystem call (`{fn_name}`) — ensure workspace-root path confinement.",
                        })
            except SyntaxError:
                pass

            for idx, ln in enumerate(lines, 1):
                ll = ln.lower()
                if ("os.environ" in ln or "os.getenv" in ln) and any(k in ll for k in ("api_key", "secret_key", "access_token", "auth_token", "password")):
                    if not any(w in ll for w in ("mask", "redact", "path", "file")):
                        findings.append({
                            "severity": "MEDIUM",
                            "rule": "BTP-SECRET-001",
                            "owasp": "LLM02",
                            "file": rel,
                            "line": idx,
                            "message": "Raw credential read — ensure in-flight secret redaction before tool/log output.",
                        })
                        break
        else:
            has_child_proc = "child_process" in txt
            for idx, ln in enumerate(lines, 1):
                stripped = ln.strip()
                if stripped.startswith(("//", "*", "import ", "export ")):
                    continue
                if re.search(r"\b(execSync|eval|new Function)\s*\(", ln) or (has_child_proc and re.search(r"(?<![.\w])exec\s*\(", ln)):
                    findings.append({
                        "severity": "HIGH",
                        "rule": "BTP-SHELL-003",
                        "owasp": "LLM05 + LLM06",
                        "file": rel,
                        "line": idx,
                        "message": "Direct command/code execution call without deterministic allowlist or AST guard.",
                    })
                ll = ln.lower()
                if "process.env" in ln and any(k in ll for k in ("api_key", "secret_key", "access_token", "auth_token", "password")):
                    if not any(w in ll for w in ("mask", "redact", "path", "file")):
                        findings.append({
                            "severity": "MEDIUM",
                            "rule": "BTP-SECRET-002",
                            "owasp": "LLM02",
                            "file": rel,
                            "line": idx,
                            "message": "Credential access via `process.env` — verify output secret-masking on tool responses.",
                        })
                if re.search(r"\b(rmSync|unlinkSync|promises\.rm)\b", ln):
                    findings.append({
                        "severity": "MEDIUM",
                        "rule": "BTP-FS-002",
                        "owasp": "LLM06",
                        "file": rel,
                        "line": idx,
                        "message": "Destructive filesystem mutation — enforce workspace-root boundary validation.",
                    })

    high_count = sum(1 for f in findings if f["severity"] == "HIGH")
    med_count = sum(1 for f in findings if f["severity"] == "MEDIUM")

    if high_count == 0 and med_count == 0:
        grade = "A+"
    elif high_count == 0 and med_count <= 2:
        grade = "A"
    elif high_count == 0:
        grade = "B"
    elif high_count <= 2:
        grade = "C"
    elif high_count <= 5:
        grade = "D"
    else:
        grade = "F"

    return {
        "files_scanned": files_scanned,
        "has_budget_guard": has_budget_guard,
        "findings_count": len(findings),
        "high_count": high_count,
        "medium_count": med_count,
        "grade": grade,
        "findings": findings[:50],
    }


def write_github_summary(report: dict) -> None:
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path:
        return
    lines = [
        "## Bartholomew Guard (`btp-guard`) — Security Gate Summary",
        "",
        f"- **Grade:** `{report['grade']}` | **Files Scanned:** `{report['files_scanned']}` | **HIGH:** `{report['high_count']}` | **MEDIUM:** `{report['medium_count']}`",
        f"- **Runaway Cost/Loop Guard Detected:** `{'Yes' if report['has_budget_guard'] else 'No'}`",
        "",
    ]
    if report["findings"]:
        lines.append("| Severity | Rule | OWASP | Location | Finding |")
        lines.append("|---|---|---|---|---|")
        for f in report["findings"][:25]:
            lines.append(f"| **{f['severity']}** | `{f['rule']}` | `{f['owasp']}` | `{f['file']}:{f['line']}` | {f['message']} |")
    else:
        lines.append("Zero high-risk agent or MCP security anti-patterns detected.")
    lines.append("")
    lines.append("---")
    lines.append("*Powered by [Bartholomew Guard](https://bartholomew.info) — Free in-process runtime security & 48-hour AI Agent Security Audits.*")
    Path(summary_path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_github_outputs(report: dict) -> None:
    out_path = os.environ.get("GITHUB_OUTPUT")
    if not out_path:
        return
    with open(out_path, "a", encoding="utf-8") as fh:
        fh.write(f"findings_count={report['findings_count']}\n")
        fh.write(f"high_count={report['high_count']}\n")
        fh.write(f"grade={report['grade']}\n")


def main() -> int:
    ap = argparse.ArgumentParser(description="Bartholomew Guard CI/CD Security Scanner")
    ap.add_argument("--path", default=".", help="Directory to scan")
    ap.add_argument("--json-out", default="", help="Optional JSON output file path")
    ap.add_argument("--fail-on-high", action="store_true", help="Exit 1 if any HIGH severity findings are found")
    args = ap.parse_args()

    target = Path(args.path).resolve()
    report = scan_directory(target)

    if args.json_out:
        Path(args.json_out).write_text(json.dumps(report, indent=2), encoding="utf-8")

    write_github_summary(report)
    write_github_outputs(report)

    print(
        f"[btp-guard] Grade: {report['grade']} | Files: {report['files_scanned']} | "
        f"HIGH: {report['high_count']} | MEDIUM: {report['medium_count']}"
    )
    for f in report["findings"][:15]:
        print(f"  [{f['severity']}] {f['rule']} ({f['owasp']}) {f['file']}:{f['line']} — {f['message']}")

    if args.fail_on_high and report["high_count"] > 0:
        print(f"[btp-guard] Failing build due to {report['high_count']} HIGH severity finding(s).")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
