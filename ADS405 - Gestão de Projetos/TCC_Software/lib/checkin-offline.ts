// Offline check-in support (browser-side).
//
// Strategy: while online, the operator downloads a per-event "manifest" with the
// codes of all VALID tickets. When offline, scans are validated against that
// allowlist and queued locally; when connectivity returns the queue is flushed
// to /api/checkin/sync, which is the single source of truth for double-use.
//
// Security note: the rotating HMAC `secret` cannot be verified without the
// server secret, so offline mode only proves the code is a real issued ticket
// (in the manifest) and was not already validated on this device. The server
// still enforces single-use atomically at sync time. This is the standard
// trade-off for offline gate validation.

export type OfflineManifest = {
  eventId: string;
  eventTitle: string;
  codes: string[];
  downloadedAt: string;
};

export type QueuedCheckin = {
  code: string;
  secret: string;
  eventId: string;
  eventTitle: string;
  occurredAt: string;
  deviceId: string;
};

export type OfflineDecision =
  | { ok: true; message: string }
  | { ok: false; reason: "not_found" | "already_used"; message: string };

const MANIFEST_PREFIX = "ticketflow:checkin:manifest:";
const QUEUE_KEY = "ticketflow:checkin:queue";

// ---------------------------------------------------------------------------
// Pure core (no browser APIs — unit-testable)
// ---------------------------------------------------------------------------

export function evaluateOfflineScan(
  code: string,
  validCodes: Set<string>,
  queuedCodes: Set<string>,
): OfflineDecision {
  if (!validCodes.has(code)) {
    return {
      ok: false,
      reason: "not_found",
      message: "Ingresso não encontrado na lista offline. Baixe o evento e tente novamente.",
    };
  }
  if (queuedCodes.has(code)) {
    return {
      ok: false,
      reason: "already_used",
      message: "Ingresso já validado offline neste dispositivo.",
    };
  }
  return {
    ok: true,
    message: "Check-in offline registrado. Será sincronizado quando houver conexão.",
  };
}

// ---------------------------------------------------------------------------
// Storage helpers (browser-only, defensive against SSR / private mode)
// ---------------------------------------------------------------------------

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function saveManifest(manifest: OfflineManifest): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(MANIFEST_PREFIX + manifest.eventId, JSON.stringify(manifest));
}

export function loadManifests(): OfflineManifest[] {
  const storage = getStorage();
  if (!storage) return [];
  const out: OfflineManifest[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !key.startsWith(MANIFEST_PREFIX)) continue;
    try {
      const parsed = JSON.parse(storage.getItem(key) ?? "");
      if (parsed && Array.isArray(parsed.codes)) out.push(parsed as OfflineManifest);
    } catch {
      // ignore corrupted entry
    }
  }
  return out;
}

export function clearManifests(): void {
  const storage = getStorage();
  if (!storage) return;
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(MANIFEST_PREFIX)) keys.push(key);
  }
  keys.forEach((k) => storage.removeItem(k));
}

/** Map of ticket code -> owning event, built from all downloaded manifests. */
export function buildCodeIndex(manifests: OfflineManifest[]): Map<string, { eventId: string; eventTitle: string }> {
  const index = new Map<string, { eventId: string; eventTitle: string }>();
  for (const m of manifests) {
    for (const code of m.codes) {
      index.set(code, { eventId: m.eventId, eventTitle: m.eventTitle });
    }
  }
  return index;
}

export function loadQueue(): QueuedCheckin[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(QUEUE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as QueuedCheckin[]) : [];
  } catch {
    return [];
  }
}

export function saveQueue(queue: QueuedCheckin[]): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueCheckin(item: QueuedCheckin): QueuedCheckin[] {
  const queue = loadQueue();
  queue.push(item);
  saveQueue(queue);
  return queue;
}

/** Remove the given codes from the queue (after a successful/conflicting sync). */
export function removeFromQueue(codes: string[]): QueuedCheckin[] {
  const toRemove = new Set(codes);
  const remaining = loadQueue().filter((item) => !toRemove.has(item.code));
  saveQueue(remaining);
  return remaining;
}
