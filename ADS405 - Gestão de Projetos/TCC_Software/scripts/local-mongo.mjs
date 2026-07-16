/**
 * Sobe um MongoDB efêmero (mongodb-memory-server) numa porta fixa e mantém vivo,
 * para que os processos de seed + dev + captura possam conectar.
 *   node scripts/local-mongo.mjs
 * Conecte em: mongodb://127.0.0.1:27099/tcc
 */
import { MongoMemoryServer } from "mongodb-memory-server";

const server = await MongoMemoryServer.create({
  instance: { port: 27099, ip: "127.0.0.1", dbName: "tcc" },
});

console.log("LOCAL_MONGO_READY", server.getUri());
process.on("SIGINT", async () => { await server.stop(); process.exit(0); });
process.on("SIGTERM", async () => { await server.stop(); process.exit(0); });
// keep alive
setInterval(() => {}, 1 << 30);
