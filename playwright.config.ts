import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined, // Allow CLI workers param to override
  forbidOnly: !!process.env.CI,
    // Retry on CI only.
  retries: process.env.CI ? 2 : undefined,
  
  // Enhanced timeout configuration
  timeout:75000, // 60 seconds per test
  expect: {
    timeout: 15000, // 15 seconds for assertions
  },
  
  reporter: [
    ["line"],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
      },
    ],
  ],

  
  use: {
    baseURL: 'http://localhost:3000',
    
    // Flexible timeout settings
    actionTimeout: 15000, // 30 seconds for actions (clicks, fills, etc.)
    navigationTimeout: 30000, // 30 seconds for page navigation
    
    // Enhanced debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    
    
    // Browser stability options
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  },
  
  projects: [
    // ------- Local headed (Chromium) -------
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
    },
     {
      name: 'chrome-local',
      use: {
        channel: 'chrome',
        headless: false,
        viewport: null, // use real OS window size
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--start-maximized'],
        },
      },
    },
    {
      name: 'Google Chrome',
      use: { 
        browserName: 'chromium',
        channel: 'chrome',
        storageState: undefined, // Incognito mode
        viewport: null, // Use full native screen size
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        isMobile: false,
        hasTouch: false,
         launchOptions: {
          args: ['--disable-dev-shm-usage', '--start-maximized'],
        },
      },
      
      testIgnore: ['**/mobile/**', '**/api-only/**']
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Microsoft Edge',
      use: { 
        ...devices['Desktop Edge'], 
        channel: 'msedge',
      },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },




    // ---------- CI/headless Google Chrome ----------
    // Fixed viewport; you may set deviceScaleFactor if desired.
    // {
    //   name: 'chrome-ci',
    //   use: {
    //     channel: 'chrome',
    //     headless: true,
    //     viewport: { width: 1920, height: 1080 },
    //     // deviceScaleFactor: 1, // optional & safe in CI
    //     launchOptions: {
    //       args: [
    //         '--disable-dev-shm-usage',
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         '--disable-gpu',
    //         '--disable-web-security',
    //         '--window-size=1920,1080',
    //       ],
    //     },
    //   },
    // },
  ],
});


