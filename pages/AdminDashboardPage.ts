import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDashboardPage extends BasePage {
    // Locators for Admin Dashboard
    private readonly pageTitle = 'h1, .page-title';
    private readonly insightsSection = '.insights-section';
    private readonly yearbookSection = '.yearbook-section';
    private readonly serviceMilestoneDropdown = 'span:has-text("Service Milestone")';
    private readonly vantageFitOption = 'div.cursor-pointer:has-text("Vantage Fit")';

    constructor(page: Page) {
        super(page);
    }

    async waitForDashboardLoad() {
        await this.page.waitForLoadState('networkidle');
        // Wait for the insights page to be fully loaded
        await this.page.waitForSelector(this.pageTitle, { timeout: 10000 });
    }

    async getPageTitle() {
        return await this.page.locator(this.pageTitle).textContent();
    }

    async isInsightsPage() {
        return this.page.url().includes('/yearbook/insights');
    }

    async isDashboardLoaded() {
        try {
            await this.waitForDashboardLoad();
            return true;
        } catch (error) {
            return false;
        }
    }

    async getCurrentUrl() {
        return this.page.url();
    }

    async navigateToVantageFitOverview() {
        // From the insights page, click the dropdown and select Vantage Fit
        await this.page.waitForSelector(this.serviceMilestoneDropdown, { timeout: 15000 });
        await this.page.click(this.serviceMilestoneDropdown);
        
        await this.page.waitForSelector(this.vantageFitOption, { timeout: 10000 });
        await this.page.click(this.vantageFitOption);

        // Wait for the overview page to load
        await this.page.waitForURL('**/fit/overview', { timeout: 15000 });
    }

     async navigateToVantageFitDash() {
        await this.page.waitForTimeout(500);
        // From the insights page, click the dropdown and select Vantage Fit
        await this.page.goto('https://dashboard-v2.vantagecircle.co.in/fit/overview')
       // await  this.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/overview");
  
    }
} 