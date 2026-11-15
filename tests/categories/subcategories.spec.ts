import { test } from '@playwright/test';
import { SubCategoryPage } from '../pages/subcategories';

test.describe('create sub-category tests', () => {
    test('create sub-category with image and description', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني: الـ OTP + الصفحة تفضل مفتوحة

        const subCategoryPage = new SubCategoryPage(page);
        const subCategoryName = `Auto SubCategory ${Date.now()}`;

        try {
            // الجلسة جاهزة من auth.setup.ts (من غير login ولا OTP)
            await page.goto('/');
            await subCategoryPage.waitForOtp(30_000);

            await subCategoryPage.createSubCategory(subCategoryName);
            await subCategoryPage.expectSaved();
        } finally {
            await page.pause(); // الصفحة تفضل مفتوحة حتى لو التيست فشل
        }
    });
});