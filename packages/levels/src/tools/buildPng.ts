import { PNG } from "pngjs";

export type PaintFn = (x: number, y: number, hex: string, alpha?: number) => void;

/**
 * Build an RGBA PNG buffer for tests/fixtures: fill with `fillHex`, then let
 * `paint` set individual pixels. Deterministic for identical inputs.
 */
export function buildPng(
  width: number,
  height: number,
  fillHex: string,
  paint: (set: PaintFn) => void,
): Buffer {
  const png = new PNG({ width, height });
  const set: PaintFn = (x, y, hex, alpha = 255) => {
    const i = (y * width + x) * 4;
    png.data[i] = parseInt(hex.slice(1, 3), 16);
    png.data[i + 1] = parseInt(hex.slice(3, 5), 16);
    png.data[i + 2] = parseInt(hex.slice(5, 7), 16);
    png.data[i + 3] = alpha;
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) set(x, y, fillHex);
  }
  paint(set);
  return PNG.sync.write(png);
}
