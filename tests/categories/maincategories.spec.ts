import { test } from '@playwright/test';
import { FormPage } from '../pages/maincategories';

const FORM_URL = 'https://admin-dev.justacodes.com/categories/create';

test.describe('form tests', () => {
    test('fill form and submit', async ({ page }) => {
        test.setTimeout(0);

        const formPage = new FormPage(page);
        const itemName = `Auto Item ${Date.now()}`;

        try {
            // الجلسة جاهزة من auth.setup.ts (من غير login ولا OTP)
            await page.goto('/');
            await formPage.waitForOtp(30_000);

            // طباعة كل طلبات API بعد خطوة الـ OTP
            page.on('response', (response) => {
                const request = response.request();

                // استبعاد الصور وملفات CSS وغيرها
                if (!['xhr', 'fetch'].includes(request.resourceType())) {
                    return;
                }

                let sentData: unknown = request.postData();

                try {
                    sentData = request.postDataJSON();
                } catch {
                    // الاحتفاظ بالنص الأصلي لو البيانات مش JSON
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

            // طباعة الطلبات اللي فشلت على مستوى الشبكة
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

            await formPage.open(FORM_URL);
            await formPage.createItem(itemName);
            await formPage.expectSubmitted(FORM_URL);
        } finally {
            // إيقاف التنفيذ للمراجعة
            await page.pause();
        }
    });
});