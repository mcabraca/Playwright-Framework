# Base-Playwright

Test automation
​

## Basic commands

Playwright install command

```
npm init playwright@latest

```

​
HTML Reports

```
npx playwright show-report
```

## ESLint and Prettier

ESLint statically analyzes your code to quickly find problems. It is built into most text editors and you can run ESLint as part of your continuous integration pipeline. Prettier enforces a consistent format by parsing code and reprinting it with its own rules that take the maximum line length into account, wrapping code when necessary.

Run ESLint

```
npx eslint .
```

```
npx eslint . --fix
```

Prettier Commands

```
npx prettier . --check
```

```
npx prettier . --write
```

## ENV for credentials / data storage

​
You need to copy `.env.example` that has some sample values and fill it as needed and change the name according to the environment. Example:

```
.env.qa
```

​Do not upload .env files with filled data to this repository.

### QA

Runs headless qa environment

```
npm run env-qa
```

Runs ui qa environment

```
npm run env-qa-ui
```

Runs headed qa environment

```
npm run env-qa-headed
```

### Run a specific test

You can add a specific file test name. Example:

```
npm run env-qa-headed example.spec.ts
```

## Environment configuration note:

If you add a different default environment (qa) you can run your .env.**env-name** file using the following command:

```
test_env=<env-name> npx playwright test
```

Or you can add new commands for a specific environment following the QA structure on **scripts package.json** section.

## Common Elements
### BasePage Class
The `BasePage` class provides various reusable assertions and methods that can be used in your test classes. You can call these methods in a **test class** via page-specific subclasses, such as `loginPage.elementContainsText(selector, text, exactMatch)`, or directly on a **page instance**, such as calling `this.clickElementWithJS()` within a class like `BuildingsPage`.
This approach encourages code reuse and helps keep your test code clean and maintainable.

### BaseTest Class
The `BaseTest` class ensures proper setup and management of page instances during tests. It uses Playwright's fixture system to handle page initialization and cleanup for each test, making your tests more consistent and reliable. To learn more about Playwright's fixture system, check out the official documentation: [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures).

### PortfolioTable
The `PortfolioTable` class is designed to interact with the table elements(Portfolio) in the Buildee web app. It provides methods to verify the presence of multiple items and interact with specific elements within the table. Even though the HTML structure of these tables may vary, `PortfolioTable` uses common elements to ensure consistent interaction across different table implementations. 


## Github Actions note

​For Github Actions execution .yml folder in ./github/workflows is required.
Sensitive data comes from .env files should be replaced by GHA secrets that are encrypted

<br> The values at yml file for example:
<br>
<img width="388" alt="image" src="https://github.com/simuwatt/automation-qa/assets/143756884/631efc97-47e8-400f-b914-277d26f03344">


<br> Should match with secrets at https://github.com/simuwatt/automation-qa/settings/variables/actions 
## More info
Extra documentation can be found in https://docs.google.com/document/d/1t8098hto3ardHoe70eSh3mbPEzYEbVTJhF9Ch6K7eEo/edit?tab=t.0

https://playwright.dev/docs/intro
