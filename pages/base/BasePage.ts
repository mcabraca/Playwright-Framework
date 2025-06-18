import { Page, Locator, expect, Download } from "@playwright/test";

export default class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Click an element on a page based on the element's text
   * @param selector Element's selector
   * @param text Text to match
   * @param exactMatch Boolean if the text should match exactly or contain
   */
  async clickElementWithText(selector: string, text: string) {
    await this.locateWithText(selector, text).click();
  }
  /**
   * Clicks an element on the page using JavaScript execution.
   * Recommended for buildee's checkboxes and radio buttons.
   * - If a **string** selector (CSS or XPath) is provided, it will locate the element and trigger a JS click.
   * - If a **Playwright Locator** is provided, it directly executes a JavaScript click on the element.
   *
   * @param {string | Locator} locator - The element's selector (CSS/XPath) or Playwright `Locator`.
   */
  async clickElementWithJS(locator: string | Locator) {
    if (typeof locator === "string") {
      const selector = locator;
      await this.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          element.click();
        } else {
          console.error("Element not found");
        }
      }, selector);
    } else {
      await locator.evaluate((el) => (el as HTMLElement).click());
    }
  }

  /**
   * Locate an element based on CSS attribute 'name'.
   * @param name The value of the custom CSS attribute 'name' to match.
   * @returns A Locator object representing the matched element.
   */
  findElementByName(name: string): Locator {
    return this.page.locator(`[name="${name}"]`);
  }

  /**
   * Locate an element based on selector and text
   * @param selector Element's selector
   * @param text Text to match
   * @returns Element object
   */
  locateWithText(selector: string, text: string) {
    return this.page.locator(selector).getByText(text, { exact: true });
  }

  /**
   * Assertion to determine if an element contains specified text
   * @param selector Element's selector
   * @param text Text to match
   * @param exactMatch Boolean if the text should match exactly or contain
   */
  async elementContainsText(
    selector: string,
    text: string,
    exactMatch = false
  ) {
    exactMatch
      ? await expect(this.page.locator(selector)).toHaveText(text)
      : await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Asserts that text is present in any element in locator
   * You can use this for asserting that an text item is in a list or table
   * @param {string} selector
   * @param {string} text
   */
  async elementsContainsText(selector: string, text: string) {
    const elementText = await this.getAllElementsText(selector);
    if (!elementText.some((x) => x.includes(text))) {
      throw new Error(
        `Failed to find text: ${text} in list:\r\n ${elementText.toString()}`
      );
    }
  }
  /**
   *
   * Assertion to determine if an element with specified text is no visibile
   * @param selector Element's selector
   * @param text Text to match
   * @param strictMode Boolean if the text should match exactly or contain
   */
  async elementTextNotVisible(
    selector: string,
    text: string,
    strictMode = true
  ) {
    if (strictMode) {
      await expect(this.page.locator(selector, { hasText: text })).toBeHidden();
    } else {
      const handle = this.page.locator(`${selector}:has-text('${text}')`);
      expect(handle.isVisible()).toBeFalsy();
    }
  }

  /**
   * Wait for a selector to be either visible or hidden
   * @param selector Element's selector
   * @param shouldBeVisible Boolean if element should be visible
   */
  async waitForVisibility(selector: string, shouldBeVisible = true) {
    shouldBeVisible
      ? await expect(this.page.locator(selector)).toBeVisible()
      : await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Assertion to determine if an element is visible
   * @param selector Element's selector
   * @param strictMode If true the all selectors should be visible. If false the first selector must be visible.
   */
  async elementVisible(selector: string, strictMode = true) {
    strictMode
      ? await expect(this.page.locator(selector)).toBeVisible()
      : await expect(this.page.locator(selector).first()).toBeVisible();
  }

  /**
   * Assertion to determine if an array of selectors are visibile. Forces strict mode {@link elementVisible}
   * @param selectors
   */
  async allElementsVisible(selectors: string[]) {
    for (const s of selectors) {
      await this.elementVisible(s);
    }
  }

  /**
   * Assertion to determine if an element is not visible
   * @param selector Element's selector
   */
  async elementNotVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Assertion to determine that an array of elements are not visible
   * @param selectors Element's selector
   */
  async allElementsNotVisible(selectors: string[]) {
    for (const s of selectors) {
      await this.elementNotVisible(s);
    }
  }

  /**
   * Return the current URL the browser is on
   * @returns URL of current page
   */
  async getCurrentUrl() {
    await this.page.waitForLoadState();
    return this.page.url();
  }

  /**
   * Get the text of an element
   * @param selector Element's selector
   * @returns Text of element
   */
  async getElementText(selector: string) {
    return this.page.locator(selector).innerText();
  }

  /**
   * Toggles selector in base container on or off
   * Selector is the base selector id that contains switch elements
   * @param {string} selector
   * @param {boolean} toggled
   */
  async toggleSwitchBox(selector: string, toggled: boolean) {
    const baseContainer = this.page.locator(selector);
    await expect(baseContainer).toBeVisible();
    const toggledOn = await baseContainer
      .locator('[class*="switch-off"]')
      .isHidden();
    if (toggledOn != toggled) {
      await this.page.locator(`${selector}>[class*="switch-"]`).click();
    }
  }

  /**
   * Get the text of all elements for a given selector
   * @param selector Selector to search for in the page
   * @param fromPage Page object to search
   * @returns Formatted map of text
   */
  async getAllElementsText(selector: string, fromPage: Page = this.page) {
    // Get rows count from the Receipt
    const listItems = fromPage.locator(selector);
    const textData: string[] = await listItems.allInnerTexts();
    return textData.map((s) => s.replace(/[\n\t]/g, " ").trim());
  }

  /**
   * Close the browser
   */
  async close() {
    await this.page.close();
  }

  /**
   * Drag an object from one location to another
   * @param originLocator Locator for object in it's current position
   * @param destinationLocator Locator for destination of the object
   */
  async dragAndDropElements(
    originLocator: string | Locator,
    destinationLocator: string | Locator
  ) {
    const originElement =
      typeof originLocator === "string"
        ? await this.page.waitForSelector(originLocator)
        : await originLocator;

    const destinationElement =
      typeof destinationLocator === "string"
        ? await this.page.waitForSelector(destinationLocator)
        : await destinationLocator;

    await originElement.hover();
    await this.page.mouse.down();
    const box = await destinationElement.boundingBox();
    if (!box) throw new Error("Destination element not visible or not found.");
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 5,
    });
    await destinationElement.hover();
    await this.page.mouse.up();
  }

  /**
   * Selects an option from a dropdown element.
   * @param {Locator} dropdown - The locator of the dropdown element.
   * @param {string} option - The option value or label to select from the dropdown.
   */
  async selectOption(dropdown: Locator, option: string) {
    await dropdown.selectOption(option);
  }

  /**
   * Asserts the text value of a dropdown element.
   * @param {Locator} dropdown - The locator of the dropdown element.
   * @param {string} expectedText - The expected text value of the selected option.
   */

  async assertDropdownValue(dropdown: Locator, expectedText: string) {
    // Use evaluate to directly access the selected option's text, PW regular methods to get this DO NOT work
    const selectedText = await dropdown.evaluate((selectElement) => {
      const select = selectElement as HTMLSelectElement;
      return select.options[select.selectedIndex].text;
    });
    expect(selectedText.trim()).toBe(expectedText);
  }
  /**
   * Asserts that the value of an input field matches the expected text.
   * @param {Locator} inputField - The locator for the input field.
   * @param {string} expectedText - The expected text value of the input field.
   */
  async assertInputValue(inputField: Locator, expectedText: string): Promise {
    const actualValue = await inputField.inputValue();
    expect(actualValue).toBe(expectedText);
  }
/**
 * Fills the specified input field with the provided text.
 *
 * @param {Locator | string} inputField - The input field (as a Playwright Locator or selector string).
 * @param {string} text - The text to enter into the input field.
 * @returns {Promise<void>}
 */
async fillInput(inputField: Locator | string, text: string): Promise<void> {
  const target = typeof inputField === 'string' ? this.page.locator(inputField) : inputField;
  await target.fill(text);
}
}
