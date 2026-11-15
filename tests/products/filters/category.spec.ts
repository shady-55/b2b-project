import { test } from '@playwright/test';
import { useProductsPage, dropdownFilterTest } from '../../pages/filtersetup';

test.describe.configure({ mode: 'serial' });

test.describe('Filter: Category', () => {
    const ctx = useProductsPage();

    // الكاتيجوري ممكن تبقى كتير، فبنجرب أول 3 بس
    dropdownFilterTest(ctx, 'Category', 'Category', 3);
});
