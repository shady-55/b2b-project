import { expect, type Locator, type Page } from '@playwright/test';

export type FilterDropdown = 'Product Type' | 'Category' | 'Country' | 'Status' | 'Stock';

export class AllProductsPage {
    //============= variables =============
    readonly page: Page;
    readonly url = 'https://admin-dev.justacodes.com/products/all';

    //============= locators ==============
    readonly productsMenu: Locator;
    readonly allProductsLink: Locator;

    readonly searchInput: Locator;
    readonly minPriceInput: Locator;
    readonly maxPriceInput: Locator;

    readonly activeProductsTab: Locator;
    readonly tableHeaders: Locator;
    readonly dataRows: Locator;
    readonly option: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;

        this.productsMenu = page.locator("//span[normalize-space()='Products']");
        this.allProductsLink = page.locator("//span[normalize-space()='All Products']");

        this.searchInput = page.locator("//input[contains(@placeholder,'Search by name or sku')]");
        this.minPriceInput = page.locator("//input[contains(@placeholder,'Min price')]");
        this.maxPriceInput = page.locator("//input[contains(@placeholder,'Max price')]");

        this.activeProductsTab = page.locator("//button[contains(normalize-space(),'Active Products')]");
        this.tableHeaders = page.locator('table thead th');
        // صفوف الداتا بس (بنستبعد صف "No products" اللي بيبقى خلية واحدة)
        this.dataRows = page.locator('table tbody tr').filter({ has: page.locator('td:nth-child(5)') });
        this.option = page.getByRole('option');
    }

    //============= helpers ===============
    // الدروب داون اللي بعد الـ label بتاعها (select عادية أو custom button)
    // الفلاتر قبل الجدول في الـ DOM فـ first() بتجيب الفلتر مش عنوان العمود
    dropdown(label: FilterDropdown): Locator {
        return this.page
            .locator(
                `//*[normalize-space(text())='${label}']/following::*[self::select or self::button or @role='combobox'][1]`
            )
            .first();
    }

    private async isNativeSelect(dropdown: Locator): Promise<boolean> {
        return (await dropdown.evaluate((el) => el.tagName.toLowerCase())) === 'select';
    }

    // بيستنى الجدول يخلص تحميل بعد أي تغيير في الفلاتر
    async waitForTable() {
        // لو الصفحة فيها polling عمرها ما هتبقى idle، فمش هنستنى أكتر من 5 ثواني
        await this.page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
    }

    //============= OTP wait ==============
    async waitForOtp(timeoutMs = 120_000) {
        await expect(this.productsMenu).toBeVisible({ timeout: timeoutMs });
    }

    //============= navigation ============
    async openFromMenu() {
        await this.productsMenu.click();
        await this.allProductsLink.click();
        await expect(this.page).toHaveURL(/\/products\/all/);
        await expect(this.searchInput).toBeVisible();
        await this.waitForTable();
    }

    // بيرجع الصفحة لحالتها الأصلية (كل الفلاتر فاضية)
    async reload() {
        await this.page.goto(this.url);
        await expect(this.searchInput).toBeVisible();
        await this.waitForTable();
    }

    //============= filter actions ========
    async search(text: string) {
        await this.searchInput.fill(text);
        await this.waitForTable();
    }

    async setMinPrice(value: string) {
        await this.minPriceInput.fill(value);
        await this.waitForTable();
    }

    async setMaxPrice(value: string) {
        await this.maxPriceInput.fill(value);
        await this.waitForTable();
    }

    // بيرجع كل الاختيارات اللي في الدروب داون (من غير "All ...")
    async getDropdownOptions(label: FilterDropdown): Promise<string[]> {
        const dropdown = this.dropdown(label);
        let texts: string[];

        if (await this.isNativeSelect(dropdown)) {
            texts = await dropdown.locator('option').allInnerTexts();
        } else {
            await dropdown.click();
            await expect(this.option.first()).toBeVisible();
            texts = await this.option.allInnerTexts();
            await this.page.keyboard.press('Escape');
            await expect(this.option.first()).toBeHidden();
        }

        return texts.map((t) => t.trim()).filter((t) => t && !/^all\b/i.test(t));
    }

    async selectFilter(label: FilterDropdown, optionText: string) {
        const dropdown = this.dropdown(label);

        if (await this.isNativeSelect(dropdown)) {
            await dropdown.selectOption({ label: optionText });
        } else {
            await dropdown.click();
            await this.option.filter({ hasText: optionText }).first().click();
            await expect(this.option.first()).toBeHidden();
        }

        await this.waitForTable();
    }

    //============= table readers =========
    async columnIndex(header: string): Promise<number> {
        const headers = (await this.tableHeaders.allInnerTexts()).map((h) => h.trim().toLowerCase());
        const index = headers.indexOf(header.toLowerCase());
        if (index === -1) throw new Error(`Column "${header}" not found. Headers: ${headers.join(', ')}`);
        return index;
    }

    async getColumnValues(header: string): Promise<string[]> {
        const index = await this.columnIndex(header);
        return this.dataRows.evaluateAll(
            (rows, i) => rows.map((row) => (row.querySelectorAll('td')[i] as HTMLElement)?.innerText.trim() ?? ''),
            index
        );
    }

    // اسم المنتج = أول سطر في الخلية، الـ SKU = التاني
    async getNames(): Promise<string[]> {
        return (await this.getColumnValues('Product Name')).map((v) => v.split('\n')[0].trim());
    }

    async getSkus(): Promise<string[]> {
        return (await this.getColumnValues('Product Name')).map((v) => (v.split('\n')[1] ?? '').trim());
    }

    // السعر الحالي = أول رقم في الخلية (التاني هو السعر القديم المشطوب)
    async getPrices(): Promise<number[]> {
        return (await this.getColumnValues('Price')).map((v) => {
            const match = v.replace(/,/g, '').match(/\d+(\.\d+)?/);
            return match ? Number(match[0]) : NaN;
        });
    }

    async getActiveCount(): Promise<number> {
        const text = await this.activeProductsTab.innerText();
        return Number(text.match(/\((\d+)\)/)?.[1] ?? NaN);
    }

    //============= assertions ============
    // بيستنى لحد ما كل الصفوف تطابق الشرط (عشان الـ debounce والـ API)
    async expectEveryRow<T>(read: () => Promise<T[]>, check: (value: T) => boolean, message: string) {
        await expect
            .poll(async () => {
                const values = await read();
                const bad = values.filter((v) => !check(v));
                return bad.length === 0 ? 'ok' : `${message} — mismatches: ${JSON.stringify(bad.slice(0, 5))}`;
            }, { message, timeout: 15_000 })
            .toBe('ok');
    }

    async expectNoResults() {
        await expect(this.dataRows).toHaveCount(0, { timeout: 15_000 });
    }

    async expectHasResults() {
        await expect(this.dataRows.first()).toBeVisible({ timeout: 15_000 });
    }
}
