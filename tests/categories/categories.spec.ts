import { test } from '@playwright/test';
import { CreateCategoryPage } from '../pages/createcategorypage';

test.describe('create category tests', () => {
    test('create category with image and description', async ({ page }) => {
        test.setTimeout(0);

        const createCategoryPage = new CreateCategoryPage(page);
        const categoryName = `Auto Category ${Date.now()}`;

        try {
            // الجلسة جاهزة من auth.setup.ts (من غير login ولا OTP)
            await page.goto('/');
            await createCategoryPage.waitForOtp(30_000);

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