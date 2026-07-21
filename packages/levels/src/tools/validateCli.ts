// CLI: validate the whole content pack (CI entry, C09-T28).
//   pnpm --filter @dhaul/levels validate [contentRoot]
// Exit codes: 0 = OK (warnings allowed), 1 = validation errors.
import { fileURLToPath } from "node:url";
import { validateContentRoot } from "../validate.js";

const root =
  process.argv[2] ?? fileURLToPath(new URL("../../../../content", import.meta.url));

const report = validateContentRoot(root);

for (const w of report.warnings) {
  console.warn(`WARN  [${w.code}] ${w.levelId ?? ""} ${w.message}`);
}
for (const e of report.errors) {
  const px = e.pixel ? ` at (${e.pixel.x},${e.pixel.y}) ${e.pixel.rgb}` : "";
  console.error(`ERROR [${e.code}] ${e.levelId ?? ""} ${e.message}${px}`);
}
console.log(
  `validated ${report.levels.length} level(s) under ${root}: ` +
    `${report.errors.length} error(s), ${report.warnings.length} warning(s)`,
);
process.exit(report.errors.length > 0 ? 1 : 0);
