const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUserId(id: string): boolean {
  return UUID_RE.test(id);
}

export function rolesPayload(
  client: boolean,
  worker: boolean,
): ("CLIENT" | "WORKER")[] {
  const r: ("CLIENT" | "WORKER")[] = [];
  if (client) r.push("CLIENT");
  if (worker) r.push("WORKER");
  return r;
}
