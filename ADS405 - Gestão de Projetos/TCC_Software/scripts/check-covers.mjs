/**
 * Diagnostic: fetches every event coverImageUrl from the DB, hashes the bytes,
 * and reports which events share the same image (duplicates). Source of truth is
 * the DB itself, so it always reflects what was seeded.
 *   node scripts/check-covers.mjs
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import mongoose from "mongoose";

for (const f of [".env.local", ".env", ".env.example"]) {
  const p = path.join(process.cwd(), f);
  if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }
}

const uri = process.env.MONGODB_URI;
await mongoose.connect(uri);
const events = await mongoose.connection.db
  .collection("tcc_events")
  .find({}, { projection: { slug: 1, title: 1, coverImageUrl: 1 } })
  .toArray();

const byHash = new Map();
for (const e of events) {
  try {
    const res = await fetch(e.coverImageUrl, { redirect: "follow" });
    const buf = Buffer.from(await res.arrayBuffer());
    const h = crypto.createHash("md5").update(buf).digest("hex").slice(0, 12);
    if (!byHash.has(h)) byHash.set(h, []);
    byHash.get(h).push(e.title);
  } catch (err) {
    console.log("ERR", e.slug, err.message);
  }
}

let dupGroups = 0;
for (const [h, titles] of byHash) {
  if (titles.length > 1) {
    dupGroups += 1;
    console.log(`DUP [${h}] x${titles.length}: ${titles.join(" | ")}`);
  }
}
console.log(`\n${events.length} eventos · ${byHash.size} imagens únicas · ${dupGroups} grupos duplicados`);
await mongoose.disconnect();
