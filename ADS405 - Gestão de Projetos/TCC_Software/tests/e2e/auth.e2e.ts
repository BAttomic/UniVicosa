import { test, expect } from "@playwright/test";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const buyer = {
  email: "buyer1@ticketflow.com",
  password: "admin123",
};

const organizer = {
  email: "organizer1@ticketflow.com",
  password: "admin123",
};

test.describe("Authentication flows", () => {
  test("homepage loads with hero content", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /entrar/i })).toBeVisible();
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("buyer can log in and see navigation", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/e-mail/i).fill(buyer.email);
    await page.getByLabel(/senha/i).fill(buyer.password);
    await page.getByRole("button", { name: /entrar/i }).click();

    await page.waitForURL(`${BASE}/**`, { timeout: 10_000 });
    await expect(page.getByRole("link", { name: /meus ingressos/i })).toBeVisible();
  });

  test("shows error on wrong password", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/e-mail/i).fill(buyer.email);
    await page.getByLabel(/senha/i).fill("wrongpassword123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/credenciais inválidas|invalid credentials|erro|error/i)).toBeVisible({ timeout: 5_000 });
  });

  test("register page renders all fields", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i).first()).toBeVisible();
  });

  test("redirects unauthenticated user from /tickets to login", async ({ page }) => {
    await page.goto(`${BASE}/tickets`);
    await expect(page).toHaveURL(/login/, { timeout: 5_000 });
  });

  test("redirects unauthenticated user from /orders to login", async ({ page }) => {
    await page.goto(`${BASE}/orders`);
    await expect(page).toHaveURL(/login/, { timeout: 5_000 });
  });

  test("redirects unauthenticated user from /checkin to login", async ({ page }) => {
    await page.goto(`${BASE}/checkin`);
    await expect(page).toHaveURL(/login/, { timeout: 5_000 });
  });

  test("organizer can log in and see organizer nav", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.getByLabel(/e-mail/i).fill(organizer.email);
    await page.getByLabel(/senha/i).fill(organizer.password);
    await page.getByRole("button", { name: /entrar/i }).click();

    await page.waitForURL(`${BASE}/**`, { timeout: 10_000 });
    await expect(page.getByRole("link", { name: /meus eventos/i })).toBeVisible();
  });
});
