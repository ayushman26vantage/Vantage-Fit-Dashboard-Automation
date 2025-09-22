#!/bin/bash

# Script to run Playwright tests in fullscreen mode
# Make this file executable with: chmod +x run-fullscreen-tests.sh

echo "🖥️  Running Playwright tests in fullscreen mode..."

# Option 1: Run specific test in fullscreen
echo "Running custom challenge test in fullscreen..."
npx playwright test tests/E2E-flow-create_challenges/custom-challenge.spec.ts \
  --headed \
  --workers=1 \
  --project='Google Chrome' \
  --browser-option='--start-fullscreen' \
  --browser-option='--start-maximized'

# Option 2: Run all tests in fullscreen with custom viewport
echo "Running all tests with fullscreen viewport..."
npx playwright test \
  --headed \
  --workers=1 \
  --project='Google Chrome' \
  --browser-option='--start-fullscreen'

# Option 3: Run specific test case in fullscreen
echo "Running specific test case in fullscreen..."
npx playwright test tests/E2E-flow-create_challenges/custom-challenge.spec.ts \
  --grep "User should be able to remove a WEEK" \
  --headed \
  --workers=1 \
  --project='Google Chrome' \
  --browser-option='--start-fullscreen'

echo "✅ Tests completed!"