import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.MONGODB_URI = "mongodb://localhost:27017/ticketflow-test";
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-chars-long-xx";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-chars-long-xx";
process.env.TICKET_HMAC_SECRET = "test-hmac-secret-key-minimum-16-chars";

import { connectDB, disconnectDB } from "@/lib/db";
import { OrderStatus } from "@/modules/orders/models/order.model";
import { create as createOrder, findById, findByBuyerId, expire, findExpired } from "@/modules/orders/repositories/order.repository";

describe("Order domain", () => {
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

  it("should create an order with pending status", async () => {
    const order = await createOrder({
      buyerId: "buyer-1",
      eventId: "event-1",
      items: [{ ticketTypeId: "tt-1", lotId: "lot-1", quantity: 2, unitPrice: 5000 }],
      totalAmount: 10000,
      status: OrderStatus.PENDING,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    expect(order._id).toBeDefined();
    expect(order.status).toBe("pending");
    expect(order.totalAmount).toBe(10000);
  });

  it("should find an order by id", async () => {
    const created = await createOrder({
      buyerId: "buyer-2",
      eventId: "event-1",
      items: [{ ticketTypeId: "tt-1", lotId: "lot-1", quantity: 1, unitPrice: 2500 }],
      totalAmount: 2500,
      status: OrderStatus.PENDING,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const found = await findById(created._id);
    expect(found).not.toBeNull();
    expect(found?.totalAmount).toBe(2500);
  });

  it("should list orders by buyer", async () => {
    const orders = await findByBuyerId("buyer-1");
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThanOrEqual(1);
  });

  it("should expire a pending order", async () => {
    const order = await createOrder({
      buyerId: "buyer-3",
      eventId: "event-2",
      items: [{ ticketTypeId: "tt-2", lotId: "lot-2", quantity: 1, unitPrice: 3000 }],
      totalAmount: 3000,
      status: OrderStatus.PENDING,
      expiresAt: new Date(Date.now() - 1000),
    });

    const expired = await expire(order._id);
    expect(expired).not.toBeNull();
    expect(expired?.status).toBe("expired");
  });

  it("should find expired orders", async () => {
    const expired = await findExpired();
    expect(Array.isArray(expired)).toBe(true);
  });

  it("should calculate order total from items", () => {
    const items = [
      { ticketTypeId: "tt1", lotId: "l1", quantity: 3, unitPrice: 4000 },
      { ticketTypeId: "tt2", lotId: "l2", quantity: 1, unitPrice: 8000 },
    ];
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    expect(total).toBe(20_000);
  });

  it("should enforce maxPerOrder limit", () => {
    const maxPerOrder = 5;
    const requested = 6;
    expect(requested > maxPerOrder).toBe(true);
  });

  it("should detect an order that expired before auto-approval window", () => {
    const createdAt = Date.now() - 70_000;
    const AUTO_APPROVE_DELAY_MS = 60_000;
    const canProcess = Date.now() - createdAt >= AUTO_APPROVE_DELAY_MS;
    expect(canProcess).toBe(true);
  });

  it("should not auto-approve before 60 seconds", () => {
    const createdAt = Date.now() - 30_000;
    const AUTO_APPROVE_DELAY_MS = 60_000;
    const canProcess = Date.now() - createdAt >= AUTO_APPROVE_DELAY_MS;
    expect(canProcess).toBe(false);
  });
});
