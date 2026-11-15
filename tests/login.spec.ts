import { test } from '@playwright/test';
import { LoginPage } from './pages/loginpage';
import { credentials } from './testdata/env';

// التستات دي بتختبر الـ login نفسه، فلازم تبدأ من غير جلسة محفوظة
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login tests', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('valid login (type the OTP manually)', async () => {
        test.setTimeout(180_000); // وقت كفاية تكتب الـ OTP

        await loginPage.login(credentials.email, credentials.password);
        await loginPage.expectLoginSuccess();
    });

    test('wrong password', async () => {
        await loginPage.login(credentials.email, `wrong-${Date.now()}`);
        await loginPage.expectLoginFailed();
    });

    test('unregistered email', async () => {
        await loginPage.login(`not-registered-${Date.now()}@example.com`, credentials.password);
        await loginPage.expectLoginFailed();
    });

    test('empty email and password', async () => {
        await loginPage.login('', '');
        await loginPage.expectLoginFailed();
    });

    test('empty password', async () => {
        await loginPage.login(credentials.email, '');
        await loginPage.expectLoginFailed();
    });

    test('invalid email format', async () => {
        await loginPage.login('not-an-email', credentials.password);
        await loginPage.expectLoginFailed();
    });
});
