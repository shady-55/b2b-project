// @ts-check
require('dotenv').config({ quiet: true });
const { defineConfig } = require('@playwright/test');

const AUTH_FILE = '.auth/user.json';

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,

  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL || 'https://admin-dev.justacodes.com',
    // المتصفح ظاهر: الـ OTP بيتكتب باليد والتستات بتستخدم page.pause()
    headless: false,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    channel: 'chrome',
    viewport: null,
    launchOptions: {
      args: ['--start-maximized'],
      slowMo: 500,
    },
  },

  projects: [
    {
      // login + OTP مرة واحدة، والجلسة تتحفظ في .auth/user.json
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      testIgnore: /.*\.setup\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: AUTH_FILE,
      },
    },
  ],
});
