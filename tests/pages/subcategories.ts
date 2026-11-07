import { expect, type Locator, type Page } from '@playwright/test';

export class SubCategoryPage {
    //============= variables =============
    readonly page: Page;

    // صورة PNG 200x200 جوه الكود، فمش محتاج ملف على الجهاز
    readonly image = {
        name: 'image.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAACFUlEQVR4nO3SQQkAIADAQJOY07CGsYRDkIMLsMfGXBuuG88L+JKxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi4SxSBiLhLFIGIuEsUgYi8QBuHThsH2qmk8AAAAASUVORK5CYII=',
            'base64'
        ),
    };

    //============= locators ==============
    readonly categoriesMenu: Locator;
    readonly createNewCategoryLink: Locator;
    readonly subCategoryButton: Locator;
    readonly nameInput: Locator;
    readonly requiredDropdowns: Locator;
    readonly firstOption: Locator;
    readonly uploadImageLabel: Locator;
    readonly descriptionEditor: Locator;
    readonly saveButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;
        this.categoriesMenu = page.locator("//span[normalize-space()='Categories']");
        this.createNewCategoryLink = page.locator("//span[normalize-space()='Create new Category']");
        this.subCategoryButton = page.locator("//button[normalize-space()='Sub-category']");
        this.nameInput = page.locator("//input[@placeholder='Enter name']");
        this.requiredDropdowns = page.locator("//button[@aria-required='true']");
        // أول عنصر في القايمة المفتوحة (نفس الطريقة اللي اشتغلت في فورم الكاتيجري)
        this.firstOption = page.getByRole('option').first();
        this.uploadImageLabel = page.locator(
            "//label[@class='border-elite-border hover:border-premium-accent dark:hover:border-premium-accent bg-elite-bg-soft flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors dark:border-gray-600 dark:bg-gray-700/50']"
        );
        this.descriptionEditor = page.locator("//p[@class='is-empty is-editor-empty']");
        this.saveButton = page.getByRole('button', { name: 'Save Category' });
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
        await this.categoriesMenu.click();
        await this.createNewCategoryLink.click();
    }

    async chooseSubCategoryType() {
        await this.subCategoryButton.click();
    }

    async fillName(name: string) {
        await this.nameInput.fill(name);
    }

    // يفتح كل قايمة مطلوبة بالترتيب (الأولى ثم التانية لو موجودة) ويختار أول عنصر
    async selectFirstOptionFromRequiredDropdowns() {
        const count = await this.requiredDropdowns.count();
        for (let i = 0; i < count; i++) {
            await this.requiredDropdowns.nth(i).click();
            await expect(this.firstOption).toBeVisible();
            await this.firstOption.click();
            // استنى القايمة تتقفل قبل ما نفتح اللي بعدها
            await expect(this.firstOption).toBeHidden();
        }
    }

    async uploadImage() {
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.uploadImageLabel.click(),
        ]);
        await fileChooser.setFiles(this.image);
    }

    async fillDescription() {
        await this.descriptionEditor.click();
        await this.page.keyboard.type(this.generateDescription(50));
    }

    // يدوس حفظ ويطبع في التيرمنال طلب الـ API ورده
    async save() {
        const [response] = await Promise.all([
            this.page.waitForResponse(
                (res) =>
                    ['POST', 'PUT', 'PATCH'].includes(res.request().method()) &&
                    res.url().includes('categor'),
                { timeout: 30_000 }
            ),
            this.saveButton.click(),
        ]);

        const request = response.request();
        const bodyText = await response.text();
        let body: unknown = bodyText;
        try {
            body = JSON.parse(bodyText);
        } catch {
            // الرد مش JSON، هنطبعه كنص
        }

        console.log('\n========== API: Create Sub-category ==========');
        console.log('URL     :', request.method(), response.url());
        console.log('Status  :', response.status(), response.statusText());
        console.log('Request :', request.postData()?.slice(0, 300) ?? '(no body)');
        console.log('Response:', JSON.stringify(body, null, 2));
        console.log('==============================================\n');

        return response;
    }

    async fillForm(name: string) {
        await this.openCreateCategory();
        await this.chooseSubCategoryType();
        await this.fillName(name);
        await this.selectFirstOptionFromRequiredDropdowns();
        await this.uploadImage();
        await this.fillDescription();
    }

    async createSubCategory(name: string) {
        await this.fillForm(name);
        await this.save();
    }

    //============= assertions ============
    async expectSaved() {
        await expect(this.page).not.toHaveURL(/\/categories\/create/);
    }
}