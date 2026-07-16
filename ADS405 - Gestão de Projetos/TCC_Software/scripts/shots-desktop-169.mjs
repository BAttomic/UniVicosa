/**
 * Captura 6 prints desktop em 16:9 nativo (1920x1080) para o portfólio.
 *   BASE_URL=http://localhost:3000 node scripts/shots-desktop-169.mjs
 * Saída: apresentacao-assets/169/{evento,prevenda,dashboard,analytics,qr,checkin}.png
 */
import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT = path.join(process.cwd(), "apresentacao-assets", "169");
const ORGANIZER = { email: "organizer1@ticketflow.com", pass: "Password123!" };
const BUYER = { email: "buyer1@ticketflow.com", pass: "Password123!" };
const OPERATOR = { email: "operator@ticketflow.com", pass: "Password123!" };

const EVENT_ONSALE = "forro-universitario-vicosa";
const EVENT_SOON = "show-da-virada-vicosa";
const MARINA_EVENT_ID = "6a5870a70e746ba81f92e039"; // festival-universitario-vicosa
const BUYER_TICKET_ID = "6a5870a80e746ba81f92ec92";

fs.mkdirSync(OUT, { recursive: true });

async function dismissCookies(page) {
  try {
    const btn = page.locator('button:has-text("Aceitar todos")').first();
    if (await btn.count()) { await btn.click({ timeout: 3000 }); await page.waitForTimeout(400); }
  } catch {}
}
async function hideDevBadge(page) {
  try { await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-build-watcher{display:none !important;}" }); } catch {}
}
async function shoot(page, file) {
  await page.waitForTimeout(1200);
  await dismissCookies(page);
  await hideDevBadge(page);
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, file) }); // viewport 1920x1080
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
      await page.waitForTimeout(800); return;
    } catch { console.log(`  … login retry ${attempt} (${email})`); }
  }
  throw new Error("login falhou: " + email);
}
async function go(page, url) { await page.goto(`${BASE_URL}${url}`, { waitUntil: "networkidle" }); }

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = context.pages()[0] || await context.newPage();
  page.setDefaultTimeout(30000);

  // Público (deslogado)
  try { console.log("Evento (compra)..."); await go(page, `/eventos/${EVENT_ONSALE}`); await shoot(page, "evento.png"); }
  catch (e) { console.log("  !", e.message); }
  try { console.log("Pré-venda / waitlist..."); await go(page, `/eventos/${EVENT_SOON}`); await shoot(page, "prevenda.png"); }
  catch (e) { console.log("  !", e.message); }

  // Organizador
  try {
    console.log("Painel do organizador...");
    await login(page, ORGANIZER.email, ORGANIZER.pass);
    await go(page, "/organizer/eventos"); await shoot(page, "dashboard.png");
    console.log("Analytics do evento...");
    await go(page, `/organizer/eventos/${MARINA_EVENT_ID}/vendas`); await shoot(page, "analytics.png");
  } catch (e) { console.log("  !", e.message); }

  // Comprador — ingresso/QR
  try {
    console.log("Ingresso/QR (desktop)...");
    await login(page, BUYER.email, BUYER.pass);
    await go(page, "/tickets");
    const qrLink = page.locator('a[href^="/tickets/"]').first();
    if (await qrLink.count()) { await qrLink.click(); await page.waitForLoadState("networkidle"); }
    await shoot(page, "qr.png");
  } catch (e) { console.log("  !", e.message); }

  // Operador — check-in
  try {
    console.log("Check-in (desktop)...");
    await login(page, OPERATOR.email, OPERATOR.pass);
    await go(page, "/checkin"); await shoot(page, "checkin.png");
  } catch (e) { console.log("  !", e.message); }

  await browser.close();
  console.log("Done ->", OUT);
}
main().catch((err) => { console.error(err); process.exit(1); });
