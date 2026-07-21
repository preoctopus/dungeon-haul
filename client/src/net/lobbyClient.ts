/** REST helpers for lobby create/join (netcode-client DESIGN §2 non-goals:
 * C-04 only consumes tokens; the Shell drives these calls). */

import type {
  CreateSessionResponse,
  JoinSessionResponse,
} from "@dhaul/protocol";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T | { error: { code: string; message: string } };
  if (!res.ok) {
    const err = (json as { error?: { message?: string; code?: string } }).error;
    throw new Error(err?.message ?? `request failed (${res.status})`);
  }
  return json as T;
}

export function createSession(
  serverUrl: string,
  displayName: string,
): Promise<CreateSessionResponse> {
  return post(`${serverUrl}/api/v1/sessions`, { displayName });
}

export function joinSession(
  serverUrl: string,
  joinCode: string,
  displayName: string,
): Promise<JoinSessionResponse> {
  return post(`${serverUrl}/api/v1/sessions/join`, { joinCode, displayName });
}

export interface LevelGeometry {
  id: string;
  blockSizePx: number;
  width: number;
  height: number;
  solid: string[];
  spawns: { x: number; y: number }[];
  exit: { x: number; y: number; width: number; height: number };
}

export async function fetchLevel(
  serverUrl: string,
  levelId: string,
): Promise<LevelGeometry> {
  const res = await fetch(`${serverUrl}/api/v1/levels/${levelId}`);
  if (!res.ok) throw new Error(`level ${levelId} not found`);
  return (await res.json()) as LevelGeometry;
}

/** Build a SolidGrid from geometry rows for local prediction. */
export function gridFromGeometry(geo: LevelGeometry) {
  return {
    blockSizePx: geo.blockSizePx,
    widthCells: geo.width,
    heightCells: geo.height,
    isSolid: (cx: number, cy: number): boolean => {
      const row = geo.solid[cy];
      return row === undefined ? true : row[cx] === "#";
    },
  };
}
