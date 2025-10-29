import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../pages/CreateChallengePage';

// Test suite for verifying the content of the Create Challenge page
test.describe.serial('Create Challenge Page Content Verification', () => {
    let adminPage: Page; // To store the new tab/page reference

    // This hook runs once before all tests in this suite
    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        
        // 1. Login and navigate to home
        await loginPage.navigate();
        await loginPage.login('johnmclane@jsdemo.com', 'welcome');
        await page.waitForURL('**/ng/home', { timeout: 60000 });

        // 2. Open Admin Dashboard in a new tab
        const [newAdminPage] = await Promise.all([
            context.waitForEvent('page'),
            dashboardPage.navigateToAdminDashboard(),
        ]);
        adminPage = newAdminPage;

        // 3. Navigate to the Create Challenge page
        const newAdminDashboardPage = new AdminDashboardPage(adminPage);
        await adminPage.waitForURL('**/yearbook/insights', { timeout: 60000 });
        await newAdminDashboardPage.navigateToVantageFitOverview();
        const newSidebar = new DashboardSidebarPage(adminPage);
        await newSidebar.navigateToCreateChallenge();
    });

    // This hook runs once after all tests in this suite
    test.afterAll(async () => {
        if (adminPage) {
            await adminPage.close();
        }
    });

    // Test cases for each challenge's description text
    test('should display the correct description for Custom Challenge', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getChallengeDescription('Custom');
        expect(description?.trim()).toBe('Do it yourself: configure every task and target individually.');
    });

    test('should display the correct description for Race Challenge', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getChallengeDescription('Race');
        expect(description?.trim()).toBe('A wellness competition driven by a realtime leaderboard with no specific targets and a pure race to top the leaderboard.');
    });

    test('should display the correct description for Journey Challenge', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getChallengeDescription('Journey');
        expect(description?.trim()).toBe('A wellness competition driven by a real-time leaderboard, with no specific targets, focusing on a pure race to the top.');
    });

    test('should display the correct description for E-Marathon Challenge', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getChallengeDescription('E-Marathon');
        expect(description?.trim()).toBe('A unique challenge format meant to simulate a virtual marathon with simply considering 1000 steps as 1 km (1609 steps = 1 mile) with a finish line defined at a mile-marker of your choice.');
    });

    test('should display the correct description for Streak Challenge', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getChallengeDescription('Streak');
        expect(description?.trim()).toBe('A simple competition may end up being a boring race. Add some flavour to your challenge by setting a daily target.');
    });

    // Test cases for each template's description text
    test('should display the correct description for "Stress Free Month" template', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getTemplateDescription('Stress Free Month');
        expect(description?.trim()).toBe('Join our HR team for a month-long campaign, "Embrace Serenity."');
    });

    test('should display the correct description for "Elevate Endurance" template', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getTemplateDescription('Elevate Endurance');
        expect(description?.trim()).toBe('Join us for "Elevate Endurance: Your Stamina Building Month."');
    });

    test('should display the correct description for "Mindful Moving" template', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getTemplateDescription('Mindful Moving');
        expect(description?.trim()).toBe('Join us for "Mindful Moving: A Month of Movement and Mindfulness."');
    });

    test('should display the correct description for "Healthy Habits Hero" template', async () => {
        const createChallengePage = new CreateChallengePage(adminPage);
        const description = await createChallengePage.getTemplateDescription('Healthy Habits Hero');
        expect(description?.trim()).toBe('Introducing "Healthy Habits Hero: Your Month of Wellness."');
    });
    
}); 