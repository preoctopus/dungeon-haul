/**
 * P2 lobby-less dev UI (DOM): create / join-by-code, then hand tokens to the
 * SessionClient and start the render scene. Real lobby UX is C-01 (P4).
 */

import type Phaser from "phaser";
import { createSession, fetchLevel, joinSession } from "./net/lobbyClient.js";
import { SessionClient } from "./net/sessionClient.js";
import { loadBundle, type SessionBundle } from "./net/tokenStore.js";
import { GameScene } from "./scenes/GameScene.js";

const SERVER_URL = import.meta.env["VITE_SERVER_URL"] ?? "http://localhost:8080";
const P2_LEVEL_ID = "box_level";

export function mountDevLobby(game: Phaser.Game): void {
  const root = document.createElement("div");
  root.style.cssText =
    "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;font-family:system-ui;background:#000c;z-index:100;color:#eee";
  root.innerHTML = `
    <div style="background:#1a1626;padding:24px;border-radius:8px;min-width:320px">
      <h2 style="margin:0 0 12px">Dungeon Haul — P2 dev</h2>
      <input id="dh-name" placeholder="Name" value="Hauler" style="width:100%;margin-bottom:8px;padding:6px" />
      <button id="dh-create" style="width:100%;padding:8px;margin-bottom:12px">Create room</button>
      <div style="display:flex;gap:8px">
        <input id="dh-code" placeholder="JOIN CODE" style="flex:1;padding:6px;text-transform:uppercase" />
        <button id="dh-join" style="padding:8px">Join</button>
      </div>
      <p id="dh-status" style="margin:12px 0 0;color:#9fe;min-height:1.2em"></p>
    </div>`;
  document.body.appendChild(root);

  const status = root.querySelector<HTMLParagraphElement>("#dh-status")!;
  const nameInput = root.querySelector<HTMLInputElement>("#dh-name")!;
  const setStatus = (s: string): void => {
    status.textContent = s;
  };

  const start = async (bundle: SessionBundle, resume: boolean): Promise<void> => {
    const geometry = await fetchLevel(bundle.serverUrl, P2_LEVEL_ID);
    const session = new SessionClient(geometry, {
      onState: (st, detail) => setStatus(`${st}${detail ? " — " + detail : ""}`),
    });
    if (resume) {
      const ok = await session.tryResume();
      if (!ok) {
        setStatus("could not resume; create or join again");
        return;
      }
    } else {
      await session.connect(bundle);
    }
    root.remove();
    if (!game.scene.getScene("Game")) game.scene.add("Game", GameScene, false);
    game.scene.start("Game", { session, geometry });
  };

  root.querySelector<HTMLButtonElement>("#dh-create")!.onclick = async () => {
    try {
      setStatus("creating…");
      const res = await createSession(SERVER_URL, nameInput.value.trim() || "Hauler");
      setStatus(`room ${res.joinCode} — share it with players`);
      await start(
        {
          serverUrl: SERVER_URL,
          wsUrl: res.wsUrl,
          sessionId: res.sessionId,
          seatId: 0,
          seatToken: res.hostSeatToken,
          reconnectToken: res.reconnectToken,
          displayName: nameInput.value.trim() || "Hauler",
        },
        false,
      );
    } catch (e) {
      setStatus(`error: ${(e as Error).message}`);
    }
  };

  root.querySelector<HTMLButtonElement>("#dh-join")!.onclick = async () => {
    try {
      const code = root.querySelector<HTMLInputElement>("#dh-code")!.value.trim();
      setStatus("joining…");
      const res = await joinSession(SERVER_URL, code, nameInput.value.trim() || "Hauler");
      await start(
        {
          serverUrl: SERVER_URL,
          wsUrl: res.wsUrl,
          sessionId: res.sessionId,
          seatId: res.seatId,
          seatToken: res.seatToken,
          reconnectToken: res.reconnectToken,
          displayName: nameInput.value.trim() || "Hauler",
        },
        false,
      );
    } catch (e) {
      setStatus(`error: ${(e as Error).message}`);
    }
  };

  // Auto-resume on refresh if a session bundle is present.
  const existing = loadBundle();
  if (existing) {
    setStatus("resuming previous session…");
    void start(existing, true).catch(() => setStatus("resume failed; create or join"));
  }
}
