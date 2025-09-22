import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardSidebarPage extends BasePage {
    // Locators for the dashboard sidebar
    private readonly challengesMenu = 'p span:has-text("Challenges")';
    private readonly createChallengeSubMenu = "//*[normalize-space(.)='Create Challenge']"          //'p.submenu-item:has-text("Create Challenge")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigates to the Create Challenge page from the dashboard sidebar.
     */
    async navigateToCreateChallenge() {
        // Click on the 'Challenges' menu to expand it
        await this.page.waitForSelector(`//span[normalize-space()='Challenges']`);
        await this.page.click(`//span[normalize-space()='Challenges']`);

        // Click on the 'Create Challenge' submenu item
        await this.page.waitForSelector(this.createChallengeSubMenu, { timeout: 10000 });
        await this.page.click(this.createChallengeSubMenu);

        // Wait for the create-challenge page to load
        await this.page.waitForURL('**/fit/create-challenge', { timeout: 15000 });
    }
}
