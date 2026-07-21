/**
 * P2 dev lobby overlay (NOT the C-01 Lobby scene — that lands in P4).
 * A minimal DOM panel to create or join a session by code so two browsers can
 * meet on the box level. Resolves with the REST result the game scene needs.
 */

import { createSession, joinSession } from "../net/lobbyClient.js";

export interface LobbyResult {
  serverUrl: string;
  wsUrl: string;
  sessionId: string;
  seatToken: string;
  reconnectToken: string;
  displayName: string;
  /** Present on join; create resolves seatId from the WS welcome instead. */
  seatId?: number;
}

/** Default REST origin; overridable via ?server= for split-host dev. */
function defaultServerUrl(): string {
  const param = new URLSearchParams(location.search).get("server");
  if (param) return param.replace(/\/$/, "");
  return `${location.protocol}//${location.hostname}:8080`;
}

export function showLobbyOverlay(): Promise<LobbyResult> {
  return new Promise((resolve) => {
    const root = document.createElement("div");
    root.id = "lobby-overlay";
    root.innerHTML = `
      <style>
        #lobby-overlay {
          position: fixed; inset: 0; display: flex; align-items: center;
          justify-content: center; font-family: system-ui, sans-serif;
          background: rgba(12, 9, 20, 0.92); color: #eee; z-index: 10;
        }
        #lobby-overlay .panel {
          background: #221b33; padding: 28px 32px; border-radius: 12px;
          width: 320px; box-shadow: 0 10px 40px rgba(0,0,0,.5);
        }
        #lobby-overlay h1 { margin: 0 0 4px; font-size: 22px; }
        #lobby-overlay p.sub { margin: 0 0 18px; color: #9b8fb5; font-size: 13px; }
        #lobby-overlay label { display: block; font-size: 12px; margin: 12px 0 4px; color: #b9afd0; }
        #lobby-overlay input {
          width: 100%; box-sizing: border-box; padding: 9px 10px; border-radius: 6px;
          border: 1px solid #3d3255; background: #171122; color: #fff; font-size: 15px;
        }
        #lobby-overlay input#code { text-transform: uppercase; letter-spacing: 3px; }
        #lobby-overlay button {
          margin-top: 16px; width: 100%; padding: 11px; border: 0; border-radius: 7px;
          font-size: 15px; font-weight: 600; cursor: pointer; color: #fff;
        }
        #lobby-overlay button.create { background: #6b4bd6; }
        #lobby-overlay button.join { background: #2f6d4f; }
        #lobby-overlay .row { display: flex; gap: 10px; align-items: flex-end; }
        #lobby-overlay .row input { flex: 1; }
        #lobby-overlay .row button { margin-top: 0; width: auto; padding: 9px 14px; }
        #lobby-overlay .msg { margin-top: 14px; min-height: 18px; font-size: 13px; color: #ff9c9c; }
      </style>
      <div class="panel">
        <h1>Dungeon Haul</h1>
        <p class="sub">P2 netcode slice — box level</p>
        <label for="name">Name</label>
        <input id="name" maxlength="12" placeholder="Hauler" />
        <button class="create" id="btn-create">Create room</button>
        <label for="code">Join with code</label>
        <div class="row">
          <input id="code" maxlength="6" placeholder="ABC123" />
          <button class="join" id="btn-join">Join</button>
        </div>
        <div class="msg" id="msg"></div>
      </div>`;
    document.body.appendChild(root);

    const serverUrl = defaultServerUrl();
    const $ = <T extends HTMLElement>(id: string): T => root.querySelector(`#${id}`) as T;
    const nameEl = $<HTMLInputElement>("name");
    const codeEl = $<HTMLInputElement>("code");
    const msgEl = $<HTMLDivElement>("msg");
    const createBtn = $<HTMLButtonElement>("btn-create");
    const joinBtn = $<HTMLButtonElement>("btn-join");

    const done = (result: LobbyResult): void => {
      root.remove();
      resolve(result);
    };
    const fail = (err: unknown): void => {
      msgEl.textContent = err instanceof Error ? err.message : "request failed";
      createBtn.disabled = false;
      joinBtn.disabled = false;
    };

    createBtn.addEventListener("click", () => {
      const displayName = nameEl.value.trim() || "Hauler";
      createBtn.disabled = true;
      joinBtn.disabled = true;
      msgEl.textContent = "creating…";
      createSession(serverUrl, displayName)
        .then((res) => {
          msgEl.style.color = "#9be6b4";
          msgEl.textContent = `Room ${res.joinCode} — share this code`;
          setTimeout(
            () =>
              done({
                serverUrl,
                wsUrl: res.wsUrl,
                sessionId: res.sessionId,
                seatToken: res.hostSeatToken,
                reconnectToken: res.reconnectToken,
                displayName,
              }),
            600,
          );
        })
        .catch(fail);
    });

    joinBtn.addEventListener("click", () => {
      const displayName = nameEl.value.trim() || "Hauler";
      const joinCode = codeEl.value.trim().toUpperCase();
      if (joinCode.length < 4) {
        msgEl.textContent = "enter a room code";
        return;
      }
      createBtn.disabled = true;
      joinBtn.disabled = true;
      msgEl.textContent = "joining…";
      joinSession(serverUrl, joinCode, displayName)
        .then((res) =>
          done({
            serverUrl,
            wsUrl: res.wsUrl,
            sessionId: res.sessionId,
            seatToken: res.seatToken,
            reconnectToken: res.reconnectToken,
            displayName,
            seatId: res.seatId,
          }),
        )
        .catch(fail);
    });
  });
}
