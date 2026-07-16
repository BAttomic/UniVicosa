/**
 * Captura 3 prints mobile em 9:16 exato (1080x1920) para o portfólio.
 *   BASE_URL=http://localhost:3000 node scripts/shots-mobile-916.mjs
 * Saída: apresentacao-assets/916/{evento,ticket,checkin}.png
 */
import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT = path.join(process.cwd(), "apresentacao-assets", "916");
const BUYER = { email: process.env.BUYER_EMAIL || "buyer1@ticketflow.com", pass: process.env.BUYER_PASS || "Password123!" };
const OPERATOR = { email: process.env.OPERATOR_EMAIL || "operator@ticketflow.com", pass: process.env.OPERATOR_PASS || "Password123!" };

fs.mkdirSync(OUT, { recursive: true });

async function dismissCookies(page) {
  try {
    const btn = page.locator('button:has-text("Aceitar todos")').first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }); await page.waitForTimeout(400); }
  } catch {}
}

async function hideDevBadge(page) {
  try {
    await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none !important;}" });
  } catch {}
}

async function shoot(page, file) {
  const dest = path.join(OUT, file);
  await page.waitForTimeout(1200);
  await dismissCookies(page);
  await hideDevBadge(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: dest }); // viewport only -> 9:16
  console.log("  ✓ saved", file);
}

async function login(page, email, pass) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', pass);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 15000 });
      await page.waitForTimeout(800);
      return; // logged in
    } catch {
      console.log(`  … login retry ${attempt} para ${email}`);
    }
  }
  throw new Error("login não redirecionou para fora de /login");
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 432, height: 768 }, // 9:16
    deviceScaleFactor: 2.5,                 // -> 1080x1920
    isMobile: true, hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    console.log("Evento (público)...");
    const EVENT_SLUG = process.env.EVENT_SLUG || "forro-universitario-vicosa";
    await page.goto(`${BASE_URL}/eventos/${EVENT_SLUG}`, { waitUntil: "networkidle" });
    await shoot(page, "evento.png");
  } catch (e) { console.log("  ! evento falhou:", e.message); }

  try {
    console.log("Ingresso/QR (comprador)...");
    await login(page, BUYER.email, BUYER.pass);
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: "networkidle" });
    const qrLink = page.locator('a[href^="/tickets/"]').first();
    if (await qrLink.count()) { await qrLink.click(); await page.waitForLoadState("networkidle"); }
    await shoot(page, "ticket.png");
  } catch (e) { console.log("  ! ticket falhou:", e.message); }

  try {
    console.log("Check-in (operador)...");
    await login(page, OPERATOR.email, OPERATOR.pass);
    await page.goto(`${BASE_URL}/checkin`, { waitUntil: "networkidle" });
    await shoot(page, "checkin.png");
  } catch (e) { console.log("  ! checkin falhou:", e.message); }

  await browser.close();
  console.log("Done ->", OUT);
}

main().catch((err) => { console.error(err); process.exit(1); });
