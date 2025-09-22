import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../pages/CreateChallengePage';
import { BasePage } from '../pages/BasePage';

// Main suite for Create Challenge tests
test.describe('Create Challenge Flow', () => {
    let adminPage: Page; // To store the new tab/page reference

    // This hook runs before each test, handling login and navigation
    test.beforeEach(async ({ page, context }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        const adminDashboardPage = new AdminDashboardPage(page);
        const sidebar = new DashboardSidebarPage(page);

        // 1. Login and navigate to home
        await loginPage.navigate();
        await loginPage.login('johnmclane@jsdemo.com', 'welcome');
        await page.waitForURL('**/ng/home', { timeout: 15000 });

        // 2. Open Admin Dashboard in a new tab
        const [newAdminPage] = await Promise.all([
            context.waitForEvent('page'),
            dashboardPage.navigateToAdminDashboard(),
        ]);
        adminPage = newAdminPage; // Assign the new page to the outer scope

        // 3. Navigate to Vantage Fit and then to the Create Challenge page
        const newAdminDashboardPage = new AdminDashboardPage(adminPage);
        // Wait for either insights or overview page - be more flexible
        await adminPage.waitForURL('**/yearbook/**', { timeout: 30000 });
        await newAdminDashboardPage.navigateToVantageFitOverview();
        const newSidebar = new DashboardSidebarPage(adminPage);
        await newSidebar.navigateToCreateChallenge();
    });

    // This hook runs after each test, ensuring the new tab is closed
    test.afterEach(async () => {
        if (adminPage) {
            await adminPage.close();
        }
    });

    // Test cases for each challenge type
    test('should navigate to Custom Challenge page', async () => {
       let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('Custom');
        await adminPage.waitForTimeout(1000);
        let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge')
      
        expect(res.success,"Should navigate to `fit/create-challenge/custom-challenge`").toBe(true);
    });

    test('should navigate to Race Challenge page', async () => {
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('Race');
        let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/race-challenge')
      
        expect(res.success,"Should navigate to `fit/create-challenge/race-challenge`").toBe(true);
    });

    test('should navigate to Journey Challenge page', async () => {
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('Journey');
        let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge')
      
        expect(res.success,"Should navigate to `fit/create-challenge/journey-challenge`").toBe(true);
    });

    test('should navigate to E-Marathon Challenge page', async () => {
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('E-Marathon');
        let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/e-marathon-challenge')
      
        expect(res.success,"Should navigate to `fit/create-challenge/e-marathon-challenge`").toBe(true);
    });

    test('should navigate to Streak Challenge page', async () => {
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('Streak');
        let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/streak-challenge')
      
        expect(res.success,"Should navigate to `fit/create-challenge/streak-challenge`").toBe(true);
    });

    // Test cases for each template
    test('should navigate to the correct page for "Stress Free Month" template', async () => {
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectTemplate('Stress Free Month');
         let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge?templateId=1');
         expect(res.success,"Should navigate to `fit/create-challenge/custom-challenge?templateId=1`").toBe(true);
    });

    test('should navigate to the correct page for "Elevate Endurance" template', async () => {
         let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectTemplate('Elevate Endurance');
        let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge?templateId=2');
         expect(res.success,"Should navigate to `fit/create-challenge/custom-challenge?templateId=2`").toBe(true);
    });

    test('should navigate to the correct page for "Mindful Moving" template', async () => {
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectTemplate('Mindful Moving');
         let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge?templateId=3');
         expect(res.success,"Should navigate to `fit/create-challenge/custom-challenge?templateId=3`").toBe(true);
    });

    test('should navigate to the correct page for "Healthy Habits Hero" template', async () => {
          let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectTemplate('Healthy Habits Hero');
           let res=  await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge?templateId=4');
         expect(res.success,"Should navigate to `fit/create-challenge/custom-challenge?templateId=4`").toBe(true);
    });
}); 