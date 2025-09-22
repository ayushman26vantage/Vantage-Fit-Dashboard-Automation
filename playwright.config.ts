import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined, // Allow CLI workers param to override
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  
  // Enhanced timeout configuration
  timeout:60000, // 90 seconds per test
  expect: {
    timeout: 15000, // 15 seconds for assertions
  },
  
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    
    // Flexible timeout settings
    actionTimeout: 30000, // 30 seconds for actions (clicks, fills, etc.)
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
        ...devices['Desktop Chrome'], 
        channel: 'chrome',
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--no-sandbox'],
        },
      },
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
    {
      name: 'chrome-ci',
      use: {
        channel: 'chrome',
        headless: true,
        viewport: { width: 1920, height: 1080 },
        // deviceScaleFactor: 1, // optional & safe in CI
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-web-security',
            '--window-size=1920,1080',
          ],
        },
      },
    },
  ],
});
