import { test as setup, expect } from "@playwright/test";
const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}`);
  //login process
  await page.context().storageState({ path: authFile });
});
