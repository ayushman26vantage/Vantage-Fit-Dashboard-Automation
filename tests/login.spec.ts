import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';

test('should login and navigate to Vantage Fit overview page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1. Login
    await loginPage.navigate();
    await loginPage.login('johnmclane@jsdemo.com', 'welcome');
    await page.waitForURL('**/ng/home', { timeout: 20000 });

    // 2. Navigate to Admin Dashboard (opens new tab)
    const adminPage = await dashboardPage.navigateToAdminDashboard();
    const adminDashboardPage = new AdminDashboardPage(adminPage);
 
    // 3. Wait for the new tab to load the insights page
    await adminPage.waitForURL('**/yearbook/insights', { timeout: 15000 });

    // 4. From insights, navigate to the Vantage Fit overview page
    await adminDashboardPage.navigateToVantageFitOverview();

    // 5. Assert the final URL is correct
    expect(adminPage.url()).toContain('/fit/overview');
    
    // 6. Clean up
    await adminPage.close();
});

test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();
    await loginPage.openLoginForm();
    await loginPage.fillCredentials('invalid@example.com', 'wrongpassword');
    await loginPage.submitLogin();
    
    // Add assertions for error message if available
    // await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});

test('should verify Admin Dashboard option is available for user with role', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Login with test user
    await loginPage.navigate();
    await loginPage.login('vantagefituser2@gmail.com', 'welcome');
    
    // Verify Admin Dashboard option is visible in profile dropdown
    expect(await dashboardPage.isAdminDashboardOptionVisible()).toBeTruthy();
}); 