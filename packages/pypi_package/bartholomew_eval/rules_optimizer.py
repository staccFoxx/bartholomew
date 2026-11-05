"""
Bartholomew Rules & Context Scrubber (v1.1 - Python)
====================================================
Sub-millisecond AST and semantic compression for persistent AI context files:
.cursorrules, CLAUDE.md, .windsurfrules, and .github/copilot-instructions.md.
"""

import os
import re
import shutil
from typing import Dict, Any, Tuple

TARGET_FILES = [
    ".cursorrules",
    "CLAUDE.md",
    ".windsurfrules",
    ".github/copilot-instructions.md"
]

FLUFF_PATTERNS = [
    r'^(?:please\s+)?(?:kindly\s+)?(?:always\s+)?(?:make\s+sure\s+to|ensure\s+that\s+you|be\s+sure\s+to|it\s+is\s+critical\s+that\s+you|you\s+must\s+always|remember\s+to)\s+',
    r'^(?:in\s+this\s+project,\s*)?(?:please\s+)?(?:always\s+)?(?:ensure\s+that\s+you|make\s+sure\s+to)\s+',
    r'^(?:as\s+an\s+ai(?:\s+language\s+model)?,\s*)?(?:please\s+)?(?:ensure\s+that\s+you|make\s+sure\s+to)\s+',
    r'^(?:in\s+all\s+your\s+responses,\s*)?(?:kindly\s+|please\s+)?',
    r'\s+(?:basically|actually|kind of|sort of|pretty much)\s+'
]

def compress_rule_line(line: str) -> str:
    cleaned = line.strip()
    if not cleaned or cleaned.startswith("#") or cleaned.startswith("```"):
        return line

    is_bullet = bool(re.match(r'^[\*\-\+]\s+', cleaned))
    if is_bullet:
        cleaned = re.sub(r'^[\*\-\+]\s+', '', cleaned)

    for pat in FLUFF_PATTERNS:
        cleaned = re.sub(pat, '', cleaned, flags=re.IGNORECASE)

    cleaned = cleaned.strip()
    if not cleaned:
        return ""
    cleaned = cleaned[0].upper() + cleaned[1:]

    return f"- {cleaned}" if is_bullet else cleaned

def optimize_rules_content(content: str) -> Tuple[str, int, int]:
    raw_lines = content.splitlines()
    optimized_lines = []
    seen_bullets = set()
    in_code_block = False

    for line in raw_lines:
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            optimized_lines.append(line)
            continue

        if in_code_block:
            optimized_lines.append(line)
            continue

        compressed = compress_rule_line(line)
        if not compressed:
            continue

        norm_key = re.sub(r'[^a-zA-Z0-9]', '', compressed.lower())

        if compressed.startswith("- "):
            if norm_key in seen_bullets:
                continue
            seen_bullets.add(norm_key)

        optimized_lines.append(compressed)

    result = re.sub(r'\n{3,}', '\n\n', "\n".join(optimized_lines)).strip() + "\n"
    orig_tokens = max(1, len(content) // 4)
    opt_tokens = max(1, len(result) // 4)
    return result, orig_tokens, opt_tokens

def optimize_repo_rules(target_dir: str = ".") -> Dict[str, Any]:
    results = {}
    total_saved = 0

    for filename in TARGET_FILES:
        filepath = os.path.join(target_dir, filename)
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                original = f.read()

            if len(original.strip()) < 20:
                continue

            optimized, orig_tok, opt_tok = optimize_rules_content(original)
            saved_tok = max(0, orig_tok - opt_tok)
            pct = round((saved_tok / orig_tok) * 100, 1)

            backup_path = filepath + ".bak"
            if not os.path.exists(backup_path):
                shutil.copyfile(filepath, backup_path)

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(optimized)

            total_saved += saved_tok
            results[filename] = {
                "original_tokens": orig_tok,
                "optimized_tokens": opt_tok,
                "tokens_saved": saved_tok,
                "savings_pct": pct,
                "backup": backup_path
            }

    return {
        "files_optimized": results,
        "total_tokens_saved_per_turn": total_saved,
        "monthly_saved_100_turns_day": total_saved * 100 * 30,
        "status": "SUCCESS" if results else "NO_RULES_FOUND"
    }
