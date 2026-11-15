import { test as setup, expect, type Page } from '@playwright/test';
import fs from 'fs';
import { LoginPage } from './pages/loginpage';
import { credentials, AUTH_FILE } from './testdata/env';

// القايمة الجانبية بتظهر بس لما تكون عامل login
const sidebar = (page: Page) => page.locator("//span[normalize-space()='Products']");

setup('authenticate (login + OTP)', async ({ browser }) => {
    setup.setTimeout(180_000); // وقت كفاية تكتب الـ OTP

    // 1) لو فيه جلسة محفوظة لسه شغالة، استخدمها ومتطلبش OTP تاني
    if (fs.existsSync(AUTH_FILE)) {
        const context = await browser.newContext({ storageState: AUTH_FILE });
        const page = await context.newPage();
        await page.goto('/');
        const stillLoggedIn = await sidebar(page)
            .waitFor({ state: 'visible', timeout: 15_000 })
            .then(() => true, () => false);
        await context.close();
        if (stillLoggedIn) {
            console.log('Saved session is still valid, skipping login.');
            return;
        }
    }

    // 2) login جديد + استنى لحد ما تكتب الـ OTP بنفسك
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);
    await expect(sidebar(page)).toBeVisible({ timeout: 150_000 });

    await context.storageState({ path: AUTH_FILE });
    await context.close();
});
