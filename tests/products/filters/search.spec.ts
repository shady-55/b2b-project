import { test } from '@playwright/test';
import { useProductsPage } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Search', () => {
    const ctx = useProductsPage();

    test('search by product name', async () => {
        const { productsPage } = ctx;
        await productsPage.expectHasResults();
        const name = (await productsPage.getNames())[0];
        console.log('Searching by name:', name);

        await productsPage.search(name);

        await productsPage.expectHasResults();
        await productsPage.expectEveryRow(
            async () => (await productsPage.getColumnValues('Product Name')).map((v) => v.toLowerCase()),
            (v) => v.includes(name.toLowerCase()),
            `every row should contain "${name}"`
        );
    });

    test('search by SKU', async () => {
        const { productsPage } = ctx;
        await productsPage.expectHasResults();
        const sku = (await productsPage.getSkus())[0];
        console.log('Searching by SKU:', sku);

        await productsPage.search(sku);

        await productsPage.expectHasResults();
        await productsPage.expectEveryRow(
            async () => (await productsPage.getColumnValues('Product Name')).map((v) => v.toLowerCase()),
            (v) => v.includes(sku.toLowerCase()),
            `every row should contain SKU "${sku}"`
        );
    });

    test('search with non-existing text shows no results', async () => {
        await ctx.productsPage.search(`no-such-product-${Date.now()}`);
        await ctx.productsPage.expectNoResults();
    });
});
