import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { FormPage } from '../pages/maincategories';
import testdata from '../testdata/testdata.json';

const parsed_data = testdata;

// ⚠️ حط هنا رابط الصفحة اللي فيها الفورم ده
const FORM_URL = 'https://admin-dev.justacodes.com/categories/create';

test.describe('form tests', () => {
    test('fill form and submit', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني: الـ OTP + الصفحة تفضل مفتوحة

        const loginPage = new LoginPage(page);
        const formPage = new FormPage(page);
        const itemName = `Auto Item ${Date.now()}`;

        try {
            await loginPage.goto();
            await loginPage.login(parsed_data.email, parsed_data.password);

            // استنى لحد ما تكتب الـ OTP بنفسك
            await formPage.waitForOtp();

            await formPage.open(FORM_URL);
            await formPage.createItem(itemName);
            await formPage.expectSubmitted(FORM_URL);
        } finally {
            await page.pause(); // الصفحة تفضل مفتوحة حتى لو التيست فشل
        }
    });
});