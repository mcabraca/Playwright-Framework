import { test as baseTest, expect } from "@playwright/test";
import { SamplePage } from "../../pages/SamplePage";
import { NavigationComponent } from "../../pages/NavigationComponent";
import { TodoPage } from "../../pages/TodoPage";
import { TestData } from "../../data/types/TestData";
import testDataJson from "../../data/json/testData.json";
import { attachFailureScreenshot } from "../../utils/testRailUtils";

export const test = baseTest.extend<{
  testData: TestData;
  samplePage: SamplePage;
  navigation: NavigationComponent;
  todoPage: TodoPage;
}>({
  // Playwright fixture with no dependencies uses an empty destructure pattern
  // eslint-disable-next-line no-empty-pattern
  testData: async ({}, use) => {
    await use(testDataJson as TestData);
  },
  samplePage: async ({ page }, use) => {
    await use(new SamplePage(page));
  },
  navigation: async ({ page }, use) => {
    await page.goto("/");
    await use(new NavigationComponent(page));
  },
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
});

test.afterEach(async ({ page }, testInfo) => {
  await attachFailureScreenshot(page, testInfo);
});

export { expect };
