import { test } from '@playwright/test';
import { LoginPage } from '../pages/loginpage';
import { CreateCategoryPage } from '../pages/createcategorypage';
import testdata from '../testdata/testdata.json';

const parsed_data = testdata;

test.describe('create category tests', () => {
    test('create category with image and description', async ({ page }) => {
        test.setTimeout(0);

        const loginPage = new LoginPage(page);
        const createCategoryPage = new CreateCategoryPage(page);
        const categoryName = `Auto Category ${Date.now()}`;

        try {
            await loginPage.goto();
            await loginPage.login(parsed_data.email, parsed_data.password);

            // استنى لحد ما تكتب الـ OTP بنفسك
            await createCategoryPage.waitForOtp();

            // تسجيل طلبات الشبكة بعد إتمام تسجيل الدخول والـ OTP
            page.on('response', (response) => {
                const request = response.request();

                // طباعة طلبات API فقط
                if (!['xhr', 'fetch'].includes(request.resourceType())) {
                    return;
                }

                let sentData: unknown = request.postData();

                try {
                    sentData = request.postDataJSON();
                } catch {
                    // لو البيانات مش JSON، نحتفظ بالنص الأصلي
                }

                console.log('\n========== API REQUEST ==========');
                console.log('Method:', request.method());
                console.log('URL:', request.url());
                console.log('Status Code:', response.status());
                console.log(
                    'Sent Data:',
                    sentData == null
                        ? 'No request body'
                        : typeof sentData === 'string'
                            ? sentData
                            : JSON.stringify(sentData, null, 2)
                );
                console.log('=================================\n');
            });

            page.on('requestfailed', (request) => {
                if (!['xhr', 'fetch'].includes(request.resourceType())) {
                    return;
                }

                console.log('\n========== NETWORK ERROR ==========');
                console.log('Method:', request.method());
                console.log('URL:', request.url());
                console.log('Error:', request.failure()?.errorText);
                console.log('===================================\n');
            });

            await createCategoryPage.createCategory(categoryName);
            await createCategoryPage.expectCategorySaved();
        } finally {
            // فتح الـ Inspector وإيقاف التنفيذ للمراجعة
            await page.pause();
        }
    });
});