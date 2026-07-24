import { describe, expect, it } from "vitest";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "../src/shell/config.js";
import { computeIntegerZoom } from "../src/shell/scale.js";

describe("computeIntegerZoom", () => {
  it("returns 2 for an exact 2x viewport", () => {
    expect(computeIntegerZoom(LOGICAL_WIDTH * 2, LOGICAL_HEIGHT * 2)).toBe(2);
  });

  it("floors to the limiting dimension", () => {
    expect(computeIntegerZoom(LOGICAL_WIDTH * 3, LOGICAL_HEIGHT * 1.5)).toBe(1);
  });

  it("returns 0 when the viewport is smaller than 1x", () => {
    expect(computeIntegerZoom(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2)).toBe(0);
  });

  it("handles ultrawide windows (wide but not tall)", () => {
    expect(computeIntegerZoom(3440, 1440)).toBe(2);
  });
});
