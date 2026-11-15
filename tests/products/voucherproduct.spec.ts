import { test } from '@playwright/test';
import { CreateProductPage } from '../pages/createproductpage';
import { buildRandomProduct } from '../testdata/productdata';

test.describe('create voucher product tests', () => {
    test('create voucher product with random data', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني: الـ OTP + الصفحة تفضل مفتوحة

        const createProductPage = new CreateProductPage(page);
        const product = buildRandomProduct('Voucher');

        console.log('Voucher product data:', product);

        try {
            // الجلسة جاهزة من auth.setup.ts (من غير login ولا OTP)
            await page.goto('/');
            await createProductPage.waitForOtp(30_000);

            await createProductPage.fillForm(product);
            await createProductPage.expectFormFilled(product);

            await createProductPage.save();
            await createProductPage.expectProductSaved();
        } finally {
            await page.pause(); // الصفحة تفضل مفتوحة حتى لو التيست فشل
        }
    });
});
