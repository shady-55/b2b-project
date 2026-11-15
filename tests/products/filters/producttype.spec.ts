import { test } from '@playwright/test';
import { useProductsPage, dropdownFilterTest } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Product Type', () => {
    const ctx = useProductsPage();

    dropdownFilterTest(ctx, 'Product Type', 'Product Type');
});
