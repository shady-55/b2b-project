import { expect, type Locator, type Page } from '@playwright/test';

export class FormPage {
    //============= variables =============
    readonly page: Page;

    //============= locators ==============
    readonly categoriesMenu: Locator;
    readonly nameInput: Locator;
    readonly firstOption: Locator;
    readonly firstCheckbox: Locator;
    readonly submitButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;

        this.categoriesMenu = page.locator(
            "//span[normalize-space()='Categories']"
        );

        this.nameInput = page.locator(
            "//input[@placeholder='Enter name']"
        );

        this.firstOption = page
            .locator("//div[@class='flex items-center gap-2 truncate']")
            .filter({ visible: true })
            .first();

        this.firstCheckbox = page
            .getByRole('checkbox')
            .filter({ visible: true })
            .first();

        this.submitButton = page.locator(
            "//button[@type='submit']"
        );
    }

    //============= OTP wait ==============
    async waitForOtp(timeoutMs = 120_000) {
        await expect(this.categoriesMenu).toBeVisible({
            timeout: timeoutMs,
        });
    }

    //============= actions ===============
    async open(url: string) {
        await this.page.goto(url);
    }

    async fillName(name: string) {
        await this.nameInput.fill(name);
    }

    async selectFirstOption() {
        // فتح القائمة
        await expect(this.firstOption).toBeVisible();
        await this.firstOption.click();

        // اختيار أول Checkbox ظاهر
        await expect(this.firstCheckbox).toBeVisible();
        await this.firstCheckbox.check();
        await expect(this.firstCheckbox).toBeChecked();
    }

    async submit() {
        await this.submitButton.click();
    }

    async fillForm(name: string) {
        await this.fillName(name);
        await this.selectFirstOption();
    }

    async createItem(name: string) {
        await this.fillForm(name);
        await this.submit();
    }

    //============= assertions ============
    async expectSubmitted(formUrl: string) {
        await expect(this.page).not.toHaveURL(formUrl);
    }
}