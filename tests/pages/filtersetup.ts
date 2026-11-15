import { test, expect, type Page } from '@playwright/test';
import { AllProductsPage } from './allproductspage';
import { AUTH_FILE } from '../testdata/env';

export { expect };

// بيشيل أي حاجة غير الحروف عشان "Top-up" = "Topup" = "TOP UP"
export const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * بيفتح صفحة الـ products بالجلسة المحفوظة مرة واحدة لكل ملف، وكل تيست بيبدأ من غير فلاتر.
 * لازم يتنادى جوه test.describe.
 */
export function useProductsPage() {
    const ctx = {} as { page: Page; productsPage: AllProductsPage };

    test.beforeAll(async ({ browser }) => {
        test.setTimeout(60_000);

        // browser.newPage مش بياخد إعدادات الـ project لوحده، فبنديله الجلسة والـ baseURL
        ctx.page = await browser.newPage({
            storageState: AUTH_FILE,
            baseURL: test.info().project.use.baseURL,
        });
        ctx.productsPage = new AllProductsPage(ctx.page);

        await ctx.page.goto('/');
        await ctx.productsPage.waitForOtp(30_000);
        await ctx.productsPage.openFromMenu();
    });

    test.beforeEach(async () => {
        test.setTimeout(60_000);
        await ctx.productsPage.reload();
    });

    test.afterAll(async () => {
        await ctx.page.close();
    });

    return ctx;
}

/**
 * بيولد تيست لفلتر dropdown ليه عمود في الجدول.
 */
export function dropdownFilterTest(
    ctx: { productsPage: AllProductsPage },
    filter: string,
    column: string,
    limit?: number
) {
    test(`filter by ${filter} (every option)`, async () => {
        const productsPage = ctx.productsPage;
        const options = await productsPage.getDropdownOptions(filter as any);
        console.log(`${filter} options:`, options);
        expect(options.length, `${filter} dropdown should have options`).toBeGreaterThan(0);

        const toCheck = limit ? options.slice(0, limit) : options;

        for (const option of toCheck) {
            await test.step(`${filter} = ${option}`, async () => {
                await productsPage.selectFilter(filter as any, option);
                await productsPage.expectEveryRow(
                    () => productsPage.getColumnValues(column as any),
                    (v) => normalize(v) === normalize(option),
                    `every "${column}" cell should be "${option}"`
                );
                const rows = await productsPage.dataRows.count();
                console.log(`${filter} = ${option}: ${rows} row(s) on page`);
            });
        }
    });
}
