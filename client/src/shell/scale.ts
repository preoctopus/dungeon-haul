import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./config.js";

/**
 * Largest integer multiple of the 960×540 logical canvas that fits inside a
 * viewport, or 0 if even 1× doesn't fit. Scale.FIT already letterboxes at any
 * size; this is a helper for callers (e.g. UI crispness decisions) that want
 * to know when a clean integer multiple is available.
 */
export function computeIntegerZoom(viewportWidth: number, viewportHeight: number): number {
  const maxByWidth = Math.floor(viewportWidth / LOGICAL_WIDTH);
  const maxByHeight = Math.floor(viewportHeight / LOGICAL_HEIGHT);
  return Math.max(0, Math.min(maxByWidth, maxByHeight));
}
