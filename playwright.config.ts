import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

const testRailOptions = {
  embedAnnotationsAsProperties: true,
  outputFile: "./test-results/junit-report.xml",
};

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ["html", { open: process.env.CI ? "never" : "on-failure" }],
    ["list"],
    ["junit", testRailOptions],
  ],
  use: {
    viewport: { width: 1920, height: 1080 },
    baseURL: process.env.BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    testIdAttribute: "id",
  },
  globalSetup: "./utils/globalSetup.ts",
  globalTeardown: "./utils/globalTeardown.ts",
  timeout: 30000,
  expect: {
    timeout: 15000,
  },
  projects: [
    // { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // storageState: "playwright/.auth/user.json",
      },
      // dependencies: ["setup"],
      testDir: "tests/e2e",
    },
  ],
});
