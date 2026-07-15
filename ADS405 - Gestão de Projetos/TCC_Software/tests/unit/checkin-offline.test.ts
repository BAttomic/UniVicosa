import { describe, it, expect } from "vitest";
import { evaluateOfflineScan, buildCodeIndex, type OfflineManifest } from "@/lib/checkin-offline";

describe("evaluateOfflineScan", () => {
  const valid = new Set(["abc", "def", "ghi"]);

  it("accepts a code present in the manifest and not yet queued", () => {
    const decision = evaluateOfflineScan("abc", valid, new Set());
    expect(decision.ok).toBe(true);
  });

  it("rejects a code that is not in the offline manifest", () => {
    const decision = evaluateOfflineScan("zzz", valid, new Set());
    expect(decision).toMatchObject({ ok: false, reason: "not_found" });
  });

  it("rejects a code already validated offline on this device", () => {
    const decision = evaluateOfflineScan("def", valid, new Set(["def"]));
    expect(decision).toMatchObject({ ok: false, reason: "already_used" });
  });

  it("treats not_found as higher priority than already_used", () => {
    // A code that is queued but no longer in the manifest is still not_found.
    const decision = evaluateOfflineScan("zzz", valid, new Set(["zzz"]));
    expect(decision).toMatchObject({ ok: false, reason: "not_found" });
  });
});

describe("buildCodeIndex", () => {
  it("maps every code to its owning event across manifests", () => {
    const manifests: OfflineManifest[] = [
      { eventId: "e1", eventTitle: "Show A", codes: ["a1", "a2"], downloadedAt: "2025-01-01T00:00:00Z" },
      { eventId: "e2", eventTitle: "Show B", codes: ["b1"], downloadedAt: "2025-01-01T00:00:00Z" },
    ];
    const index = buildCodeIndex(manifests);
    expect(index.get("a2")).toEqual({ eventId: "e1", eventTitle: "Show A" });
    expect(index.get("b1")).toEqual({ eventId: "e2", eventTitle: "Show B" });
    expect(index.size).toBe(3);
  });
});
