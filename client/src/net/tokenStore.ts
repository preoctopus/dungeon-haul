/**
 * Reconnect credential bundle in sessionStorage (netcode-client DESIGN §5.1):
 * per-tab, survives refresh, cleared on intentional leave.
 */

export interface SessionBundle {
  serverUrl: string;
  wsUrl: string;
  sessionId: string;
  seatId: number;
  seatToken: string;
  reconnectToken: string;
  displayName?: string;
}

const KEY = "dhaul.session.v1";

export function saveBundle(bundle: SessionBundle): void {
  sessionStorage.setItem(KEY, JSON.stringify(bundle));
}

export function loadBundle(): SessionBundle | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionBundle;
    if (
      typeof parsed.wsUrl === "string" &&
      typeof parsed.sessionId === "string" &&
      typeof parsed.seatToken === "string"
    ) {
      return parsed;
    }
  } catch {
    // fall through
  }
  clearBundle();
  return null;
}

export function clearBundle(): void {
  sessionStorage.removeItem(KEY);
}
