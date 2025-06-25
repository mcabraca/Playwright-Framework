import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config();

const testRailOptions = {
  // Whether to add <properties> with all annotations; default is false
  embedAnnotationsAsProperties: true,
  // Where to put the report.
  outputFile: "./test-results/junit-report.xml",
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { open: "always" }],
    ["list"],
    ["junit", testRailOptions],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    viewport: { width: 1920, height: 1080 },
    baseURL: process.env.BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    /*This attribute is used to locate elements, default option is testId */
    testIdAttribute: "id",
  },
  globalSetup: "./utils/globalSetup.ts",
  timeout: 300000,
  expect: {
    timeout: 90000,
  },
  /* Configure projects for major browsers */
  projects: [
    // { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        //  storageState: "playwright/.auth/user.json",
        bypassCSP: true,
      },
      // dependencies: ["setup"],
      testDir: "tests/e2e",
    },
  ],
});
