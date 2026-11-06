// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,

  reporter: 'html',

  use: {
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',

      use: {
        channel: 'chrome',

        viewport: null,

        launchOptions: {
          args: ['--start-maximized'],
          slowMo: 500,
        },
      },
    },
  ],
});