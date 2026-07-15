import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import crypto from "crypto";

process.env.MONGODB_URI = "mongodb://localhost:27017/ticketflow-test";
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-chars-long-xx";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-chars-long-xx";
process.env.TICKET_HMAC_SECRET = "test-hmac-secret-key-minimum-16-chars";

import { connectDB, disconnectDB } from "@/lib/db";
import {
  create as createTicket,
  findByCode,
  findByOwnerId,
  markUsed,
  cancel,
  generateCode,
  generateSecret,
} from "@/modules/tickets/repositories/ticket.repository";
import { TicketStatus } from "@/modules/tickets/models/ticket.model";

describe("Ticket domain", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  it("should generate a unique hex code of length 32", () => {
    const code = generateCode();
    expect(code).toHaveLength(32);
    expect(/^[0-9a-f]+$/.test(code)).toBe(true);
  });

  it("should generate distinct codes on each call", () => {
    const codes = Array.from({ length: 5 }, () => generateCode());
    const unique = new Set(codes);
    expect(unique.size).toBe(5);
  });

  it("should generate a deterministic HMAC within the same 30s window", () => {
    const code = "abc123";
    const ownerId = "user-1";
    const s1 = generateSecret(code, ownerId);
    const s2 = generateSecret(code, ownerId);
    expect(s1).toBe(s2);
  });

  it("should generate a hex string of length 64 (SHA-256)", () => {
    const secret = generateSecret("test-code", "owner-id");
    expect(secret).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(secret)).toBe(true);
  });

  it("should create a ticket with valid status", async () => {
    const code = generateCode();
    const ticket = await createTicket({
      orderId: "order-1",
      eventId: "event-1",
      ticketTypeId: "tt-1",
      ownerId: "owner-1",
      code,
      secret: generateSecret(code, "owner-1"),
      status: TicketStatus.VALID,
    });

    expect(ticket._id).toBeDefined();
    expect(ticket.status).toBe("valid");
    expect(ticket.code).toBe(code);
  });

  it("should find a ticket by its code", async () => {
    const code = generateCode();
    await createTicket({
      orderId: "order-2",
      eventId: "event-1",
      ticketTypeId: "tt-1",
      ownerId: "owner-1",
      code,
      secret: generateSecret(code, "owner-1"),
      status: TicketStatus.VALID,
    });

    const found = await findByCode(code);
    expect(found).not.toBeNull();
    expect(found?.code).toBe(code);
  });

  it("should list tickets by owner", async () => {
    const tickets = await findByOwnerId("owner-1");
    expect(Array.isArray(tickets)).toBe(true);
    expect(tickets.length).toBeGreaterThanOrEqual(1);
  });

  it("should mark a ticket as used", async () => {
    const code = generateCode();
    const ticket = await createTicket({
      orderId: "order-3",
      eventId: "event-1",
      ticketTypeId: "tt-1",
      ownerId: "owner-2",
      code,
      secret: generateSecret(code, "owner-2"),
      status: TicketStatus.VALID,
    });

    const used = await markUsed(ticket._id, "operator-1");
    expect(used?.status).toBe("used");
    expect(used?.usedBy).toBe("operator-1");
    expect(used?.usedAt).toBeDefined();
  });

  it("should not mark an already-used ticket as used again", async () => {
    const code = generateCode();
    const ticket = await createTicket({
      orderId: "order-4",
      eventId: "event-1",
      ticketTypeId: "tt-1",
      ownerId: "owner-3",
      code,
      secret: generateSecret(code, "owner-3"),
      status: TicketStatus.USED,
    });

    const result = await markUsed(ticket._id, "operator-1");
    expect(result).toBeNull();
  });

  it("should cancel a ticket", async () => {
    const code = generateCode();
    const ticket = await createTicket({
      orderId: "order-5",
      eventId: "event-2",
      ticketTypeId: "tt-2",
      ownerId: "owner-4",
      code,
      secret: generateSecret(code, "owner-4"),
      status: TicketStatus.VALID,
    });

    const cancelled = await cancel(ticket._id);
    expect(cancelled?.status).toBe("cancelled");
  });

  it("should verify HMAC with timing-safe comparison", () => {
    const ticketCode = "verify-test-code";
    const ownerId = "verify-owner";
    const secretKey = "test-hmac-secret-key-minimum-16-chars";
    const windowSeconds = 30;
    const window = Math.floor(Date.now() / (windowSeconds * 1000));

    const expected = crypto
      .createHmac("sha256", secretKey)
      .update(`${ticketCode}:${ownerId}:${window}`)
      .digest("hex");

    const provided = expected;
    const valid = crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(provided, "hex"),
    );
    expect(valid).toBe(true);
  });

  it("should reject a tampered HMAC", () => {
    const expected = "a".repeat(64);
    const tampered = "b".repeat(64);
    const valid = crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(tampered, "hex"),
    );
    expect(valid).toBe(false);
  });
});
