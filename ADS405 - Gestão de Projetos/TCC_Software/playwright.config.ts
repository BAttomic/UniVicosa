import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

const webServerConfig = {
  command: "pnpm dev",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  reuseExisting: !isCI,
  stdout: "pipe" as const,
  stderr: "pipe" as const,
  env: {
    NODE_ENV: "test",
  },
} as const;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /\.e2e\.(ts|tsx)$/,
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [webServerConfig] as Parameters<typeof defineConfig>[0]["webServer"],
});
