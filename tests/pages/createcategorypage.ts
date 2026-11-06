import { expect, type Locator, type Page } from '@playwright/test';

export class CreateCategoryPage {
    //============= variables =============
    readonly page: Page;

    // صورة PNG داخل الكود
    readonly image = {
        name: 'image.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAACFUlEQVR4nO3SQQkAIADAQJOY07CGsYRDkIMLsMfGXBuuG88L+JKxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi8QBuHThsH2qmk8AAAAASUVORK5CYII=',
            'base64'
        ),
    };

    //============= locators ==============
    readonly categoriesMenu: Locator;
    readonly createNewCategoryButton: Locator;
    readonly nameInput: Locator;
    readonly combobox: Locator;
    readonly firstOption: Locator;
    readonly uploadImageArea: Locator;
    readonly descriptionBox: Locator;
    readonly categoryButton: Locator;
    readonly selectionDropdown: Locator;
    readonly firstCheckbox: Locator;
    readonly saveButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;

        this.categoriesMenu = page.locator(
            "//span[normalize-space()='Categories']"
        );

        this.createNewCategoryButton = page.locator(
            "//span[normalize-space()='Create new Category']"
        );

        this.nameInput = page.locator(
            "//input[@placeholder='Enter name']"
        );

        this.combobox = page
            .locator("//button[@role='combobox']")
            .first();

        this.firstOption = page.getByRole('option').first();

        this.uploadImageArea = page
            .locator(
                "//span[@class='text-premium-text-medium text-xs dark:text-gray-300']"
            )
            .first();

        this.descriptionBox = page.locator("//div[@role='textbox']");

        this.categoryButton = page.locator(
            "//button[normalize-space()='Category']"
        );

        this.selectionDropdown = page
            .locator("//div[@class='flex items-center gap-2 truncate']")
            .first();

        // أول Checkbox ظاهر في الصفحة
        this.firstCheckbox = page
            .getByRole('checkbox')
            .first();

        this.saveButton = page.locator(
            "//button[normalize-space()='Save Category']"
        );
    }

    //============= helpers ===============
    private generateDescription(length = 50): string {
        return 'Automation test description '.repeat(5).slice(0, length);
    }

    //============= OTP wait ==============
    async waitForOtp(timeoutMs = 120_000) {
        await expect(this.categoriesMenu).toBeVisible({
            timeout: timeoutMs,
        });
    }

    //============= actions ===============
    async openCreateCategory() {
        await this.categoriesMenu.click();
        await this.createNewCategoryButton.click();
    }

    async fillName(name: string) {
        await this.nameInput.fill(name);
    }

    async selectFirstOption() {
        await this.combobox.click();
        await expect(this.firstOption).toBeVisible();
        await this.firstOption.click();
    }

    async uploadImage() {
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.uploadImageArea.click(),
        ]);

        await fileChooser.setFiles(this.image);
    }

    async fillDescription() {
        await this.descriptionBox.click();
        await this.descriptionBox.fill(
            this.generateDescription(50)
        );
    }

    async selectFirstCheckbox() {
        await this.selectionDropdown.click();

        await expect(this.firstCheckbox).toBeVisible();
        await this.firstCheckbox.check();
        await expect(this.firstCheckbox).toBeChecked();
    }

    async save() {
        // فتح القائمة واختيار أول Checkbox قبل الحفظ
        await this.selectFirstCheckbox();

        await this.saveButton.click();
    }

    async fillForm(name: string) {
        await this.openCreateCategory();
        await this.categoryButton.click();
        await this.fillName(name);
        await this.selectFirstOption();
        await this.uploadImage();
        await this.fillDescription();
    }

    async createCategory(name: string) {
        await this.fillForm(name);
        await this.save();
    }

    //============= assertions ============
    async expectCategorySaved() {
        await expect(this.page).not.toHaveURL(
            /\/categories\/create/
        );
    }

    async expectFormFilled(name: string) {
        await expect(this.nameInput).toHaveValue(name);

        const text = (
            await this.descriptionBox.innerText()
        ).trim();

        expect(text.length).toBe(50);
    }
}