import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "@/lib/db";

let mongo: MongoMemoryServer | undefined;

describe("Health", () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    process.env.MONGODB_URI = uri;
    await disconnectDB();
    global.mongoose = { conn: null, promise: null };
  }, 30000);

  afterAll(async () => {
    await disconnectDB();
    await mongo?.stop();
  });

  it("should connect to in-memory MongoDB via connectDB", async () => {
    const conn = await connectDB();
    expect(conn).toBeDefined();
    expect(mongoose.connection.readyState).toBe(1);
  });

  it("should return cached connection on second call", async () => {
    const conn1 = await connectDB();
    const conn2 = await connectDB();
    expect(conn1).toBe(conn2);
  });

  it("should disconnect cleanly", async () => {
    await connectDB();
    await disconnectDB();
    expect(global.mongoose?.conn).toBeNull();
  });
});
