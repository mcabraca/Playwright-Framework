import BasePage, { Page, Locator, expect } from "./base/BasePage";

export class NavigationComponent extends BasePage {
  readonly aboutMenu: Locator;
  readonly cheatsheetsMenu: Locator;
  readonly contactUsMenu: Locator;
  readonly searchInput: Locator;
  readonly homeLogo: Locator;
 // readonly dismissButton: Locator;

  constructor(page: Page) {
    super(page);
    this.aboutMenu = this.page.locator("#menu a", { hasText: "About" });
    this.cheatsheetsMenu = this.page.locator("#menu a", {
      hasText: "Cheatsheets",
    });
    this.contactUsMenu = this.page.locator("#menu a", {
      hasText: "Contact Us",
    });
    this.searchInput = this.page.locator("#s");
    this.homeLogo = this.page.locator("a[title='GlobalSQA'] img");
  //  this.dismissButton = this.page.locator("#dismiss-button");
  }

  // Click methods for navigation elements
  async clickAboutMenu(): Promise<void> {
    await this.aboutMenu.click();
  }

  async clickCheatsheetsMenu(): Promise<void> {
    await this.cheatsheetsMenu.click();
  }

  async clickContactUsMenu(): Promise<void> {
    await this.contactUsMenu.click();
  }

  async clickHomeLogo(): Promise<void> {
    await this.homeLogo.click();
  }

  // Input method for search
  async searchFor(text: string): Promise<void> {
    await this.searchInput.fill(text);
    await this.searchInput.press("Enter");
  }

  async isMenuVisible() {
    await expect(this.aboutMenu).toBeVisible();
    await expect(this.cheatsheetsMenu).toBeVisible();
    await expect(this.contactUsMenu).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.homeLogo).toBeVisible();
  }
  async closeAdIfPresent() {
     await this.page.mouse.dblclick(1, 1);
  }
}
