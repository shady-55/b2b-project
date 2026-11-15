import { test } from '@playwright/test';
import { useProductsPage, dropdownFilterTest } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Status', () => {
    const ctx = useProductsPage();

    dropdownFilterTest(ctx, 'Status', 'Status');
});
