import { test, expect } from '@playwright/test';
import { useProductsPage } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Country', () => {
    const ctx = useProductsPage();

    // الـ Country مالهاش عمود، فبنتأكد إن الفلتر اشتغل والجدول اتحمل من غير مشاكل
    test('filter by Country', async () => {
        const { productsPage } = ctx;
        const options = await productsPage.getDropdownOptions('Country');
        console.log('Country options:', options);
        expect(options.length, 'Country dropdown should have options').toBeGreaterThan(0);

        const totalBefore = await productsPage.getActiveCount();
        await productsPage.selectFilter('Country', options[0]);

        await expect(productsPage.activeProductsTab).toBeVisible();
        const totalAfter = await productsPage.getActiveCount();
        console.log(`Country = ${options[0]}: ${totalBefore} -> ${totalAfter} products`);
        expect(totalAfter).toBeLessThanOrEqual(totalBefore);
    });
});
