import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
    //============= variables =============
    readonly page: Page;
    readonly url = "https://admin-dev.justacodes.com/login";

    //============= locators ==============
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;

    //============= constructor ===========
    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator("//input[@id='email']");
        this.passwordInput = page.locator("//input[@id='password-input']");
        this.submitButton = page.locator("//button[@id='login-submit']");
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
    async expectLoginSuccess() {
        await expect(this.page).not.toHaveURL(this.url);
    }

    async expectLoginFailed() {
        await expect(this.page).toHaveURL(this.url);
    }
}