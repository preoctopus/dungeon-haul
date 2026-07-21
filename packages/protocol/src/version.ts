/** Wire protocol version. Mismatch → `S2C_Error` with code "PROTOCOL". */
export const protocolVersion = 1 as const;

export type ProtocolVersion = typeof protocolVersion;
