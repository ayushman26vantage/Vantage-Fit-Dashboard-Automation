import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
    // Locators
    private readonly loginDropdownButton = '#logindropdown';
    private readonly emailInput = '#LoginForm_email';
    private readonly passwordInput = '#LoginForm_password';
    private readonly loginButton = '#loginbtn';

    constructor(page: Page) {
        super(page);
    }

    async openLoginForm() {
        await this.clickElement(this.loginDropdownButton);
        // Wait for the dropdown to appear and form to be visible
        await this.waitForElement(this.emailInput);
    }

    async fillCredentials(email: string, password: string) {
        await this.fillInput(this.emailInput, email);
        await this.fillInput(this.passwordInput, password);
    }

    async submitLogin() {
        await this.clickElement(this.loginButton);
        // No wait for networkidle or waitForPageLoad
        
    }

    async login(email: string, password: string) {
        await this.openLoginForm();
        await this.fillCredentials(email, password);
        await this.submitLogin();
    }

    async isLoginPage() {
        return await this.page.isVisible(this.loginDropdownButton);
    }

    async isLoggedIn() {
        // Check if profile image is visible (indicates successful login)

        return await this.page.isVisible('img[alt="profileImage"]');
    }



} 