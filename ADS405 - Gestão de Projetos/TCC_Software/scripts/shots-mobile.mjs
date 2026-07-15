/**
 * Captures portrait (mobile) screenshots for the TCC presentation.
 * Renders at a real phone width (so the responsive/stacked layout shows) but
 * outputs ~720x1600 px via deviceScaleFactor.
 *
 *   node scripts/shots-mobile.mjs
 *
 * Env overrides:
 *   BASE_URL   (default https://soft.battomic.com)
 *   BUYER_EMAIL / BUYER_PASS      (for /tickets — default seeded buyer)
 *   OPERATOR_EMAIL / OPERATOR_PASS (for /checkin — default seeded operator)
 */
import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const BASE_URL = (process.env.BASE_URL || "https://soft.battomic.com").replace(/\/$/, "");
const OUT = path.join(process.cwd(), "apresentacao-assets");
const BUYER = { email: process.env.BUYER_EMAIL || "buyer1@ticketflow.com", pass: process.env.BUYER_PASS || "Password123!" };
const OPERATOR = { email: process.env.OPERATOR_EMAIL || "operator@ticketflow.com", pass: process.env.OPERATOR_PASS || "Password123!" };

fs.mkdirSync(OUT, { recursive: true });

async function dismissCookies(page) {
  try {
    const btn = page.locator('button:has-text("Aceitar todos")').first();
    if (await btn.count()) {
      await btn.click({ timeout: 3000 });
      await page.waitForTimeout(400);
    }
  } catch {
    // banner not present — fine
  }
}

async function shoot(page, file) {
  const dest = path.join(OUT, file);
  await page.waitForTimeout(1200);
  await dismissCookies(page); // remove the LGPD consent banner so it doesn't cover the screen
  await page.waitForTimeout(800); // let fonts/images settle
  await page.screenshot({ path: dest });
  console.log("  ✓ saved", file);
}

async function login(page, email, pass) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"], input[name="password"]', pass);
  await Promise.all([
    page.waitForLoadState("networkidle"),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 412, height: 916 },
    deviceScaleFactor: 1.75, // 412*1.75 ≈ 721 wide -> ~720x1600
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // 1) Evento (público) -> mobile-evento.png
  try {
    console.log("Evento (público)...");
    await page.goto(`${BASE_URL}/eventos`, { waitUntil: "networkidle" });
    const firstEvent = page.locator('a[href^="/eventos/"]').first();
    if (await firstEvent.count()) {
      await firstEvent.click();
      await page.waitForLoadState("networkidle");
    }
    await shoot(page, "mobile-evento.png");
  } catch (e) {
    console.log("  ! evento falhou:", e.message);
  }

  // 2) Ingresso com QR (login comprador) -> mobile-ticket.png
  try {
    console.log("Ingresso/QR (login comprador)...");
    await login(page, BUYER.email, BUYER.pass);
    await page.goto(`${BASE_URL}/tickets`, { waitUntil: "networkidle" });
    const qrLink = page.locator('a[href^="/tickets/"]').first();
    if (await qrLink.count()) {
      await qrLink.click();
      await page.waitForLoadState("networkidle");
    }
    await shoot(page, "mobile-ticket.png");
  } catch (e) {
    console.log("  ! ticket falhou:", e.message);
  }

  // 3) Check-in (login operador) -> mobile-checkin.png
  try {
    console.log("Check-in (login operador)...");
    await login(page, OPERATOR.email, OPERATOR.pass);
    await page.goto(`${BASE_URL}/checkin`, { waitUntil: "networkidle" });
    await shoot(page, "mobile-checkin.png");
  } catch (e) {
    console.log("  ! checkin falhou:", e.message);
  }

  await browser.close();
  console.log("Done. Saída em apresentacao-assets/");
}

main().catch((err) => { console.error(err); process.exit(1); });
