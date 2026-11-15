import { expect, type Locator, type Page } from '@playwright/test';

export type ProductType = 'Voucher' | 'Range' | 'Top-up';

export interface ProductData {
    type: ProductType;
    name: string;
    sku: string;
    description: string;
    sellingPrice: string;
    costPrice: string;
    discountedPrice?: string;
    platformFees?: string;
    // Range only
    minAmount?: string;
    maxAmount?: string;
    priceOn1?: string;
    rangeCostPriceOn1?: string;
}

export class CreateProductPage {
    //============= variables =============
    readonly page: Page;

    //============= locators ==============
    readonly productsMenu: Locator;
    readonly addNewProductLink: Locator;
    readonly manualEntryButton: Locator;

    readonly nameInput: Locator;
    readonly skuInput: Locator;
    readonly descriptionInput: Locator;

    readonly mainCategoryDropdown: Locator;
    readonly categoryDropdown: Locator;
    readonly subCategoryDropdown: Locator;
    readonly firstOption: Locator;

    readonly sellingPriceInput: Locator;
    readonly costPriceInput: Locator;
    readonly discountedPriceInput: Locator;
    readonly platformFeesInput: Locator;

    readonly minAmountInput: Locator;
    readonly maxAmountInput: Locator;
    readonly priceOn1Input: Locator;
    readonly rangeCostPriceOn1Input: Locator;

    readonly saveButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;

        this.productsMenu = page.locator(
            "//span[normalize-space()='Products']"
        );

        this.addNewProductLink = page.locator(
            "//span[normalize-space()='Add New Product']"
        );

        this.manualEntryButton = page.locator(
            "//button[normalize-space()='Manual Entry']"
        );

        this.nameInput = page.locator(
            "//input[@placeholder='e.g. Spotify Premium 1 Month']"
        );

        this.skuInput = page.locator(
            "//input[@placeholder='e.g. SPT-PREM-1M']"
        );

        this.descriptionInput = page.locator(
            "//*[@placeholder='Product description']"
        );

        // الدروب داون بتاعة الـ Category Hierarchy (بالترتيب)
        // بنستبعد زرار "× Clear" اللي بيظهر جنب الـ label بعد الاختيار
        const dropdownAfter = (label: string) =>
            page.locator(
                `//*[normalize-space()='${label}']/following::*[self::select or (self::button and not(contains(normalize-space(),'Clear')))][1]`
            ).first();

        this.mainCategoryDropdown = dropdownAfter('Main Category');
        this.categoryDropdown = dropdownAfter('Category');
        this.subCategoryDropdown = dropdownAfter('Sub Category');

        this.firstOption = page.getByRole('option').first();

        this.sellingPriceInput = page.locator(
            "//label[contains(normalize-space(),'Selling Price')]/following::input[1]"
        );

        this.costPriceInput = page.locator(
            "//label[contains(normalize-space(),'Cost Price')]/following::input[1]"
        );

        this.discountedPriceInput = page.locator(
            "//label[normalize-space()='Discounted Price']/following::input[1]"
        );

        this.platformFeesInput = page.locator(
            "//input[@placeholder='e.g. 2.5']"
        );

        const inputAfterText = (text: string) =>
            page.locator(
                `//*[starts-with(normalize-space(text()),'${text}')]/following::input[1]`
            ).first();

        this.minAmountInput = inputAfterText('Min Amount');
        this.maxAmountInput = inputAfterText('Max Amount');
        this.priceOn1Input = inputAfterText('Price on 1');
        this.rangeCostPriceOn1Input = inputAfterText('Range Cost Price on 1');

        this.saveButton = page.getByRole('button', {
            name: /^(save|create|add)( new)?( product)?$/i,
        });
    }

    //============= OTP wait ==============
    async waitForOtp(timeoutMs = 120_000) {
        await expect(this.productsMenu).toBeVisible({
            timeout: timeoutMs,
        });
    }

    //============= actions ===============
    async openAddProduct() {
        await this.productsMenu.click();
        await this.addNewProductLink.click();
        await expect(this.page).toHaveURL(/\/products\/add/);
        await this.manualEntryButton.click();
    }

    async selectProductType(type: ProductType) {
        await this.page
            .locator(`//button[normalize-space()='${type}']`)
            .click();
    }

    // بيختار أول اختيار في الدروب داون (سواء كانت <select> عادية أو custom)
    // بيرجع false لو الدروب داون فاضية
    private async selectFirstFrom(dropdown: Locator, optional = false): Promise<boolean> {
        await expect(dropdown).toBeEnabled();

        const tag = await dropdown.evaluate((el) => el.tagName.toLowerCase());

        if (tag === 'select') {
            const count = await dropdown.locator('option').count();
            if (count < 2) {
                if (optional) return false;
                throw new Error('Dropdown has no options');
            }
            await dropdown.selectOption({ index: 1 });
            return true;
        }

        await dropdown.click();

        try {
            await expect(this.firstOption).toBeVisible({ timeout: 5_000 });
        } catch (error) {
            if (!optional) throw error;
            // الدروب داون فاضية: نقفلها ونكمل
            await this.page.keyboard.press('Escape');
            return false;
        }

        await this.firstOption.click();
        return true;
    }

    // بيجرب الـ Main Categories واحدة واحدة لحد ما يلاقي واحدة جواها Categories
    async selectCategoryHierarchy() {
        await expect(this.mainCategoryDropdown).toBeEnabled();
        const tag = await this.mainCategoryDropdown.evaluate((el) => el.tagName.toLowerCase());

        let mainCount: number;
        if (tag === 'select') {
            mainCount = (await this.mainCategoryDropdown.locator('option').count()) - 1;
        } else {
            await this.mainCategoryDropdown.click();
            await expect(this.firstOption).toBeVisible();
            mainCount = await this.page.getByRole('option').count();
            await this.page.keyboard.press('Escape');
        }

        for (let i = 0; i < mainCount; i++) {
            if (tag === 'select') {
                await this.mainCategoryDropdown.selectOption({ index: i + 1 });
            } else {
                await this.mainCategoryDropdown.click();
                await this.page.getByRole('option').nth(i).click();
            }

            if (await this.selectFirstFrom(this.categoryDropdown, true)) {
                // الـ Sub Category مش required
                const selected = await this.selectFirstFrom(this.subCategoryDropdown, true);
                if (!selected) {
                    console.log('Sub Category: no options for the selected category, skipped');
                }
                return;
            }
            console.log(`Main Category #${i + 1} has no categories, trying next`);
        }

        throw new Error('No Main Category with Categories was found');
    }

    async fillGeneralInformation(data: ProductData) {
        await this.selectProductType(data.type);
        await this.nameInput.fill(data.name);
        await this.skuInput.fill(data.sku);
        await this.descriptionInput.fill(data.description);
    }

    async fillPricing(data: ProductData) {
        if (data.type === 'Range') {
            await this.minAmountInput.fill(data.minAmount ?? '10');
            await this.maxAmountInput.fill(data.maxAmount ?? '500');
            await this.priceOn1Input.fill(data.priceOn1 ?? data.sellingPrice);
            await this.rangeCostPriceOn1Input.fill(data.rangeCostPriceOn1 ?? data.costPrice);
            if (data.platformFees !== undefined) {
                await this.platformFeesInput.fill(data.platformFees);
            }
            return;
        }

        await this.sellingPriceInput.fill(data.sellingPrice);
        await this.costPriceInput.fill(data.costPrice);

        if (data.discountedPrice !== undefined) {
            await this.discountedPriceInput.fill(data.discountedPrice);
        }

        if (data.platformFees !== undefined) {
            await this.platformFeesInput.fill(data.platformFees);
        }
    }

    async fillForm(data: ProductData) {
        await this.openAddProduct();
        await this.fillGeneralInformation(data);
        await this.selectCategoryHierarchy();
        await this.fillPricing(data);
    }

    async save() {
        await this.saveButton.scrollIntoViewIfNeeded();
        await this.saveButton.click();
    }

    async createProduct(data: ProductData) {
        await this.fillForm(data);
        await this.save();
    }

    //============= assertions ============
    async expectFormFilled(data: ProductData) {
        if (data.type === 'Range') {
            await expect(this.nameInput).toHaveValue(data.name);
            await expect(this.skuInput).toHaveValue(data.sku);
            return;
        }
        await expect(this.nameInput).toHaveValue(data.name);
        await expect(this.skuInput).toHaveValue(data.sku);
        await expect(this.sellingPriceInput).toHaveValue(data.sellingPrice);
        await expect(this.costPriceInput).toHaveValue(data.costPrice);
    }

    async expectProductSaved() {
        await expect(this.page).not.toHaveURL(/\/products\/add/, {
            timeout: 15_000,
        });
    }
}
