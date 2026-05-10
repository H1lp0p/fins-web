/**
 * Публичный origin dev-сервера (например за nginx / туннелем).
 * Включает HMR на том же хосте, с которого открыта страница.
 */
export type DevPublicOriginServerOptions = {
  host: true;
  strictPort: true;
  hmr: { protocol: "ws" | "wss"; host: string; clientPort: number };
  origin: string;
  allowedHosts: true;
};

export function resolveDevPublicOriginServer(
  raw: string | undefined,
): DevPublicOriginServerOptions | undefined {
  const trimmed = raw?.trim().replace(/\/$/, "") ?? "";
  if (!trimmed) {
    return undefined;
  }
  const href = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(href);
    const https = u.protocol === "https:";
    const origin = `${u.protocol}//${u.host}`;
    const clientPort =
      u.port !== "" ? Number(u.port) : https ? 443 : 80;
    return {
      host: true,
      strictPort: true,
      hmr: {
        protocol: https ? "wss" : "ws",
        host: u.hostname,
        clientPort,
      },
      origin,
      allowedHosts: true,
    };
  } catch {
    return undefined;
  }
}
