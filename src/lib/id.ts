/** Small, dependency-free id generator. */
export function newId(prefix = ''): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}-${rnd}` : rnd;
}

/** Stable random device id used as the Lemon Squeezy license instance name. */
export function getOrCreateInstanceId(): string {
  const KEY = 'ca.instanceId';
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;
    const id = newId('device');
    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return newId('device');
  }
}
