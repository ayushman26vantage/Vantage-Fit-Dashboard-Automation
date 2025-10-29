import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
    // Locators
    private readonly profileImage = 'img[alt="profileImage"]';
    private readonly adminDashboardButton = 'button[aria-label="HR Admin Dashboard"], button:has-text("Admin Dashboard")';
    private readonly profileDropdown = '.mat-menu-panel';

    // constructor(page: Page) {
    //     super(page);
    // }

    async openProfileDropdown() {
      
        try {
            await (await this.page.waitForSelector('svg#Capa_1', {timeout: 10000,state: 'visible' })).click();
            console.log('✅ Icon appeared and was clicked.');
          } catch (e) {
            console.warn('⚠️ Icon did not appear or was not visible in 10s. Skipping...');
          }
          
        await this.page.waitForSelector(this.profileImage, { timeout: 60000 });
        await this.page.click(this.profileImage);
        await this.page.waitForSelector(this.profileDropdown, { timeout: 60000 });
    }

    async navigateToAdminDashboard() {
        await this.openProfileDropdown();
        await this.page.waitForSelector(this.adminDashboardButton, { timeout: 60000 });
        // Click Admin Dashboard and wait for new tab
        const [newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.page.click(this.adminDashboardButton)
        ]);
        // Use a more reliable wait instead of 'networkidle'
        await newPage.waitForLoadState('domcontentloaded');
        return newPage;
    }

    async isProfileVisible() {
        return await this.page.isVisible(this.profileImage);
    }

    async isAdminDashboardOptionVisible() {
        try {
            await this.openProfileDropdown();
            await this.page.waitForSelector(this.adminDashboardButton, { timeout: 60000 });
            return await this.page.isVisible(this.adminDashboardButton);
        } catch (error) {
            return false;
        }
    }

    async getProfileDropdownOptions() {
        await this.openProfileDropdown();
        const options = await this.page.locator('.mat-menu-item').allTextContents();
        return options;
    }
} 