/**
 * C09-T25 — Edge cases in content root validation (DESIGN §12).
 */

import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { validateContentRoot } from "../src/index.js";
import { CONTENT_ROOT } from "./helpers.js";

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** Copy the real content pack to a temp dir. */
function copyContentRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "dhaul-val-"));
  tmpRoots.push(root);
  cpSync(CONTENT_ROOT, root, { recursive: true });
  return root;
}

describe("validateContentRoot — loadContentRoot failure (uncovered line 36-38)", () => {
  it("returns errors when level-pool.json is missing", () => {
    const root = copyContentRoot();
    rmSync(join(root, "level-pool.json"), { force: true });
    const report = validateContentRoot(root);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it("returns errors when level-pool.json is invalid JSON", () => {
    const root = copyContentRoot();
    writeFileSync(join(root, "level-pool.json"), "{this is not json!!!");
    const report = validateContentRoot(root);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it("returns errors when level-pool.json is empty", () => {
    const root = copyContentRoot();
    writeFileSync(join(root, "level-pool.json"), "");
    const report = validateContentRoot(root);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it("early-returns with errors when content is unparseable", () => {
    const root = copyContentRoot();
    writeFileSync(join(root, "palette.json"), "NOT JSON");
    const report = validateContentRoot(root);
    expect(report.errors.length).toBeGreaterThan(0);
  });

  it("returns empty levels array when validation fails before level iteration", () => {
    const root = copyContentRoot();
    writeFileSync(join(root, "level-pool.json"), "");
    const report = validateContentRoot(root);
    expect(report.levels).toEqual([]);
  });
});

describe("validateContentRoot — allowHeaderMismatch forbidden flag (DESIGN §6.3)", () => {
  it("reports META_INVALID error when meta.allowHeaderMismatch is true", () => {
    const root = copyContentRoot();
    // Find a level directory and set allowHeaderMismatch=true in its meta.json
    const boxLevelDir = join(root, "levels", "box_level");
    const metaPath = join(boxLevelDir, "meta.json");
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    meta.allowHeaderMismatch = true;
    writeFileSync(metaPath, JSON.stringify(meta));

    const report = validateContentRoot(root);
    expect(report.errors.some((e) => e.code === "META_INVALID")).toBe(true);
  });
});

describe("validateContentRoot — pool eligibility checks (DESIGN §12.1)", () => {
  it("reports POOL_UNKNOWN_LEVEL when hoardId references a missing level", () => {
    const root = copyContentRoot();
    const poolPath = join(root, "level-pool.json");
    const pool = JSON.parse(readFileSync(poolPath, "utf-8"));
    pool.hoardId = "level_xyz";
    writeFileSync(poolPath, JSON.stringify(pool));

    const report = validateContentRoot(root);
    expect(report.errors.some((e) => e.code === "POOL_UNKNOWN_LEVEL")).toBe(true);
  });

  it("reports POOL_UNKNOWN_LEVEL when playablePool references a missing level", () => {
    const root = copyContentRoot();
    const poolPath = join(root, "level-pool.json");
    const pool = JSON.parse(readFileSync(poolPath, "utf-8"));
    if (!pool.playablePool.includes("fake_level")) {
      pool.playablePool.push("fake_level");
      writeFileSync(poolPath, JSON.stringify(pool));
    }

    const report = validateContentRoot(root);
    expect(report.errors.some((e) => e.code === "POOL_UNKNOWN_LEVEL")).toBe(true);
  });

  it("reports POOL_INELIGIBLE_LEVEL when playablePool references a pool-ineligible level", () => {
    const root = copyContentRoot();
    // Find a level's meta and set poolEligible=false, then ensure it's in the playablePool
    const boxLevelDir = join(root, "levels", "box_level");
    const metaPath = join(boxLevelDir, "meta.json");
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    meta.poolEligible = false;
    writeFileSync(metaPath, JSON.stringify(meta));

    // Ensure box_level is still in the playablePool so we hit this code path
    const poolPath = join(root, "level-pool.json");
    const pool = JSON.parse(readFileSync(poolPath, "utf-8"));
    if (!pool.playablePool.includes("box_level")) {
      pool.playablePool.push("box_level");
      writeFileSync(poolPath, JSON.stringify(pool));
    }

    const report = validateContentRoot(root);
    expect(report.errors.some((e) => e.code === "POOL_INELIGIBLE_LEVEL")).toBe(true);
  });

  it("reports POOL_INVALID warning when playablePool has fewer than 2 entries", () => {
    const root = copyContentRoot();
    // Construct a minimal valid pool with only one playable level
    const poolPath = join(root, "level-pool.json");
    writeFileSync(poolPath, JSON.stringify({
      version: 1,
      hoardId: "hoard_01",
      playablePool: ["box_level"], // just 1 entry — triggers <2 warning
      levelsAfterHoardDefault: 2,
    }));

    const report = validateContentRoot(root);
    expect(
      report.warnings.some((e) => e.code === "POOL_INVALID" && e.message.includes("at least 2")),
    ).toBe(true);
  });
});

describe("validateContentRoot — level iteration", () => {
  it("collects all valid level IDs in the levels array", () => {
    const root = copyContentRoot();
    const report = validateContentRoot(root);
    expect(report.levels).toEqual(["box_level", "hoard_01"]);
  });

  it("skips broken levels without aborting validation of others", () => {
    // Create a fake second level directory with invalid meta to ensure the loop continues
    const root = copyContentRoot();
    const badLevelDir = join(root, "levels", "bad_level");
    mkdirSync(badLevelDir, { recursive: true });
    // Write an intentionally broken meta.json (missing required fields)
    writeFileSync(
      join(badLevelDir, "meta.json"),
      JSON.stringify({ id: "bad_level", version: undefined }),
    );

    const report = validateContentRoot(root);
    expect(report.errors.some((e) => e.code === "MISSING_FILE" || e.path?.includes("bad_level"))).toBe(
      true,
    );
  });
});
