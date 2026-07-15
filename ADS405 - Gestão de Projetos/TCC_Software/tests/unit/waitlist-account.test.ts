import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.MONGODB_URI = "mongodb://localhost:27017/ticketflow-test";
process.env.NEXTAUTH_SECRET = "test-secret-key-minimum-32-chars-long-xx";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-chars-long-xx";
process.env.TICKET_HMAC_SECRET = "test-hmac-secret-key-minimum-16-chars";

import { connectDB, disconnectDB } from "@/lib/db";
import Waitlist from "@/modules/events/models/waitlist.model";
import { joinByAccount, getAccountPosition } from "@/modules/events/repositories/waitlist.repository";

const W = Waitlist as any;
const EVENT = "evt-fila-1";

describe("Fila FIFO por conta", () => {
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    await connectDB();
    await W.syncIndexes();
  });

  afterAll(async () => {
    await disconnectDB();
    await mongo.stop();
  });

  it("atribui posições FIFO por conta na ordem de chegada", async () => {
    const a = await joinByAccount({ eventId: EVENT, userId: "userA", name: "A", email: "a@test.com" });
    const b = await joinByAccount({ eventId: EVENT, userId: "userB", name: "B", email: "b@test.com" });
    expect(a.position).toBe(1);
    expect(b.position).toBe(2);
    expect(b.total).toBe(2);
  });

  it("re-entrar com a mesma conta mantém a mesma posição (idempotente)", async () => {
    const again = await joinByAccount({ eventId: EVENT, userId: "userA", name: "A", email: "a@test.com", phone: "31999" });
    expect(again.position).toBe(1);
    expect(again.total).toBe(2); // não cria duplicata
  });

  it("getAccountPosition devolve a posição persistida da conta", async () => {
    const posB = await getAccountPosition(EVENT, "userB");
    expect(posB?.position).toBe(2);
    const none = await getAccountPosition(EVENT, "ninguem");
    expect(none).toBeNull();
  });

  it("adota inscrição antiga sem conta (mesmo e-mail) preservando a posição de chegada", async () => {
    // Simula uma entrada do seed: sem userId, criada antes das demais.
    const legacyEvent = "evt-legacy";
    await W.create({ eventId: legacyEvent, name: "Carla", email: "carla@test.com", status: "waiting" });
    const later = await joinByAccount({ eventId: legacyEvent, userId: "userLater", name: "Novo", email: "novo@test.com" });
    // Carla (legado) chegou primeiro; ao logar e entrar, mantém a posição 1.
    const carla = await joinByAccount({ eventId: legacyEvent, userId: "userCarla", name: "Carla", email: "carla@test.com" });
    expect(carla.position).toBe(1);
    expect(later.position).toBe(2);
    expect(carla.total).toBe(2); // não duplicou a entrada da Carla
    const count = await W.countDocuments({ eventId: legacyEvent });
    expect(count).toBe(2);
  });
});
