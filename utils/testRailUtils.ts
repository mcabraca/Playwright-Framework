import { Page, TestInfo } from "@playwright/test";
import { randomUUID } from "crypto";

const DEFAULT_SCREENSHOT_DIR = "test-results/screenshots";

/**
 * Captures a full-page screenshot on test failure and pushes a `testrail_attachment`
 * annotation. With `embedAnnotationsAsProperties: true` in playwright.config.ts,
 * this surfaces in the JUnit report as `[[ATTACHMENT|path]]`, which
 * `.github/scripts/report_testrail_results.js` parses and uploads to TestRail.
 */
export async function attachFailureScreenshot(
  page: Page,
  testInfo: TestInfo,
  options: { screenshotDir?: string; fullPage?: boolean } = {},
): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) {
    return;
  }

  const screenshotDir = options.screenshotDir ?? DEFAULT_SCREENSHOT_DIR;
  const screenshotPath = `${screenshotDir}/screenshot-${randomUUID()}.png`;

  await page.screenshot({
    path: screenshotPath,
    fullPage: options.fullPage ?? true,
  });

  testInfo.annotations.push({
    type: "testrail_attachment",
    description: screenshotPath,
  });
}
