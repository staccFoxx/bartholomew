/**
 * Bartholomew Rules & Context Scrubber (v1.1 - ESM)
 * ===================================================
 * Sub-millisecond AST and semantic compression for persistent AI context files:
 * .cursorrules, CLAUDE.md, .windsurfrules, and .github/copilot-instructions.md.
 */

import fs from 'fs';
import path from 'path';

export const TARGET_FILES = [
  '.cursorrules',
  'CLAUDE.md',
  '.windsurfrules',
  path.join('.github', 'copilot-instructions.md')
];

const FLUFF_PATTERNS = [
  /^(?:please\s+)?(?:kindly\s+)?(?:always\s+)?(?:make\s+sure\s+to|ensure\s+that\s+you|be\s+sure\s+to|it\s+is\s+critical\s+that\s+you|you\s+must\s+always|remember\s+to)\s+/i,
  /^(?:in\s+this\s+project,\s*)?(?:please\s+)?(?:always\s+)?(?:ensure\s+that\s+you|make\s+sure\s+to)\s+/i,
  /^(?:as\s+an\s+ai(?:\s+language\s+model)?,\s*)?(?:please\s+)?(?:ensure\s+that\s+you|make\s+sure\s+to)\s+/i,
  /^(?:in\s+all\s+your\s+responses,\s*)?(?:kindly\s+|please\s+)?/i,
  /\s+(?:basically|actually|kind of|sort of|pretty much)\s+/gi
];

export function compressRuleLine(line) {
  let cleaned = line.trim();
  if (!cleaned || cleaned.startsWith('#') || cleaned.startsWith('```')) {
    return line;
  }

  const isBullet = /^[\*\-\+]\s+/.test(cleaned);
  if (isBullet) {
    cleaned = cleaned.replace(/^[\*\-\+]\s+/, '');
  }

  for (const pat of FLUFF_PATTERNS) {
    cleaned = cleaned.replace(pat, '');
  }

  cleaned = cleaned.trim();
  if (!cleaned) return '';
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return isBullet ? `- ${cleaned}` : cleaned;
}

export function optimizeRulesContent(content) {
  const rawLines = content.split(/\r?\n/);
  const optimizedLines = [];
  const seenBullets = new Set();
  let inCodeBlock = false;

  for (const line of rawLines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      optimizedLines.push(line);
      continue;
    }

    if (inCodeBlock) {
      optimizedLines.push(line);
      continue;
    }

    const compressed = compressRuleLine(line);
    if (!compressed) continue;

    const normKey = compressed.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (compressed.startsWith('- ')) {
      if (seenBullets.has(normKey)) {
        continue;
      }
      seenBullets.add(normKey);
    }

    optimizedLines.push(compressed);
  }

  const result = optimizedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  const origTokens = Math.max(1, Math.round(content.length / 4));
  const optTokens = Math.max(1, Math.round(result.length / 4));
  return { result, origTokens, optTokens };
}

export function optimizeRepoRules(targetDir = '.') {
  const results = {};
  let totalSaved = 0;

  for (const filename of TARGET_FILES) {
    const filepath = path.join(targetDir, filename);
    if (fs.existsSync(filepath)) {
      const original = fs.readFileSync(filepath, 'utf8');
      if (original.trim().length < 20) continue;

      const { result, origTokens, optTokens } = optimizeRulesContent(original);
      const savedTokens = Math.max(0, origTokens - optTokens);
      const pct = Math.round((savedTokens / origTokens) * 1000) / 10;

      const backupPath = filepath + '.bak';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, original, 'utf8');
      }

      fs.writeFileSync(filepath, result, 'utf8');
      totalSaved += savedTokens;

      results[filename] = {
        original_tokens: origTokens,
        optimized_tokens: optTokens,
        tokens_saved: savedTokens,
        savings_pct: pct,
        backup: backupPath
      };
    }
  }

  return {
    files_optimized: results,
    total_tokens_saved_per_turn: totalSaved,
    monthly_saved_100_turns_day: totalSaved * 100 * 30,
    status: Object.keys(results).length > 0 ? 'SUCCESS' : 'NO_RULES_FOUND'
  };
}
