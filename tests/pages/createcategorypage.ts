import { expect, type Locator, type Page } from '@playwright/test';

export class CreateCategoryPage {
    //============= variables =============
    readonly page: Page;
    // صورة PNG 200x200 جوه الكود، فمش محتاج ملف image.png على الجهاز
    readonly image = {
        name: 'image.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAACFUlEQVR4nO3SQQkAIADAQJOY07CGsYRDkIMLsMfGXBuuG88L+JKxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi8QBuHThsH2qmk8AAAAASUVORK5CYII=',
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
    readonly saveButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;
        this.categoriesMenu = page.locator("//span[normalize-space()='Categories']");
        this.createNewCategoryButton = page.locator("//span[normalize-space()='Create new Category']");
        this.nameInput = page.locator("//input[@placeholder='Enter name']");
        this.combobox = page.locator("//button[@role='combobox']").first();
        // أول عنصر ظاهر جوه القايمة المفتوحة (مش أول div بنفس الكلاس في الصفحة كلها)
        this.firstOption = page.getByRole('option').first();
        this.uploadImageArea = page.locator("//span[@class='text-premium-text-medium text-xs dark:text-gray-300']").first();
        this.descriptionBox = page.locator("//div[@role='textbox']");
        this.categoryButton = page.locator("//button[normalize-space()='Category']");
        this.saveButton = page.locator("//button[normalize-space()='Save Category']");
    }

    //============= helpers ===============
    // نص بطول 50 حرف بالظبط
    private generateDescription(length = 50): string {
        return 'Automation test description '.repeat(5).slice(0, length);
    }

    //============= OTP wait ==============
    // اكتب الـ OTP بنفسك؛ التيست بيكمل أول ما تظهر القايمة الجانبية
    async waitForOtp(timeoutMs = 120_000) {
        await expect(this.categoriesMenu).toBeVisible({ timeout: timeoutMs });
    }

    //============= actions ===============
    async openCreateCategory() {
        await this.categoriesMenu.click(); // 1
        await this.createNewCategoryButton.click(); // 2
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
        await this.descriptionBox.fill(this.generateDescription(50));
    }

    async save() {
        await this.saveButton.click();
    }

    async fillForm(name: string) {
        await this.openCreateCategory();
        await this.categoryButton.click(); // اختيار كاتيجري قبل الاسم
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
    // بعد الحفظ الصفحة بتسيب /categories/create (لو الموقع بيفضل فيها عدّل السطر ده)
    async expectCategorySaved() {
        await expect(this.page).not.toHaveURL(/\/categories\/create/);
    }

    async expectFormFilled(name: string) {
        await expect(this.nameInput).toHaveValue(name);
        const text = (await this.descriptionBox.innerText()).trim();
        expect(text.length).toBe(50);
    }
}