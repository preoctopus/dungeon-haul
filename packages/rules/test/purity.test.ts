/**
 * C07-T03 — Purity / boundary guard.
 * Fails if any module under src/ imports phaser, colyseus, fs, path, node:*,
 * or other impure surfaces. The test itself runs under Node (Vitest) and may
 * use node:fs — the constraint applies to package source, not tests.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC_DIR = fileURLToPath(new URL("../src", import.meta.url));

const FORBIDDEN_IMPORTS = [
  /^phaser(\/|$)/,
  /^colyseus(\/|$)/,
  /^@colyseus\//,
  /^fs(\/|$)/,
  /^path(\/|$)/,
  /^node:/,
  /^@dhaul\/(?!rules)/, // no client/server/protocol coupling
];

const FORBIDDEN_CALLS = [/\bMath\.random\s*\(/, /\bDate\.now\s*\(/];

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/** Strip line and block comments so doc text can mention forbidden APIs. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function importSpecifiers(source: string): string[] {
  const specs: string[] = [];
  const patterns = [
    /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s*["']([^"']+)["']/g,
    /(?:^|\n)\s*import\s*["']([^"']+)["']/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of patterns) {
    for (const match of source.matchAll(re)) {
      specs.push(match[1] as string);
    }
  }
  return specs;
}

describe("@dhaul/rules purity (C07-T03)", () => {
  const files = listSourceFiles(SRC_DIR);

  it("has source files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("never imports phaser / colyseus / fs / path / node:*", () => {
    const violations: string[] = [];
    for (const file of files) {
      const source = stripComments(readFileSync(file, "utf8"));
      for (const spec of importSpecifiers(source)) {
        if (FORBIDDEN_IMPORTS.some((re) => re.test(spec))) {
          violations.push(`${file}: import "${spec}"`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("never calls Math.random() or Date.now() (inject Rng instead)", () => {
    const violations: string[] = [];
    for (const file of files) {
      const source = stripComments(readFileSync(file, "utf8"));
      for (const re of FORBIDDEN_CALLS) {
        if (re.test(source)) {
          violations.push(`${file}: matches ${re}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
