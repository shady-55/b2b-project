import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
    //============= variables =============
    readonly page: Page;
    readonly url = "/login";

    //============= locators ==============
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly sidebarMenu: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator("//input[@id='email']");
        this.passwordInput = page.locator("//input[@id='password-input']");
        this.submitButton = page.locator("//button[@id='login-submit']");
        // بتظهر بس بعد login + OTP ناجحين
        this.sidebarMenu = page.locator("//span[normalize-space()='Products']");
    }

    //============= methods ===============
    async goto() {
        await this.page.goto(this.url);
    }

    //============= actions ===============
    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    //============= assertions ============
    // النجاح = القايمة الجانبية ظهرت (بعد ما تكتب الـ OTP)
    async expectLoginSuccess(timeoutMs = 150_000) {
        await expect(this.sidebarMenu).toBeVisible({ timeout: timeoutMs });
        await expect(this.page).not.toHaveURL(/\/login/);
    }

    // الفشل = لسه في صفحة الـ login والفورم موجود ومفيش قايمة
    async expectLoginFailed() {
        await this.page.waitForLoadState('networkidle');
        await expect(this.page).toHaveURL(/\/login/);
        await expect(this.emailInput).toBeVisible();
        await expect(this.sidebarMenu).toBeHidden();
    }
}
