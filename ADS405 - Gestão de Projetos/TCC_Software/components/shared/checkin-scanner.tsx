"use client";

import { useState, useCallback, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { CheckCircle, XCircle, Loader2, QrCode, Wifi, WifiOff, Download, RefreshCw, CloudUpload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  evaluateOfflineScan,
  saveManifest,
  loadManifests,
  buildCodeIndex,
  loadQueue,
  enqueueCheckin,
  removeFromQueue,
  type OfflineManifest,
} from "@/lib/checkin-offline";

type ScanResult = {
  ok: boolean;
  message: string;
  usedAt?: string;
  offline?: boolean;
};

type ScannerState = "idle" | "scanning" | "processing" | "success" | "error";

type EventOption = { id: string; title: string };

const DEVICE_ID = "web-scanner";

export function CheckinScanner({ events, initialEventId }: { events: EventOption[]; initialEventId?: string }) {
  const [state, setState] = useState<ScannerState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);

  const [online, setOnline] = useState(true);
  const [manifests, setManifests] = useState<OfflineManifest[]>([]);
  const [queueCount, setQueueCount] = useState(0);
  // Pré-seleciona o evento quando o check-in é aberto pelo gerenciador (?event=).
  const preselected = initialEventId && events.some((event) => event.id === initialEventId) ? initialEventId : "";
  const [selectedEventId, setSelectedEventId] = useState(preselected || events[0]?.id || "");
  const [downloading, setDownloading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSummary, setSyncSummary] = useState<string | null>(null);

  // Hydrate offline state and track connectivity.
  useEffect(() => {
    setOnline(navigator.onLine);
    setManifests(loadManifests());
    setQueueCount(loadQueue().length);

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const sync = useCallback(async () => {
    const queue = loadQueue();
    if (queue.length === 0 || syncing) return;
    setSyncing(true);
    setSyncSummary(null);
    try {
      const response = await fetch("/api/checkin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: queue }),
      });
      const data = await response.json();
      if (data.ok) {
        const handled = (data.results as { code: string }[]).map((r) => r.code);
        const remaining = removeFromQueue(handled);
        setQueueCount(remaining.length);
        setSyncSummary(`${data.synced} sincronizado(s), ${data.conflicts} conflito(s).`);
      } else {
        setSyncSummary("Falha ao sincronizar. Tente novamente.");
      }
    } catch {
      setSyncSummary("Sem conexão para sincronizar agora.");
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  // Auto-sync on the offline->online transition when there is a pending queue.
  useEffect(() => {
    if (online && queueCount > 0) void sync();
  }, [online]);

  async function downloadManifest() {
    if (!selectedEventId || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(`/api/checkin/manifest?eventId=${encodeURIComponent(selectedEventId)}`);
      const data = await response.json();
      if (data.ok) {
        const manifest: OfflineManifest = {
          eventId: data.eventId,
          eventTitle: data.eventTitle,
          codes: data.codes,
          downloadedAt: data.downloadedAt,
        };
        saveManifest(manifest);
        setManifests(loadManifests());
      }
    } catch {
      // ignore — operator stays online
    } finally {
      setDownloading(false);
    }
  }

  const handleOfflineScan = useCallback((code: string, secret: string) => {
    const all = loadManifests();
    const index = buildCodeIndex(all);
    const validCodes = new Set(index.keys());
    const queuedCodes = new Set(loadQueue().map((q) => q.code));

    const decision = evaluateOfflineScan(code, validCodes, queuedCodes);
    if (decision.ok) {
      const matched = index.get(code)!;
      const queue = enqueueCheckin({
        code,
        secret,
        eventId: matched.eventId,
        eventTitle: matched.eventTitle,
        occurredAt: new Date().toISOString(),
        deviceId: DEVICE_ID,
      });
      setQueueCount(queue.length);
      setResult({ ok: true, message: decision.message, offline: true });
      setState("success");
    } else {
      setResult({ ok: false, message: decision.message, offline: true });
      setState("error");
    }
  }, []);

  const handleScan = useCallback(
    async (detectedCodes: { rawValue: string }[]) => {
      if (state !== "scanning") return;
      const raw = detectedCodes[0]?.rawValue;
      if (!raw || raw === lastCode) return;

      let parsed: { code?: string; secret?: string };
      try {
        parsed = JSON.parse(raw);
      } catch {
        setResult({ ok: false, message: "QR Code inválido — não é um ingresso TicketFlow." });
        setState("error");
        return;
      }

      if (!parsed.code || !parsed.secret) {
        setResult({ ok: false, message: "QR Code inválido — campos ausentes." });
        setState("error");
        return;
      }

      setLastCode(raw);
      setState("processing");

      // Offline path: validate against the downloaded allowlist and queue.
      if (!navigator.onLine) {
        handleOfflineScan(parsed.code, parsed.secret);
        return;
      }

      try {
        const response = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: parsed.code, secret: parsed.secret, deviceId: DEVICE_ID }),
        });

        const data = (await response.json()) as ScanResult;
        setResult(data);
        setState(data.ok ? "success" : "error");
      } catch {
        // Network dropped mid-scan — fall back to offline validation.
        handleOfflineScan(parsed.code, parsed.secret);
      }
    },
    [state, lastCode, handleOfflineScan],
  );

  function reset() {
    setState("scanning");
    setResult(null);
    setLastCode(null);
  }

  const totalCachedCodes = manifests.reduce((sum, m) => sum + m.codes.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Connectivity + offline controls */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {online ? (
              <Wifi className="h-5 w-5 text-emerald-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-amber-600" />
            )}
            <span className={`text-sm font-medium ${online ? "text-emerald-700" : "text-amber-700"}`}>
              {online ? "Online" : "Offline — validando pela lista baixada"}
            </span>
          </div>
          {queueCount > 0 && (
            <Button size="sm" variant="outline" className="gap-2" onClick={() => void sync()} disabled={syncing || !online}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              Sincronizar ({queueCount})
            </Button>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <select
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.length === 0 && <option value="">Nenhum evento disponível</option>}
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-2 whitespace-nowrap" onClick={downloadManifest} disabled={downloading || !selectedEventId || !online}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Baixar para offline
            </Button>
            {selectedEventId ? (
              <a
                href={`/api/checkin/buyers?eventId=${encodeURIComponent(selectedEventId)}`}
                className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Lista de compradores (CSV)
              </a>
            ) : null}
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          {totalCachedCodes > 0
            ? `${totalCachedCodes} ingresso(s) em cache de ${manifests.length} evento(s).`
            : "Baixe os ingressos de um evento para validar mesmo sem internet."}
          {syncSummary && <span className="ml-1 font-medium text-slate-700">{syncSummary}</span>}
        </p>
      </div>

      {/* Scanner */}
      <div className="flex flex-col items-center gap-6">
        {state === "idle" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-48 w-48 items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50">
              <QrCode className="h-16 w-16 text-slate-300" />
            </div>
            <Button size="lg" className="gap-2" onClick={() => setState("scanning")}>
              <QrCode className="h-5 w-5" />
              Iniciar scanner
            </Button>
          </div>
        )}

        {state === "scanning" && (
          <div className="w-full max-w-sm">
            <div className="overflow-hidden rounded-2xl border-2 border-emerald-400 shadow-lg">
              <Scanner
                onScan={handleScan}
                onError={() => {
                  setResult({ ok: false, message: "Erro ao acessar câmera. Verifique as permissões." });
                  setState("error");
                }}
                styles={{ container: { height: 320 } }}
              />
            </div>
            <p className="mt-3 text-center text-sm text-slate-500">Aponte a câmera para o QR Code do ingresso</p>
            <Button variant="outline" className="mt-3 w-full" onClick={() => setState("idle")}>
              Cancelar
            </Button>
          </div>
        )}

        {state === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
            <p className="font-medium text-slate-700">Validando ingresso...</p>
          </div>
        )}

        {(state === "success" || state === "error") && result && (
          <div
            className={`flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border p-8 ${
              result.ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
            }`}
          >
            {result.ok ? (
              <CheckCircle className="h-16 w-16 text-emerald-600" />
            ) : (
              <XCircle className="h-16 w-16 text-rose-600" />
            )}
            <p className={`text-center text-lg font-bold ${result.ok ? "text-emerald-800" : "text-rose-800"}`}>
              {result.message}
            </p>
            {result.offline && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                <WifiOff className="h-3 w-3" /> Registrado offline
              </span>
            )}
            {result.usedAt && (
              <p className="text-center text-sm text-rose-600">
                Utilizado em: {new Date(result.usedAt).toLocaleString("pt-BR")}
              </p>
            )}
            <Button
              onClick={reset}
              className={`mt-2 w-full ${result.ok ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} text-white`}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Escanear próximo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
