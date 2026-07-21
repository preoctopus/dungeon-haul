/** Adapter: @dhaul/levels LevelDefinition → SolidGrid for kinematics. */

import { CELL_FLAGS, type LevelDefinition } from "@dhaul/levels";
import type { SolidGrid } from "./kinematics.js";

export function solidGridFromLevel(level: LevelDefinition): SolidGrid {
  const solid: boolean[][] = level.cells.map((row) =>
    row.map((cell) => CELL_FLAGS[cell].solid),
  );
  return {
    blockSizePx: level.blockSizePx,
    widthCells: level.width,
    heightCells: level.height,
    isSolid: (cx, cy) => solid[cy]?.[cx] ?? true,
  };
}

/** World-px spawn point for a seat (cell center; level spawns are cell coords). */
export function spawnWorldPos(
  level: LevelDefinition,
  seatId: 0 | 1 | 2 | 3,
): { x: number; y: number } {
  const cell = level.spawns[seatId];
  const bs = level.blockSizePx;
  return { x: cell.x * bs + bs / 2, y: cell.y * bs + bs / 2 };
}
