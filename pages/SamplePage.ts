import { expect, Page } from "@playwright/test";
import BasePage from "./base/BasePage";

export class SamplePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.page.goto("/samplepagetest/");
  }

  async fillForm(
    name: string,
    email: string,
    website: string,
    experience: string,
    comment: string
  ) {
    await this.fillInput("#g2599-name", name);
    await this.fillInput("#g2599-email", email);
    await this.fillInput("#g2599-website", website);

    const experienceDropdown = this.page.getByLabel("Experience");
    await this.selectOption(experienceDropdown, experience);

    await this.clickElementWithText("label", "Functional Testing");

    await this.fillInput("#contact-form-comment-g2599-comment", comment);
  }

  async asyncsubmitForm() {
    await this.page.getByRole("button", { name: "Submit" }).click();
  }
  async validateInformation(
    name: string,
    email: string,
    website: string,
    experience: string,
    comment: string
  ) {
    await expect(this.page.getByText(name)).toBeVisible();
    await expect(this.page.getByText(email)).toBeVisible();
    await expect(this.page.getByText(website)).toBeVisible();
    await expect(this.page.getByText(experience)).toBeVisible();
    await expect(this.page.getByText(comment)).toBeVisible();
  }
}
