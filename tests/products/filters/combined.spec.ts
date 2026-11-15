import { test } from '@playwright/test';
import { useProductsPage, normalize } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Combined', () => {
    const ctx = useProductsPage();

    test('combined filters: type + status + price', async () => {
        const { productsPage } = ctx;
        const type = (await productsPage.getDropdownOptions('Product Type'))[0];
        const status = (await productsPage.getDropdownOptions('Status'))[0];
        const max = 200;

        await productsPage.selectFilter('Product Type', type);
        await productsPage.selectFilter('Status', status);
        await productsPage.setMaxPrice(String(max));

        await productsPage.expectEveryRow(
            () => productsPage.getColumnValues('Product Type'),
            (v) => normalize(v) === normalize(type),
            `type should be "${type}"`
        );
        await productsPage.expectEveryRow(
            () => productsPage.getColumnValues('Status'),
            (v) => normalize(v) === normalize(status),
            `status should be "${status}"`
        );
        await productsPage.expectEveryRow(
            () => productsPage.getPrices(),
            (p) => p <= max,
            `price should be <= ${max}`
        );
    });
});
