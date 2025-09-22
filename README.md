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
