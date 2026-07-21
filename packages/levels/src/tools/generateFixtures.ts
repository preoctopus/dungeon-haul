// CLI: regenerate the committed fixture map.png files.
//   pnpm --filter @dhaul/levels gen:fixtures [contentRoot]
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildBoxLevelMap, buildHoardMap } from "./fixtureMaps.js";

const root =
  process.argv[2] ?? fileURLToPath(new URL("../../../../content", import.meta.url));

const targets: [string, Buffer][] = [
  ["box_level", buildBoxLevelMap()],
  ["hoard_01", buildHoardMap()],
];

for (const [id, png] of targets) {
  const dir = join(root, "levels", id);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "map.png");
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
