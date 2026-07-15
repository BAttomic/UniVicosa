/**
 * Drops only tcc_ collections in the current MongoDB database.
 * Run with: npx tsx scripts/reset-db.ts
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

for (const envFile of [".env.local", ".env", ".env.example"]) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ticketflow";
  await mongoose.connect(uri);
  console.log("Connected to", uri);

  const collections = await mongoose.connection.db!.collections();
  for (const collection of collections) {
    if (!collection.collectionName.startsWith("tcc_")) {
      continue;
    }

    await collection.drop();
    console.log("Dropped collection:", collection.collectionName);
  }

  await mongoose.disconnect();
  console.log("Database reset complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
