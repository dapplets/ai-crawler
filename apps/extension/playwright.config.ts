import { devices } from '@playwright/test'

export default {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'line',
  use: {
    baseURL: 'https://github.com/crmklein',
    trace: 'on-first-retry',
    bypassCSP: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  timeout: 60000,
  // webServer: [
  //   {
  //     command: 'npm run modules',
  //     port: 3000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run modules:server-interaction',
  //     port: 8081,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run start:test-overlay',
  //     port: 8080,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run start:test-overlay-2',
  //     port: 8082,
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
}
