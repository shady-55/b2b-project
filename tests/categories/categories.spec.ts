import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { CreateCategoryPage } from '../pages/createcategorypage';
import testdata from '../testdata/testdata.json';

const parsed_data = testdata;

test.describe('create category tests', () => {
    test('create category with image and description', async ({ page }) => {
        test.setTimeout(0); // من غير حد زمني: الـ OTP + الصفحة تفضل مفتوحة

        const loginPage = new LoginPage(page);
        const createCategoryPage = new CreateCategoryPage(page);
        const categoryName = `Auto Category ${Date.now()}`;

        try {
            await loginPage.goto();
            await loginPage.login(parsed_data.email, parsed_data.password);

            // استنى لحد ما تكتب الـ OTP بنفسك
            await createCategoryPage.waitForOtp();

            await createCategoryPage.createCategory(categoryName);
            await createCategoryPage.expectCategorySaved();
        } finally {
            await page.pause(); // الصفحة تفضل مفتوحة حتى لو التيست فشل
        }
    });
});