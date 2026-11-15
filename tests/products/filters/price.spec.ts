import { test } from '@playwright/test';
import { useProductsPage } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Price', () => {
    const ctx = useProductsPage();

    test('filter by min price', async () => {
        const { productsPage } = ctx;
        const min = 50;
        await productsPage.setMinPrice(String(min));

        await productsPage.expectEveryRow(
            () => productsPage.getPrices(),
            (p) => p >= min,
            `every price should be >= ${min}`
        );
    });

    test('filter by max price', async () => {
        const { productsPage } = ctx;
        const max = 50;
        await productsPage.setMaxPrice(String(max));

        await productsPage.expectEveryRow(
            () => productsPage.getPrices(),
            (p) => p <= max,
            `every price should be <= ${max}`
        );
    });

    test('filter by price range (min + max)', async () => {
        const { productsPage } = ctx;
        const min = 10;
        const max = 100;
        await productsPage.setMinPrice(String(min));
        await productsPage.setMaxPrice(String(max));

        await productsPage.expectEveryRow(
            () => productsPage.getPrices(),
            (p) => p >= min && p <= max,
            `every price should be between ${min} and ${max}`
        );
    });

    test('min price greater than max price shows no results', async () => {
        const { productsPage } = ctx;
        await productsPage.setMinPrice('500');
        await productsPage.setMaxPrice('10');
        await productsPage.expectNoResults();
    });
});
