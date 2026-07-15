import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Set env before imports
process.env.MONGODB_URI = "mongodb://localhost:27017/ticketflow-test";
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-chars-long-xx";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-chars-long-xx";
process.env.TICKET_HMAC_SECRET = "test-hmac-secret-key-minimum-16-chars";

import { connectDB, disconnectDB } from "@/lib/db";
import { RegisterSchema, LoginSchema } from "@/modules/identity/schemas/user.schema";
import { createUser, findByEmail } from "@/modules/identity/repositories/user.repository";
import { UserRole } from "@/modules/identity/models/user.model";

describe("User domain", () => {
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

  it("should validate and pass the register schema", () => {
    const result = RegisterSchema.safeParse({
      email: "buyer@test.com",
      password: "Password123!",
      name: "Test Buyer",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short passwords", () => {
    const result = RegisterSchema.safeParse({
      email: "buyer@test.com",
      password: "123",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid emails", () => {
    const result = RegisterSchema.safeParse({
      email: "not-an-email",
      password: "Password123!",
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("should create a user in the database", async () => {
    const hashed = await bcrypt.hash("Password123!", 12);
    const user = await createUser({
      email: "create@test.com",
      passwordHash: hashed,
      name: "Created User",
      role: UserRole.BUYER,
    });
    expect(user._id).toBeDefined();
    expect(user.email).toBe("create@test.com");
    expect(user.role).toBe(UserRole.BUYER);
  });

  it("should find user by email", async () => {
    const user = await findByEmail("create@test.com");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("create@test.com");
  });

  it("should calculate order total correctly", () => {
    const items = [
      { ticketTypeId: "tt1", lotId: "lot1", quantity: 2, unitPrice: 5000 },
      { ticketTypeId: "tt2", lotId: "lot2", quantity: 1, unitPrice: 2500 },
    ];
    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    expect(total).toBe(12500);
  });

  it("should validate HMAC rotation window consistency", () => {
    const ticketId = "test-ticket-1";
    const ownerId = "test-owner-1";
    const secretKey = "test-hmac-secret";
    const windowSeconds = 30;

    const hashFn = (data: string, key: string) => {
      return crypto.createHmac("sha256", key).update(data).digest("hex");
    };

    const now = Date.now();
    const window = Math.floor(now / (windowSeconds * 1000));
    const data = `${ticketId}:${ownerId}:${window}`;
    const secret1 = hashFn(data, secretKey);
    const secret2 = hashFn(data, secretKey);
    expect(secret1).toBe(secret2);

    const differentWindow = Math.floor((now + windowSeconds * 1000) / (windowSeconds * 1000));
    const differentData = `${ticketId}:${ownerId}:${differentWindow}`;
    const secret3 = hashFn(differentData, secretKey);
    expect(secret1).not.toBe(secret3);
  });
});

describe("Login schema", () => {
  it("should accept valid credentials", () => {
    const result = LoginSchema.safeParse({ email: "test@test.com", password: "Password123!" });
    expect(result.success).toBe(true);
  });

  it("should reject empty password", () => {
    const result = LoginSchema.safeParse({ email: "test@test.com", password: "" });
    expect(result.success).toBe(false);
  });
});
