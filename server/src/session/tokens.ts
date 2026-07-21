/**
 * Seat / reconnect token helpers (C-05 DESIGN §5): high-entropy opaque
 * tokens; only SHA-256 hashes are stored server-side; constant-time compare.
 */

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function issueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyToken(token: string, storedHash: string): boolean {
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
