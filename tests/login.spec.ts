import { test } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import testdata from './testdata/testdata.json';

const parsed_data = testdata;

test.describe('login tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('valid login', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني عشان الصفحة متقفلش

        await loginPage.login(parsed_data.email, parsed_data.password);
        //await loginPage.expectLoginSuccess();

        await page.pause(); // المتصفح يفضل مفتوح لحد ما تدوس Resume أو تقفله
    });
});