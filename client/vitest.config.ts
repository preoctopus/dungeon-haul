import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolve @dhaul/protocol from source so client net unit tests run without a
// prior workspace build. Pure net modules (prediction/interp/mapper) don't
// import Phaser, so they run in a node environment.
export default defineConfig({
  resolve: {
    alias: {
      "@dhaul/protocol": fileURLToPath(
        new URL("../packages/protocol/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
