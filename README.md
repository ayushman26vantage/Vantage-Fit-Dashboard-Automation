# Vantage Fit Dashboard Automation

This project contains automated tests for the Vantage Fit Dashboard using Playwright.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

- Run all tests:
```bash
npm test
```

- Run tests in headed mode (with browser UI):
```bash
npm run test:headed
```

- Run tests in debug mode:
```bash
npm run test:debug
```

- View test report:
```bash
npm run report
```

## Project Structure

- `tests/` - Contains all test files
  - `login.spec.ts` - Tests for user login and basic navigation.
  - `create-challenge-navigation.spec.ts` - Tests for navigating to each challenge creation page.
  - `create-challenge-content.spec.ts` - Tests for verifying the content on the challenge creation page.
- `pages/` - Contains Page Object Models
  - `BasePage.ts` - Base page object with common methods
  - `LoginPage.ts` - Login page specific methods
  - `DashboardPage.ts` - Methods for interacting with the main dashboard after login.
  - `AdminDashboardPage.ts` - Methods for the admin-specific dashboard views.
  - `DashboardSidebarPage.ts` - Methods for interacting with the sidebar menu in the admin dashboard.
  - `CreateChallengePage.ts` - Methods for the challenge creation selection page.
- `playwright.config.ts` - Playwright configuration

## Writing Tests

1. Create new page objects in the `pages/` directory
2. Create test files in the `tests/` directory
3. Use the page objects in your tests for better maintainability

## Best Practices

- Use data-testid attributes for reliable element selection
- Keep tests independent and atomic
- Use page objects to encapsulate page-specific logic
- Add meaningful assertions to verify expected behavior









// {
//   "name": "vantage-fit-dashboard-automation",
//   "version": "1.0.0",
//   "lockfileVersion": 3,
//   "requires": true,
//   "packages": {
//     "": {
//       "name": "vantage-fit-dashboard-automation",
//       "version": "1.0.0",
//       "devDependencies": {
//         "@playwright/test": "^1.56.0",
//         "@types/node": "^20.19.21",
//         "playwright": "^1.56.0",
//         "typescript": "^5.9.3"
//       }
//     },
//     "node_modules/@playwright/test": {
//       "version": "1.56.0",
//       "resolved": "https://registry.npmjs.org/@playwright/test/-/test-1.56.0.tgz",
//       "integrity": "sha512-Tzh95Twig7hUwwNe381/K3PggZBZblKUe2wv25oIpzWLr6Z0m4KgV1ZVIjnR6GM9ANEqjZD7XsZEa6JL/7YEgg==",
//       "dev": true,
//       "license": "Apache-2.0",
//       "dependencies": {
//         "playwright": "1.56.0"
//       },
//       "bin": {
//         "playwright": "cli.js"
//       },
//       "engines": {
//         "node": ">=18"
//       }
//     },
//     "node_modules/@types/node": {
//       "version": "20.19.21",
//       "resolved": "https://registry.npmjs.org/@types/node/-/node-20.19.21.tgz",
//       "integrity": "sha512-CsGG2P3I5y48RPMfprQGfy4JPRZ6csfC3ltBZSRItG3ngggmNY/qs2uZKp4p9VbrpqNNSMzUZNFZKzgOGnd/VA==",
//       "dev": true,
//       "license": "MIT",
//       "dependencies": {
//         "undici-types": "~6.21.0"
//       }
//     },
//     "node_modules/fsevents": {
//       "version": "2.3.2",
//       "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.2.tgz",
//       "integrity": "sha512-xiqMQR4xAeHTuB9uWm+fFRcIOgKBMiOBP+eXiyT7jsgVCq1bkVygt00oASowB7EdtpOHaaPgKt812P9ab+DDKA==",
//       "dev": true,
//       "hasInstallScript": true,
//       "license": "MIT",
//       "optional": true,
//       "os": [
//         "darwin"
//       ],
//       "engines": {
//         "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
//       }
//     },
//     "node_modules/playwright": {
//       "version": "1.56.0",
//       "resolved": "https://registry.npmjs.org/playwright/-/playwright-1.56.0.tgz",
//       "integrity": "sha512-X5Q1b8lOdWIE4KAoHpW3SE8HvUB+ZZsUoN64ZhjnN8dOb1UpujxBtENGiZFE+9F/yhzJwYa+ca3u43FeLbboHA==",
//       "dev": true,
//       "license": "Apache-2.0",
//       "dependencies": {
//         "playwright-core": "1.56.0"
//       },
//       "bin": {
//         "playwright": "cli.js"
//       },
//       "engines": {
//         "node": ">=18"
//       },
//       "optionalDependencies": {
//         "fsevents": "2.3.2"
//       }
//     },
//     "node_modules/playwright-core": {
//       "version": "1.56.0",
//       "resolved": "https://registry.npmjs.org/playwright-core/-/playwright-core-1.56.0.tgz",
//       "integrity": "sha512-1SXl7pMfemAMSDn5rkPeZljxOCYAmQnYLBTExuh6E8USHXGSX3dx6lYZN/xPpTz1vimXmPA9CDnILvmJaB8aSQ==",
//       "dev": true,
//       "license": "Apache-2.0",
//       "bin": {
//         "playwright-core": "cli.js"
//       },
//       "engines": {
//         "node": ">=18"
//       }
//     },
//     "node_modules/typescript": {
//       "version": "5.9.3",
//       "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
//       "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
//       "dev": true,
//       "license": "Apache-2.0",
//       "bin": {
//         "tsc": "bin/tsc",
//         "tsserver": "bin/tsserver"
//       },
//       "engines": {
//         "node": ">=14.17"
//       }
//     },
//     "node_modules/undici-types": {
//       "version": "6.21.0",
//       "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
//       "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
//       "dev": true,
//       "license": "MIT"
//     }
//   }
// }
