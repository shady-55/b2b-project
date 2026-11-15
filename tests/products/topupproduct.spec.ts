import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { CreateProductPage } from '../pages/createproductpage';
import { buildRandomProduct } from '../testdata/productdata';
import testdata from '../testdata/testdata.json';

const parsed_data = testdata;

test.describe('create top-up product tests', () => {
    test('create top-up product with random data', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني: الـ OTP + الصفحة تفضل مفتوحة

        const loginPage = new LoginPage(page);
        const createProductPage = new CreateProductPage(page);
        const product = buildRandomProduct('Top-up');

        console.log('Top-up product data:', product);

        try {
            await loginPage.goto();
            await loginPage.login(parsed_data.email, parsed_data.password);

            // استنى لحد ما تكتب الـ OTP بنفسك
            await createProductPage.waitForOtp();

            await createProductPage.fillForm(product);
            await createProductPage.expectFormFilled(product);

            await createProductPage.save();
            await createProductPage.expectProductSaved();
        } finally {
            await page.pause(); // الصفحة تفضل مفتوحة حتى لو التيست فشل
        }
    });
});
