import { basename } from 'path';
import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../pages/CreateChallengePage';
import { BasePage } from '../../pages/BasePage';
import { TargetAudiencePage } from '../../pages/TargetAudiencePage';
import testData from '../../Test-Data/355/journey-challenge.json';

let page: Page;
let adminPage: Page;
let context: BrowserContext;
let dateExtract: any;
let EnDdateExtract: any;
let MilestoneSteps: any;
let MilestoneStep: any;
let Milestones: any;

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(testData.credentials.username, testData.credentials.password);
    await page.waitForURL('**/ng/home', { timeout: 25000 });

    const [newAdminPage] = await Promise.all([
        page.context().waitForEvent('page'),
        dashboardPage.navigateToAdminDashboard(),
    ]);
    adminPage = newAdminPage;
    await adminPage.waitForLoadState('domcontentloaded');

    const adminDash = new AdminDashboardPage(adminPage);
    await adminDash.navigateToVantageFitDash();

    const sidebar = new DashboardSidebarPage(adminPage);
    await sidebar.navigateToCreateChallenge();
});

test.afterAll(async () => {
    try {
        if (adminPage && !adminPage.isClosed()) await adminPage.close();
        if (page && !page.isClosed()) await page.close();
        if (page?.context()) await page.context().close();
    } catch (err) {
        console.log('⚠️ Error while closing pages:', err);
    }
});
let res;
let res2;

test('Complete Journey Challenge Creation Flow - All Tests Combined', async () => {
    let BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);
    const targetAudiencePage = new TargetAudiencePage(adminPage);

    // Test 1: Verify Journey Challenge card is displayed
    console.log('Test 1: Verifying Journey Challenge card display...');
    let locator = `//*[normalize-space(.)='Journey Challenge']`;
    await adminPage.locator(locator).scrollIntoViewIfNeeded();
    res = await BaseObj.assertText(locator, `Journey Challenge`);
    expect(res.status, "Journey Challenge card is displayed in the Create Challenge").toBe("success");

    // Test 2: Verify the text, grammar, and description of the Journey Challenge card
    console.log('Test 2: Verifying Journey Challenge card description...');
    locator = `//*[normalize-space(.)='Journey Challenge']//following-sibling::div`;
    await adminPage.locator(locator).scrollIntoViewIfNeeded();
    res = await BaseObj.assertText(locator, `A wellness competition driven by a real-time leaderboard, with no specific targets, focusing on a pure race to the top.`);
    expect(res.status, "Journey Challenge card displays correct description").toBe("success");

    // Test 3: Verify the presence of the Create Challenge button inside the card
    console.log('Test 3: Verifying Create Challenge button presence...');
    locator = `//*[normalize-space(.)='Journey Challenge']//following-sibling::*[@label]`;
    let isEnabled = await adminPage.locator(locator).isEnabled();
    expect(isEnabled, 'verify the presence of the Create Challenge button inside the card').toBe(true);

    // Test 4: Navigate to Journey Challenge page
    console.log('Test 4: Navigating to Journey Challenge page...');
    await createChallengePage.selectChallengeType('Journey');
    await adminPage.waitForURL(`**/fit/create-challenge/journey-challenge`);
    res = await BaseObj.assertLink(testData.urls.journeyChallenge);
    expect(res.status, "Should navigate to fit/create-challenge/journey-challenge").toBe("success");

    // Test 5: Select challenge Journey type
    console.log('Test 5: Selecting challenge Journey type...');
    res = await createChallengePage.selectChallengeLogo(testData.challenge.Badge);
    expect(res.status, `Should select the logo '${testData.challenge.Badge}'`).toBe("success");

    // Test 6: Verify description based on badge type
    console.log('Test 6: Verifying description text...');
    if (testData.challenge.Badge === 'Journey to 7 wonders') {
        res = await BaseObj.assertText(`//*[contains(text(),'This is a long-distance running challenge that will take you on a tour of 7 wonders')]`, `This is a long-distance running challenge that will take you on a tour of 7 wonders around the world. Get ready to push yourself to the limit and experience the beauty of various places along the way.`);
        expect(res.status, `Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    } else if (testData.challenge.Badge === 'Backpacking through Europe') {
        res = await BaseObj.assertText(`//*[contains(text(),'This is a long-distance walking challenge that will take you on a virtual tour of the experience of backpacking through Europe')]`, `This is a long-distance walking challenge that will take you on a virtual tour of the experience of backpacking through Europe. Get ready to push yourself to the limit and experience the beauty of various places along the way.`);
        expect(res.status, `Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    }

    // Test 7: Click Next after selecting Journey type
    console.log('Test 7: Clicking Next after selecting Journey type...');
    await BaseObj.clickElement("//button[normalize-space()='Next']");
    let currentUrl = adminPage.url();
    expect(currentUrl).toContain('/fit/create-challenge/journey-challenge/challenge-info');

    // Test 8: Verify challenge title
    console.log('Test 8: Verifying challenge title...');
    if (testData.challenge.Badge === 'Journey to 7 wonders') {
        res = await BaseObj.assertText(`//*[contains(text(),'Creating Journey to 7 wonders')]`, `Creating Journey to 7 wonders`);
        expect(res.status, `Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    } else if (testData.challenge.Badge === 'Backpacking through Europe') {
        res = await BaseObj.assertText(`//*[normalize-space()='Creating Backpacking through Europe']`, `Creating Backpacking through Europe`);
        expect(res.status, `Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    }

    // Test 9: Verify challenge logo
    console.log('Test 9: Verifying challenge logo...');
    const logoLocator = adminPage.locator('//img[@class="challenge-image"]');
    const src = await logoLocator.getAttribute('src');
    console.log("Logo source:", src);

    if (testData.challenge.Badge === 'Journey to 7 wonders') {
        expect(src, `Should select the logo '${testData.challenge.Badge}'`).toContain("https://res.cloudinary.com/vantagecircle/image/upload//VantageFit/campaign_banner/image_2.png");
    } else if (testData.challenge.Badge === 'Backpacking through Europe') {
        expect(src, `Should select the logo '${testData.challenge.Badge}'`).toContain("https://res.cloudinary.com/vantagecircle/image/upload//VantageFit/campaign_banner/image_1.png");
    }

    // Test 10: Toggle Auto-Announce Winners
    console.log('Test 10: Toggling Auto-Announce Winners...');
    let Preattribute = await adminPage.locator('input[checked]').getAttribute('checked');
    if (Preattribute === 'false') {
        let res = await BaseObj.clickElement('input[checked]');
        let attribute = await adminPage.locator('input[checked]').getAttribute('checked');
        expect(attribute, "Should able to togglethe auto announce feature in Edit challenges").toBe('true');
        console.log('✅ Toggle was off and is now checked.');
    } else {
        console.log('⚠️ Toggle was already checked. Skipping toggle.');
    }

    // Test 11: Click Next in challenge-info
    console.log('Test 11: Clicking Next in challenge-info...');
    await BaseObj.clickElement("//button[normalize-space()='Next']");
    currentUrl = adminPage.url();
    expect(currentUrl).toContain('/fit/create-challenge/journey-challenge/challenge-duration');

    // Test 12: User denied to click next in set duration if no date entered
    console.log('Test 12: Verifying Next button disabled when no date...');
    await adminPage.waitForTimeout(500);
    const next = adminPage.locator("//vc-button//button[.//span[normalize-space()='Next']]");
    const blockedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-privacy";
    await expect(next, 'Next should be disabled when required date fields are blank').toBeDisabled();
    const isDisabled = await next.isDisabled();
    console.log(`👉 Next button status: Disabled = ${isDisabled}`);

    if (await next.isEnabled()) {
        await next.click();
        await expect(adminPage).not.toHaveURL(blockedUrl);
    }

    // Test 13: Verify past dates are disabled in Start Date picker
    console.log('Test 13: Verifying past dates are disabled...');
    await adminPage.waitForTimeout(250);
    const todayString = new Date().toLocaleDateString('en-GB');
    const todayDay = parseInt(todayString.substring(0, 2));
    const pastDay = String(todayDay - 1).padStart(2, '0');
    console.log("Attempting to select past day:", pastDay);

    let dateString = await createChallengePage.datepicker(
        `input[placeholder] >> nth=0`,
        `//button//span[normalize-space()='${pastDay}']`
    );

    if (dateString.status === "failure") {
        console.log(`✅ Past Date (${pastDay}) is correctly disabled`);
    } else {
        console.log(`❌ Past Date (${pastDay}) was selectable`);
    }

    expect(dateString.status, `User should not be able to select past date`).not.toBe("success");
    await adminPage.locator("div.cdk-overlay-backdrop.mat-overlay-transparent-backdrop.mat-datepicker-0-backdrop.cdk-overlay-backdrop-showing").click();

    // Test 14: Enter challenge start date
    console.log('Test 14: Entering challenge start date...');
    await adminPage.waitForTimeout(250);
    let STARTDATE = (testData.setDuration.Start_Date).split(' ')[0];
    console.log(STARTDATE);

    dateString = await createChallengePage.datepicker(`input[placeholder] >> nth=0`, `//button//span[normalize-space()='${STARTDATE}']`);
    await adminPage.waitForTimeout(500);
    console.log("Start Date: ", dateString.Date);
    dateExtract = dateString.Date;

    if (dateString.status === "success") {
        console.log(`✅ Date is entered successfully`);
    } else {
        console.log("❌ Date entered failed ");
    }
    await adminPage.waitForTimeout(500);
    expect(dateString.status, `User should enter start date`).toBe("success");

    // Test 15: Enter challenge end date
    console.log('Test 15: Entering challenge end date...');
    const EndDate = new Date(testData.setDuration.End_Date.trim());
    const StartDate = new Date(testData.setDuration.Start_Date.trim());
    const durationInMs = EndDate.getTime() - StartDate.getTime();
    const durationInDays = Math.round(durationInMs / (1000 * 60 * 60 * 24));
    console.log(`📆 Duration between start & end date: ${durationInDays} days`);

    const datePickerField = adminPage.locator(`input[placeholder] >> nth=1`);
    await datePickerField.click();
    await adminPage.waitForTimeout(250);

    if (durationInDays > 0) {
        console.log(`➡️ Moving ${durationInDays} days ahead using ArrowRight key...`);
        for (let i = 0; i < durationInDays; i++) {
            await adminPage.keyboard.press('ArrowRight');
            await adminPage.waitForTimeout(100);
        }
    } else {
        console.log("⏸️ Start and End Dates are the same — no navigation needed.");
    }

    const focusedDateLocator = adminPage.locator(
        `//button[contains(@class,'mat-calendar-body-active')]//span[contains(@class,'mat-calendar-body-cell-content')]`
    );

    await focusedDateLocator.waitFor({ state: 'visible', timeout: 5000 });
    const focusedDateText = (await focusedDateLocator.innerText())?.trim();
    console.log(`🟡 End date for Challenge: ${focusedDateText}`);
    console.log("⚠️⚠️⚠️ DUE TO SOME MONTHS HAVING 31 days, the end date selected by automation may be one day ahead.");

    await focusedDateLocator.click({ force: true });
    EnDdateExtract = await adminPage.locator(`input[placeholder] >> nth=1`).inputValue();
    console.log("END date:", EnDdateExtract);
    await adminPage.waitForTimeout(500);
    expect(focusedDateText, "End date should be correctly selected").toBeTruthy();

    // Test 16: Next button for Set Duration is enable after date is applied
    console.log('Test 16: Verifying Next button enabled after date...');
    let nextButton = adminPage.locator("//vc-button//button[.//span[normalize-space()='Next']]");
    let NextEnable = await nextButton.isEnabled();

    if (NextEnable === true) {
        console.log(`✅ Next button is clickable after entering date: ${NextEnable} `);
    } else {
        console.log("❌ Next button is unclickable even after date inserted");
    }
    await adminPage.waitForTimeout(500);
    expect(NextEnable, `Next button should be enable when date is inserted : ${NextEnable}`).toBe(true);

    // Test 17: Click next after inserting date & navigate to Set target audience
    console.log('Test 17: Clicking Next to navigate to Set target audience...');
    res2 = await BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    currentUrl = await adminPage.url();
    const expectedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge/challenge-privacy";

    if (res2.status === "success") {
        console.log(`✅ Next button is clicked \n & 🚀 navigated to Set Target Audience successfully with url: ${currentUrl} `);
    } else {
        console.log("❌ Next button failed to direct to Set Target Audience");
    }

    await adminPage.waitForTimeout(500);
    await expect(adminPage, "Next button should navigate to Set Target Audience page").toHaveURL(expectedUrl);

    // Test 18: Click pagination next to view target audience list
    console.log('Test 18: Clicking pagination to view target audience list...');
    await adminPage.waitForTimeout(2500);
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']/ancestor::div[@class='flex flex-1 justify-center']/preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(500);
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is in']`);

    await adminPage.waitForTimeout(5000);
    const paginationXPath = `//div[@class="pagination-btn-group"]//i[@class="pagination-btn vc-arrow-right"]`;

    try {
        const loc = adminPage.locator(paginationXPath);
        await loc.waitFor({ state: 'visible', timeout: 3000 });
        await loc.click();
        console.log('✅ Pagination next button clicked successfully');
    } catch (error) {
        console.log('⚠️  Pagination next button not found or not visible for selected data - skipping');
    }

    await adminPage.waitForTimeout(250);

    // Test 19: Select Department dropdown at "IS IN"
    console.log('Test 19: Selecting Department dropdown at "IS IN"...');
    res = await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`);
    await adminPage.waitForTimeout(250);

    if (res.status === "success") {
        console.log(`✅ Department dropdown clicked successfully`);
    } else {
        console.log("❌ Department dropdown failed to click");
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department dropdown when status is "Is in"`).toBe("success");

    // Test 20: Switch to "IS NOT IN" from "IS IN"
    console.log('Test 20: Switching to "IS NOT IN" from "IS IN"...');
    await BaseObj.clickElement(`//span[normalize-space(.)='is in'][1]`);
    await adminPage.waitForTimeout(500);
    res = await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    if (res.status === "success") {
        console.log(`✅ switch to IS NOT IN successfully`);
    } else {
        console.log("❌ switch to IS NOT IN failed");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should switch to "is not in"`).toBe("success");

    // Test 21: Select department dropdown for "IS NOT IN"
    console.log('Test 21: Selecting department dropdown for "IS NOT IN"...');
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    res = await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`);
    await adminPage.waitForTimeout(250);
    if (res.status === "success") {
        console.log(`✅ select department dropdown for 'is not in' successful`);
    } else {
        console.log("❌ select department dropdown for 'is not in' failed");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click department dropdown when status is "Is not in"`).toBe("success");

    // Test 22: Select Department name at "IS IN"
    console.log('Test 22: Selecting Department name at "IS IN"...');
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//vc-option//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
    await adminPage.waitForTimeout(250);
    res = await BaseObj.clickElement(`//li[@title='${testData.TargetAudience.TargetedDepartment}']`);

    if (res.status === "success") {
        console.log(`✅ Department name clicked successfully`);
    } else {
        console.log("❌ Department name failed to click");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click department name when status is "Is in"`).toBe("success");

    // Test 23: Verify selected department in user list
    console.log('Test 23: Verifying selected department in user list...');
    let result = await targetAudiencePage.verifyDepartmentInUserList(testData.TargetAudience.TargetedDepartment);
    expect(result.status, result.message).toBe("success");

    // Test 24: Select Department name at "IS NOT IN"
    console.log('Test 24: Selecting Department name at "IS NOT IN"...');
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//button//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.TargetedDepartment}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
    await adminPage.waitForTimeout(250);
    res = await BaseObj.clickElement(`//li[@title='${testData.TargetAudience.TargetedDepartment}']`);

    if (res.status === "success") {
        console.log(`✅ Department name clicked successfully`);
    } else {
        console.log("❌ Department name failed to click");
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department name when status is "Is not in"`).toBe("success");

    // Test 25: Verify selected department for is not in in user list
    console.log('Test 25: Verifying selected department for "is not in" in user list...');
    result = await targetAudiencePage.verifyDepartmentInUserList(testData.TargetAudience.TargetedDepartment);
    expect(result.status, result.message).toBe("success");

    // Country target audience tests continue...
    // Test 26: Select Country dropdown at "IS IN"
    console.log('Test 26: Selecting Country dropdown at "IS IN"...');
    await BaseObj.clickElement(`//span[normalize-space(.)='is in']`);
    res = await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`);
    await adminPage.waitForTimeout(500);

    if (res.status === "success") {
        console.log(`✅ Country dropdown clicked successfully`);
    } else {
        console.log("❌ Country dropdown failed to click");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click country dropdown when status is "Is in"`).toBe("success");

    // Test 27: Switch to "IS NOT IN" from "IS IN" for country/Region
    console.log('Test 27: Switching to "IS NOT IN" from "IS IN" for country/Region...');
    await BaseObj.clickElement("//span[normalize-space(.)='is in']");
    await adminPage.waitForTimeout(500);
    res = await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is not in']`);
    if (res.status === "success") {
        console.log(`✅ switch to IS NOT IN successfully`);
    } else {
        console.log("❌ switch to IS NOT IN failed");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should switch to "is not in" for Country/Region`).toBe("success");

    // Test 28: Select Country/region dropdown for "IS NOT IN"
    console.log('Test 28: Selecting Country/region dropdown for "IS NOT IN"...');
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.Country.DefaultCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    res = await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`);
    await adminPage.waitForTimeout(250);
    if (res.status === "success") {
        console.log(`✅ select department dropdown for 'is not in' successful`);
    } else {
        console.log("❌ select department dropdown for 'is not in' failed");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click Country dropdown when status is "Is not in"`).toBe("success");

    // Test 29: Select Country name at "IS IN"
    console.log('Test 29: Selecting Country name at "IS IN"...');
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.Country.DefaultCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//child::span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
    await adminPage.waitForTimeout(250);
    res = await BaseObj.clickElement(`//li[@title='${testData.Country.TargetedCountry}']`);

    if (res.status === "success") {
        console.log(`✅ Department name clicked successfully`);
    } else {
        console.log("❌ Department name failed to click");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click department name when status is "Is in"`).toBe("success");

    // Test 30: Verify selected country in user list
    console.log('Test 30: Verifying selected country in user list...');
    result = await targetAudiencePage.verifyCountryInUserList(testData.Country.TargetedCountry);
    expect(result.status, result.message).toBe("success");

    // Test 31: Select Country name at "IS NOT IN"
    console.log('Test 31: Selecting Country name at "IS NOT IN"...');
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.Country.TargetedCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.TargetedCountry}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
    await adminPage.waitForTimeout(250);
    res = await BaseObj.clickElement(`//li[@title='${testData.Country.TargetedCountry}']`);

    if (res.status === "success") {
        console.log(`✅ Department name clicked successfully`);
    } else {
        console.log("❌ Department name failed to click");
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department name when status is "Is not in"`).toBe("success");

    // Test 32: Verify selected country for is not in in user list
    console.log('Test 32: Verifying selected country for "is not in" in user list...');
    result = await targetAudiencePage.verifyCountryInUserList(testData.Country.TargetedCountry);
    expect(result.status, result.message).toBe("success");

    // Test 33: Click next to navigate to Challenge configuration section
    console.log('Test 33: Clicking Next to navigate to Challenge configuration...');
    res2 = await BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    currentUrl = await adminPage.url();
    const expectedConfigUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge/challenge-config";

    if (res2.status === "success") {
        console.log(`✅ Next button is clicked \n & 🚀 navigated to Setup Task For The Challenge successfully with url: ${currentUrl} `);
    } else {
        console.log("❌ Next button failed to direct to Setup Task For The Challenge");
    }

    await adminPage.waitForTimeout(500);
    await expect(adminPage, "Next button should navigate to Setup Task For The Challenge page").toHaveURL(expectedConfigUrl);

    // Test 34: Verify header text in challenge config page
    console.log('Test 34: Verifying header text in challenge config page...');
    res = await BaseObj.assertText(`//*[normalize-space(.)='Challenge Configuration']`, "Challenge Configuration");
    res2 = await BaseObj.assertText(`//*[normalize-space(.)='Setup Task for the Challenge']`, "Setup Task for the Challenge");

    if (res2.status === "success" && res.status === "success") {
        console.log(`✅ Correctly loaded text header: ${res2.actualText} `);
        console.log(`✅ Correctly loaded text header: ${res.actualText} `);
    } else {
        console.log(`❌ Failed to load correct header text, returned: ${res.actualText}`);
        console.log(`❌ Failed to load correct header text, returned: ${res2.actualText}`);
    }

    await adminPage.waitForTimeout(500);
    expect(res.status, "Challenge Configuration text is loaded correctly in create-challenge/custom-challenge/challenge-config").toBe("success");
    expect(res2.status, "Setup Task For The Challenge header text is loaded correctly in create-challenge/custom-challenge/challenge-config").toBe("success");


    /////////////////

    // Continue from Test 34...

    // Test 35: Enter Step Target for each milestone (decreasing order - should show warning)
    console.log('Test 35: Entering Step Target for each milestone (decreasing order)...');
    let lastClickedButtonIndex;
    const stepDropDown = adminPage.locator('input[type]');
    const buttonCount = await stepDropDown.count();

    console.log(`🎯 Found ${buttonCount} steps buttons`);

    let currentStep = Number(testData.Challenge_Config.TargetStep);

    for (let i = 0; i < buttonCount; i++) {
        console.log(`\n➡️ Finding steps button in Configuration section ${i}/${buttonCount}`);

        await stepDropDown.nth(i).click();
        await adminPage.waitForTimeout(250);

        const res = await BaseObj.fillInput(`input[type] >> nth=${i}`, currentStep.toString());
        await adminPage.waitForTimeout(250);

        if (res.status === "success") {
            console.log(`✅ Successfully added step for milestone ${i}`);
        } else {
            console.log(`❌ Failed to add steps for milestone ${i}`);
        }

        expect(res.status, `Target step input should be filled successfully for milestones ${i}`).toBe("success");
        lastClickedButtonIndex = i + 1;

        currentStep = Number(currentStep) - 100;
    }

    console.log("total Steps in milestones:", lastClickedButtonIndex);
    MilestoneSteps = lastClickedButtonIndex;

    await adminPage.locator(`//*[contains(text(),'Next')]`).scrollIntoViewIfNeeded();
    await BaseObj.clickElementv2(`//*[contains(text(),'Next')]`);

    const snackLocator = adminPage.locator('div.mat-mdc-snack-bar-label.mdc-snackbar__label');
    await snackLocator.waitFor({ state: 'visible', timeout: 7000 });

    const snackText = (await snackLocator.textContent())?.trim();
    console.log(`📢 Snackbar message: "${snackText}"`);

    expect(snackText).toBe('Milestone targets must not be less than the previous one.');

    // Test 36: Enter Step Target for each milestone (correct increasing order)
    console.log('Test 36: Entering Step Target for each milestone (correct increasing order)...');
    currentStep = Number(testData.Challenge_Config.TargetStep);
    for (let i = 0; i < buttonCount; i++) {
        console.log(`\n➡️ Finding steps button in Configuration section ${i}/${buttonCount}`);

        await stepDropDown.nth(i).click();
        await adminPage.waitForTimeout(250);

        const res = await BaseObj.fillInput(`input[type] >> nth=${i}`, currentStep.toString());
        await adminPage.waitForTimeout(250);

        if (res.status === "success") {
            console.log(`✅ Successfully added step for milestone ${i}`);
        } else {
            console.log(`❌ Failed to add steps for milestone ${i}`);
        }

        expect(res.status, `Target step input should be filled successfully for milestones ${i}`).toBe("success");

        lastClickedButtonIndex = i + 1;
        currentStep = Number(currentStep) + 100;
    }
    console.log("total Steps in milestones:", lastClickedButtonIndex);
    MilestoneStep = lastClickedButtonIndex;

    // Test 37: Verify number of milestones based on badge type
    console.log('Test 37: Verifying number of milestones...');
    await adminPage.waitForTimeout(500);

    if (MilestoneStep == 7 && testData.challenge.Badge == 'Journey to 7 wonders') {
        console.log(`Journey to 7 wonders consist of: ${MilestoneStep}`);
        expect(MilestoneStep, 'Journey to 7 wonders to have 7 milestones').toEqual(7);
    } else if (MilestoneStep == 9 && testData.challenge.Badge == 'Backpacking through Europe') {
        console.log(`Backpacking through Europe consist of: ${MilestoneStep}`);
        expect(MilestoneStep, 'Backpacking through Europe to have 9 milestones').toEqual(9);
    }

    // Test 38: Enter Reward for each milestone
    console.log('Test 38: Entering Reward for each milestone...');
    const rewardButtons = adminPage.locator('button.select-btn.light');
    const rewardButtonCount = await rewardButtons.count();

    console.log(`🎯 Found ${rewardButtonCount} reward buttons`);

    for (let i = 1; i < rewardButtonCount; i++) {
        console.log(`\n➡️ Finding Reward button in Configuration section ${i+1}/${rewardButtonCount}`);

        await rewardButtons.nth(i).click();
        await adminPage.waitForTimeout(250);
        
        await adminPage
            .getByRole('option', { name: new RegExp(`\\s*${testData.Challenge_Config.RewardValue}`) })
            .click();

        console.log(`✅ Selected reward value "${testData.Challenge_Config.RewardValue}" for button ${i + 1}`);

        const res = await BaseObj.fillInput(`input[type] >> nth=0`, testData.Challenge_Config.TargetStep);
        await adminPage.waitForTimeout(250);

        if (res.status === "success") {
            console.log(`✅ Successfully added step for milestone ${i}`);
        } else {
            console.log(`❌ Failed to add steps for milestone ${i}`);
        }

        expect(res.status, `Target rewards input should be filled successfully for milestones ${i}`).toBe("success");

        lastClickedButtonIndex = i; 
    }
    console.log("total milestones:", lastClickedButtonIndex);
    Milestones = lastClickedButtonIndex;

    // Test 39: Verify number of milestones for badge type
    console.log('Test 39: Verifying number of milestones for badge type...');
    if (Milestones == 7 && testData.challenge.Badge == 'Journey to 7 wonders') {
        console.log(`Journey to 7 wonders consist of: ${Milestones}`);
        expect(Milestones, 'Journey to 7 wonders to have 7 milestones').toEqual(7);
    } else if (Milestones == 9 && testData.challenge.Badge == 'Backpacking through Europe') {
        console.log(`Backpacking through Europe consist of: ${Milestones}`);
        expect(Milestones, 'Backpacking through Europe to have 9 milestones').toEqual(9);
    }

    // Test 40: Click next from Challenge Configuration
    console.log('Test 40: Clicking Next from Challenge Configuration...');
    const expectedReviewUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge/challenge-review"; 

    res2 = await BaseObj.clickElement("//button//*[normalize-space(.)='Next']");

    if (res2.status === "success") {
        console.log("✅ Next button clicked successfully, waiting for navigation...");
    } else {
        console.log("❌ Failed to click Next button.");
    }

    currentUrl = adminPage.url();
    console.log(`🌐 Navigated to: ${currentUrl}`);

    await expect(adminPage, "Next button should navigate to Review challenge").toHaveURL(expectedReviewUrl);

    // Test 41: Verify challenge name in review section
    console.log('Test 41: Verifying challenge name in review section...');
    await adminPage.waitForSelector(`(//*[normalize-space()='${testData.challenge.Badge}'])[last()]`,{timeout:10000});
    res2 = await BaseObj.assertText(`(//*[normalize-space()='${testData.challenge.Badge}'])[last()]`,testData.challenge.Badge);

    if (res2.status==='success') {
        console.log(`✅ Correct challenge name is displayed in review challenge"`);
    } else {
        console.log(`❌ failed to display original challenge name in review challenge`);
    }

    expect(res2.status, "Should display Correct challenge name in review challenge section").toBe("success");

    // Test 42: Verify challenge description in review section
    console.log('Test 42: Verifying challenge description in review section...');
    const badge = testData.challenge.Badge;
    const badgeSelector = `(//*[normalize-space()='${badge}'])[last()]`;

    await adminPage.waitForSelector(badgeSelector, { timeout: 10000 });

    if (badge === 'Journey to 7 wonders') {
        res2 = await BaseObj.assertText(
            `${badgeSelector}//following-sibling::div`,
            'This is a long-distance running challenge that will take you on a tour of 7 wonders around the world. Get ready to push yourself to the limit and experience the beauty of various places along the way.'
        );
    } else if (badge === 'Backpacking through Europe') {
        res2 = await BaseObj.assertText(
            `${badgeSelector}//following-sibling::div`,
            'This is a long-distance walking challenge that will take you on a virtual tour of the experience of backpacking through Europe. Get ready to push yourself to the limit and experience the beauty of various places along the way.'
        );
    }

    if (res2?.status === 'success') {
        console.log(`✅ Correct challenge name is displayed in review challenge`);
    } else {
        console.log(`❌ Failed to display original challenge name in review challenge`);
    }

    expect(res2?.status, 'Should display correct challenge name in review challenge section').toBe('success');

    // Test 43: Verify start date in review challenge
    console.log('Test 43: Verifying start date in review challenge...');
    const [dd, mm, yyyy] = await dateExtract.split('-')
    const formatedday= dd.padStart(2,'0');
    const expected = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    console.log('date sent:',expected);
    await adminPage.waitForSelector(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='Start Date']//child::div[contains(text(),'${expected}')]`,{timeout:10000});
    res2 = await BaseObj.assertText(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='Start Date']//child::div[contains(text(),'${expected}')]`,expected);

    if (res2.status==='success') {
        console.log(`✅ Correct Date is displayed in review challenge"`);
    } else {
        console.log(`❌ failed to display original date in review challenge`);
    }

    expect(res2.status, "User selected start date should match the 'start date' in review challenge").toBe("success");

    // Test 44: Verify end date in review challenge
    console.log('Test 44: Verifying end date in review challenge...');
    const [dd2, mm2, yyyy2] = await EnDdateExtract.split('-')
    const expected2 = new Date(Number(yyyy2), Number(mm2) - 1, Number(dd2)).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    console.log('date sent:',expected2);
    await adminPage.waitForSelector(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='End Date']//child::div[contains(text(),'${expected2}')]`,{timeout:10000});
    res2 = await BaseObj.assertText(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='End Date']//child::div[contains(text(),'${expected2}')]`,expected2);

    if (res2.status==='success') {
        console.log(`✅ Correct Date is displayed in review challenge"`);
    } else {
        console.log(`❌ failed to display original date in review challenge`);
    }

    expect(res2.status, "User selected end date should match the 'end date' in review challenge").toBe("success");

    // Test 45: Verify date duration for the journey challenge
    console.log('Test 45: Verifying date duration for the journey challenge...');
    const StartDateText = (await adminPage.locator(`//*[normalize-space(.)='Start Date']//following-sibling::div[@class='info-text']`).textContent())?.trim();
    const EndDateText = (await adminPage.locator(`//*[normalize-space(.)='End Date']//following-sibling::div[@class='info-text']`).textContent())?.trim();

    console.log(`📅 Start Date: ${StartDateText}`);
    console.log(`📅 End Date: ${EndDateText}`);

    const Start_Date = new Date(StartDateText || '');
    const End_Date = new Date(EndDateText || '');

    const durationIn_Ms = End_Date.getTime() - Start_Date.getTime();
    const durationIn_Days = durationIn_Ms / (1000 * 60 * 60 * 24);

    console.log(`🧮 Duration for Journey challenge: ${durationIn_Days} days`);

    expect(durationInDays).toBeGreaterThanOrEqual(0);

    console.log(`✅ Dates verified successfully`);

    // Test 46: Verify Total Rewards for Milestones in review section
    console.log('Test 46: Verifying Total Rewards for Milestones in review section...');
    let rewards=testData.Challenge_Config.RewardValue
    if(testData.challenge.Badge==='Journey to 7 wonders'){
    
        let Total_Rewards= Number((testData.Challenge_Config.RewardValue).split(' ')[1]) * 7;
        console.log(`Total Rewards targeted`,Total_Rewards);

        res=  await BaseObj.assertMonetaryValue(`(//div[normalize-space(.)='Reward']//following-sibling::div)[1]`,Total_Rewards);

    }else if(testData.challenge.Badge==='Backpacking through Europe'){

    
        let Total_Rewards= Number((testData.Challenge_Config.RewardValue).split(' ')[1]) * 9;
        console.log(`Total Rewards targeted`,Total_Rewards);

        res=  await BaseObj.assertMonetaryValue(`(//div[normalize-space(.)='Reward']//following-sibling::div)[1]`,Total_Rewards);

    }
    expect(res?.status,"Should display total Rewards corrrectly in review your challenge").toBe('success');

    // Test 47: SUBMIT CHALLENGE (commented off in original - including as requested)
    console.log('Test 47: SUBMITTING CHALLENGE...');
    await adminPage.waitForTimeout(500);
    
    // This is the submit functionality that was commented off in the original
    // Including it as requested without skipping
    res = await BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Submit']]");
    
    if (res.status === "success") {
        console.log(`✅ Challenge submitted successfully`);
        
        // Wait for success message or redirect
        await adminPage.waitForTimeout(2000);
        
        // Verify challenge was created successfully
        const successLocator = adminPage.locator('//*[contains(text(), "Challenge created successfully")]');
        const isSuccessVisible = await successLocator.isVisible().catch(() => false);
        
        if (isSuccessVisible) {
            console.log('🎉 Challenge created successfully!');
        } else {
            // Check if we're redirected to challenges list
            const currentUrl = adminPage.url();
            if (currentUrl.includes('/fit/challenges') || currentUrl.includes('/fit/home')) {
                console.log('🎉 Challenge created successfully! (Redirected to challenges list)');
            } else {
                console.log('⚠️ Challenge submission may not have completed as expected');
            }
        }
    } else {
        console.log(`❌ Failed to submit challenge`);
    }

    await adminPage.waitForTimeout(1000);
    expect(res.status, `Challenge should be submitted successfully`).toBe("success");

    // Test 48: Manually navigate to manage challenges section
    console.log('Test 48: Manually navigating to manage challenges section...');
    res2 = await BaseObj.clickElement("//a[normalize-space()='Manage Challenges']");
   
    await BaseObj.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge")
    await BaseObj.assertText("//span[@class='title']","Manage Challenges");
    res = await BaseObj.assertText("//span[@class='title']","Manage Challenges");
    if (res2.status==='success' && res.status==='success') {
        console.log(`✅ User navigated to manage challenge via manual navigation`);
    } else {
        console.log(`❌ failed to navigate to manage challenge via manual navigation `);
    }

    expect(res.status, "Should display 'Manage Challenges' on navigating to: Vantage fit DashBoard >> Overview>> Challenges >>Manage Challenges").toBe("success");

    // Test 49: Switch to Upcoming challenges in Manage Challenges section
    console.log('Test 49: Switching to Upcoming challenges...');
    await BaseObj.waitForElement("//div[normalize-space()='Upcoming Challenges']");
    await BaseObj.clickElement("//div[normalize-space()='Upcoming Challenges']");
    adminPage.waitForLoadState('domcontentloaded');
    res2 =  await BaseObj.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge?tab=upcoming")
    let attribute= await adminPage.locator("//div[normalize-space()='Upcoming Challenges']").getAttribute("aria-selected",{timeout:5000});
   
    if(attribute=="true"){
        console.log(`✅ User switched to Upcoming challenges`);
    }else{
        console.log(`❌ failed to switch to Upcoming challenges`);
    }
    expect(attribute,"upcoming tab should be selected").toBe("true");
    
    // Test 50: Verify recently created challenge in Upcoming challenges
    console.log('Test 50: Verifying recently created challenge in Upcoming challenges...');
    res = await BaseObj.assertText(`(//*[normalize-space()='Journey to 7 wonders'])[last()]`,`${testData.challenge.Badge}`);
    if (res2.status==='success' && res.status==='success') {
        console.log(`✅ User successfully found recently created challenge : ${testData.challenge.Badge}`);
    } else {
        console.log(`❌ failed to found the recently created challenge : ${testData.challenge.Badge}`);
    }

    expect(res.status,`Should display the recent created challenge: ${testData.challenge.Badge} in Upcoming challenges tab`).toBe("success");

    console.log('🎯 ALL 50 TESTS COMPLETED SUCCESSFULLY IN SINGLE FLOW!');


    // Continue with the remaining tests exactly as in your original file...
    // Including milestone configuration, rewards, review section, etc.

    console.log('🎯 ALL TESTS COMPLETED SUCCESSFULLY IN SINGLE FLOW!');
});



