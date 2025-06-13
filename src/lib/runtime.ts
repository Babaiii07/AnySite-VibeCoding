const store = new Map<
  string,
  {
    count: number;
    expiresAt: number;
  }
>();

let lastCleanup = 0;
const CLEANUP_INTERVAL = 1000 * 60 * 60; // Cleanup every 1 hour

function clearStore() {
  const now = Date.now();
  for (const [fingerprint, target] of store.entries()) {
    if (target.expiresAt < now) {
      store.delete(fingerprint);
    }
  }
}

export function evaluateLoginBypass(
  fingerprint: string,
  isSkipCount?: boolean,
): boolean {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    clearStore();
    lastCleanup = now;
  }

  const target = store.get(fingerprint);
  console.log("[Bypass store keys] ", store.keys());
  console.log("[Bypass store target] ", target);

  if (!target || target.expiresAt < Date.now()) {
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24;
    store.set(fingerprint, { count: 1, expiresAt });
    return true;
  }

  if (target.count > 50) {
    return false;
  }

  if (!isSkipCount) {
    target.count++;
  }
  return true;
}
