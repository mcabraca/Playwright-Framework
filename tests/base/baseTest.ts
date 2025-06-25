import { test as baseTest, expect, Page } from "@playwright/test";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { SamplePage } from "../../pages/SamplePage";
import { NavigationComponent } from "../../pages/NavigationComponent";

export const test = baseTest.extend<{
  page: Page;
  testData: any;
  samplePage: SamplePage;
  navigation: NavigationComponent;
}>({
  testData: async ({}: any, use: (arg0: any) => any) => {
    // Load test data from JSON file
    const dataPath = path.resolve(__dirname, "../../data/json/testData.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    await use(data);
  },
  samplePage: async ({ page }, use) => {
    const samplePage = new SamplePage(page);
    await use(samplePage);
  },
  navigation: async ({ page }, use) => {
    const navigation = new NavigationComponent(page);
    await use(navigation);
  },
});

test.beforeEach(async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}`);
  await page.setViewportSize({ width: 1800, height: 900 });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    let screenshotPath = `test-results/screenshots/screenshot-${randomUUID()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    testInfo.annotations.push({
      type: "testrail_attachment",
      description: screenshotPath,
    });
  }
  await page.close();
});

test.afterAll(cleanupDownloads);

function cleanupDownloads() {
  const downloadDir = path.resolve(__dirname, "../../downloads");
  if (fs.existsSync(downloadDir)) {
    const files = fs.readdirSync(downloadDir);
    if (files.length > 0) {
      files.forEach((file) => fs.unlinkSync(path.join(downloadDir, file)));
      console.log("All files in the downloads folder have been deleted.");
    }
  }
}
export { expect };
