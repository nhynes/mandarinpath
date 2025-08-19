import { defineConfig, devices } from '@playwright/test'

/**
 * E2E test configuration for MandarinPath full-stack application
 * Tests both frontend (Vue.js) and backend (Rust) together
 */
export default defineConfig({
  testDir: './specs',
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: './test-results/html-report' }],
    ['junit', { outputFile: './test-results/results.xml' }],
    ['line']
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Start backend and frontend servers before running tests */
  webServer: [
    {
      command: 'cd ../backend && DATABASE_URL=sqlite:./test.db FRONTEND_URL=http://localhost:5173 cargo run',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        RUST_LOG: 'info',
        NODE_ENV: 'test'
      },
    },
    {
      command: 'cd ../app && pnpm dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        NODE_ENV: 'test',
        VITE_API_URL: 'http://localhost:3000/api'
      },
    },
  ],

  /* Global setup and teardown */
  globalSetup: './config/global-setup.ts',
  globalTeardown: './config/global-teardown.ts',

  /* Test timeout */
  timeout: 30000,
  expect: {
    timeout: 10000
  }
})