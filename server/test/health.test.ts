import { describe, expect, it } from "vitest";
import { createApp, serverVersion } from "../src/app.js";

describe("GET /health", () => {
  it("returns ok with version", async () => {
    const res = await createApp().request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, version: serverVersion });
  });
});
