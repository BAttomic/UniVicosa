import { test, expect } from "@playwright/test";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL(`${BASE}/**`, { timeout: 10_000 });
}

test.describe("Check-in system", () => {
  test("buyer cannot access check-in page", async ({ page }) => {
    await loginAs(page, "buyer1@ticketflow.com", "admin123");
    await page.goto(`${BASE}/checkin`);
    await expect(page).toHaveURL(/login/, { timeout: 5_000 });
  });

  test("operator can access check-in page", async ({ page }) => {
    await loginAs(page, "operator@ticketflow.com", "admin123");
    await page.goto(`${BASE}/checkin`);
    await expect(page.getByRole("heading", { name: /check-in/i })).toBeVisible();
  });

  test("check-in page shows scanner button", async ({ page }) => {
    await loginAs(page, "operator@ticketflow.com", "admin123");
    await page.goto(`${BASE}/checkin`);
    await expect(page.getByRole("button", { name: /iniciar scanner/i })).toBeVisible();
  });

  test("check-in API returns 401 without auth", async ({ request }) => {
    const res = await request.post(`${BASE}/api/checkin`, {
      data: { code: "fake-code", secret: "fake-secret" },
    });
    expect(res.status()).toBe(401);
  });

  test("check-in API returns 404 for non-existent ticket", async ({ request, page }) => {
    await loginAs(page, "operator@ticketflow.com", "admin123");

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const res = await request.post(`${BASE}/api/checkin`, {
      headers: { Cookie: cookieHeader },
      data: { code: "0".repeat(32), secret: "a".repeat(64) },
    });
    expect(res.status()).toBe(404);
  });
});

test.describe("Profile and LGPD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "buyer1@ticketflow.com", "admin123");
  });

  test("buyer can access profile page", async ({ page }) => {
    await page.goto(`${BASE}/perfil`);
    await expect(page.getByRole("heading", { name: /meu perfil/i })).toBeVisible();
  });

  test("profile page shows LGPD section", async ({ page }) => {
    await page.goto(`${BASE}/perfil`);
    await expect(page.getByText(/LGPD|Lei Geral de Proteção/i)).toBeVisible();
  });

  test("profile page shows data export button", async ({ page }) => {
    await page.goto(`${BASE}/perfil`);
    await expect(page.getByRole("button", { name: /exportar meus dados/i })).toBeVisible();
  });

  test("data export API returns JSON for authenticated user", async ({ request, page }) => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const res = await request.get(`${BASE}/api/profile/export`, {
      headers: { Cookie: cookieHeader },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { user?: unknown; exportedAt?: string };
    expect(body).toHaveProperty("user");
    expect(body).toHaveProperty("exportedAt");
  });
});
