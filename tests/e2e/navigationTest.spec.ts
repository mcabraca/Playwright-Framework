import { expect, test } from "../base/baseTest";

test("Navigation flow using POM and assertions", async ({ navigation }) => {
  await test.step("Logo is visible", async () => {
    await expect(navigation.homeLogo).toBeVisible();
  });

  await test.step("Clicking About redirects to /about", async () => {
    await navigation.clickAboutMenu();
    await navigation.closeAdIfPresent();
    await expect(navigation.page).toHaveURL(/\/about\/?$/);
  });

  await test.step("Clicking Contact Us redirects to /contact-us", async () => {
    await navigation.clickContactUsMenu();
    await expect(navigation.page).toHaveURL(/\/contact-us\/?$/);
  });

  await test.step('Input search "about" redirects to ?s=about', async () => {
    await navigation.searchFor("about");
    await expect(navigation.page).toHaveURL(/\?s=about$/);
  });
});
