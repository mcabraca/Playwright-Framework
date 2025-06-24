# Base-Playwright

Test automation using POM with Playwright.
It also includes scripts for document's assertion and report to TestRail and Slack.
​More documentation on https://playwright.dev/docs/intro

## Installation
After clone project 

```
npm install
npm init playwright@latest

```
Do not overwrite config.ts file

## ENV for credentials / data storage
- For local execution you need to copy `.env.copy` that has some sample values and fill it as needed

```
.env.qa
```

​Do not upload .env files with filled data to this repository.

- For GitHub Actions execution sensitive data managed via .env files should be securely replaced with encrypted **GitHub Actions secrets**.

## Run tests
### From console
The following scripts are included in package.json file

```bash
npm run env-qa         # headless
npm run env-qa-ui      # UI mode
npm run env-qa-headed  # headed (with browser)
```

To run a specific test file, append part of the file name:

```bash
npm run env-qa-headed example
```
**Note:** Full file name is not required — the match only needs to **contain** the file name (e.g., `example` matches `example.spec.ts`). More scripts could be added in package.json

View report
```bash
npx playwright show-report
```
### Run & Debug Tests in VS Code

To run or debug tests inside **Visual Studio Code**, the official [Playwright Test for VS Code extension](https://playwright.dev/docs/getting-started-vscode) is **required**.

#### Required Setup

1. Open VS Code.
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the **Command Palette**.
3. Run:Extensions: Install Extensions
4. Search for **Playwright Test for VS Code** and install the extension by **Microsoft**.
> Without this extension, running and debugging tests directly from VS Code **will not work properly**.

#### Features You Get With the Extension

- Run tests from the sidebar or editor gutter.
- Step through tests using breakpoints.
- View test reports, traces, and logs directly in the editor.
- Hover over locators and assertions for live previews.

## Report to TestRail

This project includes a powerful custom script, `report_testrail_results.js`, which automatically parses JUnit XML reports and publishes the results to [TestRail](https://www.testrail.com/). It supports:

- Mapping test names (e.g., `C12345`) to TestRail case IDs. TestIds should be included in test description on spec.ts file( e.g. ,`test("C12345 Fill form using simplified POM and data from fixture", async ({` )
- Creating new test cases dynamically if no case ID exists
- Uploading result status and screenshots for failed cases
- Creating a new test run and storing its ID for follow-up actions

Sensitive TestRail credentials are securely managed via **GitHub Actions secrets**.

## How to Use It in GitHub Actions

In your workflow YAML (e.g., `staging.yml`), include the following step **after** test execution:

```yaml
- name: Report Test Results to TestRail
  env:
    TESTRAIL_URL: ${{ secrets.TESTRAIL_URL }}
    TESTRAIL_USERNAME: ${{ secrets.USEREMAIL_TESTRAIL }}
    TESTRAIL_API_KEY: ${{ secrets.TRCLI_KEY }}
    TESTRAIL_PROJECT_ID: ${{ secrets.TESTRAIL_PROJECT_ID }}
    TESTRAIL_SECTION_ID: ${{ secrets.TESTRAIL_SECTION_ID }}
  run: node .github/scripts/report_testrail_results.js
```
