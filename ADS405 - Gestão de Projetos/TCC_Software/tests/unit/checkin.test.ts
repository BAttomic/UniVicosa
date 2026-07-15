import { describe, it, expect } from "vitest";
import crypto from "crypto";

const TICKET_HMAC_SECRET = "test-hmac-secret-key-minimum-16-chars";

function generateSecret(ticketCode: string, ownerId: string, windowOverride?: number): string {
  const windowSeconds = 30;
  const window = windowOverride ?? Math.floor(Date.now() / (windowSeconds * 1000));
  return crypto.createHmac("sha256", TICKET_HMAC_SECRET).update(`${ticketCode}:${ownerId}:${window}`).digest("hex");
}

function verifyHmac(ticketCode: string, ownerId: string, providedSecret: string): boolean {
  const windowSeconds = 30;
  const nowWindow = Math.floor(Date.now() / (windowSeconds * 1000));

  for (const w of [nowWindow, nowWindow - 1]) {
    const expected = crypto
      .createHmac("sha256", TICKET_HMAC_SECRET)
      .update(`${ticketCode}:${ownerId}:${w}`)
      .digest("hex");
    if (expected === providedSecret) return true;
  }
  return false;
}

describe("Check-in HMAC validation", () => {
  it("should accept a secret generated in the current window", () => {
    const code = "ticket-abc";
    const owner = "user-123";
    const secret = generateSecret(code, owner);
    expect(verifyHmac(code, owner, secret)).toBe(true);
  });

  it("should accept a secret from the previous window (grace period)", () => {
    const code = "ticket-abc";
    const owner = "user-123";
    const windowSeconds = 30;
    const prevWindow = Math.floor(Date.now() / (windowSeconds * 1000)) - 1;
    const prevSecret = generateSecret(code, owner, prevWindow);
    expect(verifyHmac(code, owner, prevSecret)).toBe(true);
  });

  it("should reject a secret from two windows ago", () => {
    const code = "ticket-abc";
    const owner = "user-123";
    const windowSeconds = 30;
    const oldWindow = Math.floor(Date.now() / (windowSeconds * 1000)) - 2;
    const oldSecret = generateSecret(code, owner, oldWindow);
    expect(verifyHmac(code, owner, oldSecret)).toBe(false);
  });

  it("should reject a forged secret", () => {
    const code = "ticket-abc";
    const owner = "user-123";
    const forged = "0".repeat(64);
    expect(verifyHmac(code, owner, forged)).toBe(false);
  });

  it("should reject a secret generated for a different ticket code", () => {
    const owner = "user-123";
    const secretForOtherTicket = generateSecret("other-ticket", owner);
    expect(verifyHmac("ticket-abc", owner, secretForOtherTicket)).toBe(false);
  });

  it("should reject a secret generated for a different owner", () => {
    const code = "ticket-abc";
    const secretForOtherOwner = generateSecret(code, "other-owner");
    expect(verifyHmac(code, "user-123", secretForOtherOwner)).toBe(false);
  });

  it("should produce different secrets for different window numbers", () => {
    const code = "ticket-xyz";
    const owner = "owner-456";
    const windowSeconds = 30;
    const now = Math.floor(Date.now() / (windowSeconds * 1000));
    const s1 = generateSecret(code, owner, now);
    const s2 = generateSecret(code, owner, now + 1);
    expect(s1).not.toBe(s2);
  });
});
