import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolve workspace packages from source so `pnpm test` does not require a
// prior `pnpm -r build` (dist). Runtime (dist/main.js) still resolves the
// built packages via node_modules.
export default defineConfig({
  resolve: {
    alias: {
      "@dhaul/protocol": fileURLToPath(
        new URL("../packages/protocol/src/index.ts", import.meta.url),
      ),
      "@dhaul/levels": fileURLToPath(
        new URL("../packages/levels/src/index.ts", import.meta.url),
      ),
      "@dhaul/rules": fileURLToPath(
        new URL("../packages/rules/src/index.ts", import.meta.url),
      ),
      "@dhaul/ai": fileURLToPath(
        new URL("../packages/ai/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
