import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { SubCategoryPage } from '../pages/subcategories';
import testdata from '../testdata/testdata.json';

const parsed_data = testdata;

test.describe('create sub-category tests', () => {
    test('create sub-category with image and description', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني: الـ OTP + الصفحة تفضل مفتوحة

        const loginPage = new LoginPage(page);
        const subCategoryPage = new SubCategoryPage(page);
        const subCategoryName = `Auto SubCategory ${Date.now()}`;

        try {
            await loginPage.goto();
            await loginPage.login(parsed_data.email, parsed_data.password);

            // استنى لحد ما تكتب الـ OTP بنفسك
            await subCategoryPage.waitForOtp();

            await subCategoryPage.createSubCategory(subCategoryName);
            await subCategoryPage.expectSaved();
        } finally {
            await page.pause(); // الصفحة تفضل مفتوحة حتى لو التيست فشل
        }
    });
});