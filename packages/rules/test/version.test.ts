import { describe, expect, it } from "vitest";
import { rulesetVersion } from "../src/index.js";

describe("@dhaul/rules", () => {
  it("exports rulesetVersion 1.0.0", () => {
    expect(rulesetVersion).toBe("1.0.0");
  });
});
