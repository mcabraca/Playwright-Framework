# Base-Playwright

Test automation
​

## Basic commands

Playwright install command

```
npm init playwright@latest

```

​HTML Reports

```
npx playwright show-report
```

## ENV for credentials / data storage

​
You need to copy `.env.copy` that has some sample values and fill it as needed

```
.env.qa
```

​Do not upload .env files with filled data to this repository.
Sensitive data managed via .env files should be securely replaced with encrypted **GitHub Actions secrets**.

## Run tests

```bash
npm run env-qa         # headless
npm run env-qa-ui      # UI mode
npm run env-qa-headed  # headed (with browser)
```

To run a specific test file, append part of the file name:

```bash
npm run env-qa-headed example
```

> ℹ️ **Note:** Full file name is not required — the match only needs to **contain** the file name (e.g., `example` matches `example.spec.ts`). More scripts could be added in package.json

## Report to TestRail

This project includes a powerful custom script, `report_testrail_results.js`, which automatically parses JUnit XML reports and publishes the results to [TestRail](https://www.gurock.com/testrail/). It supports:

- Mapping test names (e.g., `C12345`) to TestRail case IDs
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
