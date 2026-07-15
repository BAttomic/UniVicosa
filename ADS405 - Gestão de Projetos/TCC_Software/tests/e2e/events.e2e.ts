import { test, expect } from "@playwright/test";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(`${BASE}/**`, { timeout: 10_000 });
}

test.describe("Events browsing", () => {
  test("events listing page loads", async ({ page }) => {
    await page.goto(`${BASE}/eventos`);
    await expect(page.locator("main")).toBeVisible();
  });

  test("can navigate to an event detail page", async ({ page }) => {
    await page.goto(`${BASE}/eventos`);
    const eventLink = page.getByRole("link", { name: /ver evento|abrir/i }).first();
    const hasEvents = await eventLink.isVisible().catch(() => false);

    if (!hasEvents) {
      test.skip();
      return;
    }

    await eventLink.click();
    await expect(page).toHaveURL(/\/eventos\/.+/);
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Organizer event management", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "organizer1@ticketflow.com", "admin123");
  });

  test("organizer can see event list", async ({ page }) => {
    await page.goto(`${BASE}/organizer/eventos`);
    await expect(page.getByRole("heading", { name: /eventos/i })).toBeVisible();
  });

  test("organizer can open create event form", async ({ page }) => {
    await page.goto(`${BASE}/organizer/eventos/novo`);
    await expect(page.getByLabel(/título/i)).toBeVisible();
    await expect(page.getByLabel(/descrição/i)).toBeVisible();
  });

  test("create event form validates required fields", async ({ page }) => {
    await page.goto(`${BASE}/organizer/eventos/novo`);
    await page.getByRole("button", { name: /criar evento/i }).click();
    // Form validation prevents submission — still on same page
    await expect(page).toHaveURL(/novo/);
  });
});

test.describe("Buyer ticket purchase flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "buyer1@ticketflow.com", "admin123");
  });

  test("buyer can see their tickets page", async ({ page }) => {
    await page.goto(`${BASE}/tickets`);
    await expect(page.getByRole("heading", { name: /meus ingressos/i })).toBeVisible();
  });

  test("buyer can see their orders page", async ({ page }) => {
    await page.goto(`${BASE}/orders`);
    await expect(page.locator("main")).toBeVisible();
  });

  test("checkout page requires active lots", async ({ page }) => {
    await page.goto(`${BASE}/eventos`);
    const eventLink = page.getByRole("link", { name: /ver evento|abrir/i }).first();
    const hasEvents = await eventLink.isVisible().catch(() => false);

    if (!hasEvents) {
      test.skip();
      return;
    }

    await eventLink.click();
    await page.getByRole("link", { name: /comprar ingressos/i }).click();
    await expect(page).toHaveURL(/checkout/);
    await expect(page.locator("main")).toBeVisible();
  });
});

test.describe("Admin panel", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin@ticketflow.com", "admin123");
  });

  test("admin can access user management page", async ({ page }) => {
    await page.goto(`${BASE}/admin/usuarios`);
    await expect(page.getByRole("heading", { name: /funcionários e acessos/i })).toBeVisible();
  });

  test("admin can see create staff form", async ({ page }) => {
    await page.goto(`${BASE}/admin/usuarios`);
    await expect(page.getByRole("button", { name: /criar funcionário/i })).toBeVisible();
  });
});
