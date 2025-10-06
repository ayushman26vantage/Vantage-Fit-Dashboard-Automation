import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../pages/CreateChallengePage';
import { BasePage } from '../../pages/BasePage';
import { TargetAudiencePage } from '../../pages/TargetAudiencePage';
import { chromium } from 'playwright';
import testData from '../../Test-Data/355/custom-challenge.json';
import { basename } from 'path';

// Main suite for Create Challenge tests
test.describe('Custom Challenge Coverage ~(Set Target Audience)', () => {
  test.describe.configure({ retries: 0 });

  let adminPage: Page;
  let customContext: BrowserContext;

  const toBool = (v?: string) =>
    typeof v === 'string' && ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());

  test.beforeAll(async ({ browser }) => {
    // Decide mode once
    const isHeadless = toBool(process.env.CI) || toBool(process.env.HEADLESS);

    // If you specifically run Chromium and want maximize/fullscreen reliably:
    const isChromium = browser.browserType().name() === 'chromium';

    // Launch options for local headed runs (maximize/fullscreen)
    // NOTE: In CI/headless we do NOT pass these; we use a fixed viewport instead.
    let launchArgs: string[] = [];
    if (!isHeadless && isChromium) {
      // Choose ONE: maximize window or F11-like fullscreen
      launchArgs = ['--start-maximized'];
      // Or:
      // launchArgs = ['--start-fullscreen'];
    }

    // If you need full control over args, re-launch Chromium yourself:
    const launched =
      !isHeadless && isChromium
        ? await chromium.launch({ headless: false, args: launchArgs })
        : browser;

    // Context creation
    // - Headless/CI: fixed viewport
    // - Local headed: use OS window size by disabling default viewport
    customContext = await launched.newContext(
      isHeadless
        ? { viewport: { width: 1920, height: 1080 } }
        : { viewport: null } // critical for maximize/fullscreen to take effect
    );

    const page = await customContext.newPage();

    if (isHeadless) {
      console.log('🤖 Headless/CI: viewport = 1920x1080');
    } else if (isChromium && launchArgs.includes('--start-maximized')) {
      console.log('🖥️ Local headed: OS window maximized (viewport: null)');
    } else if (isChromium && launchArgs.includes('--start-fullscreen')) {
      console.log('🖥️ Local headed: OS window started in fullscreen (viewport: null)');
    } else {
      console.log('🖥️ Local headed: default window (viewport: null)');
    }

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // 1) Login and navigate to home
    await loginPage.navigate();
    await loginPage.login(testData.credentials.username, testData.credentials.password);
    await page.waitForURL('**/ng/home', { timeout: 15_000 });

    // 2) Open Admin Dashboard in a new tab
    const [newAdminPage] = await Promise.all([
      customContext.waitForEvent('page'),
      dashboardPage.navigateToAdminDashboard(),
    ]);
    adminPage = newAdminPage;


    const newAdminDashboardPage = new AdminDashboardPage(adminPage);
    await newAdminDashboardPage.navigateToVantageFitDash();

    const newSidebar = new DashboardSidebarPage(adminPage);
    await newSidebar.navigateToCreateChallenge();

    const BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);

    // ---- Pre–target-audience flow (runs as setup, not a test) ----

    // Navigate to Custom Challenge page
    {
      await createChallengePage.selectChallengeType('Custom');
      await adminPage.waitForTimeout(1000);

      const res = await BaseObj.assertLink(testData.urls.customChallenge);
      if (res.status !== 'success') {
        throw new Error('Failed to navigate to `fit/create-challenge/custom-challenge`');
      }
    }

    // Select challenge logo
    {
      const res = await createChallengePage.selectChallengeLogo(testData.challenge.logo);
      await adminPage.waitForTimeout(500);
      if (res.status !== 'success') {
        throw new Error(`Failed to select the logo '${testData.challenge.logo}'`);
      }
    }

    // Fill mandatory Challenge Name (*) and continue (only if provided)
    if (testData.challengeFieldParams.ChallengeName) {
      await adminPage.waitForTimeout(500);

      const res = await BaseObj.fillInput(
        "//vc-input-field//div//input",
        testData.challengeFieldParams.ChallengeName
      );
      await adminPage.waitForTimeout(500);

      const res2 = await BaseObj.clickElement(
        "//button[@class='btn-type-primary btn-variant-secondary btn-size-md']"
      );

      if (res.status !== 'success' || res2.status !== 'success') {
        throw new Error(
          `Mandatory field/Next failed for '${testData.challengeFieldParams.ChallengeName}'`
        );
      }
    }

    // Enter date in Set Duration
    {
      await adminPage.waitForTimeout(500);
      const dateString = await createChallengePage.datepicker(
        `//input[@placeholder='DD/MM/YYYY']`,
        `//button//span[normalize-space()='${testData.setDuration.Date}']`
      );
      await adminPage.waitForTimeout(500);

  //  let  dateExtract = dateString.Date;
      if (dateString.status !== 'success') {
        throw new Error('Failed to enter date in Set Duration');
      }
    }

    // Click Next → navigate to Set Target Audience
    {
      const res2 = await BaseObj.clickElement(
        "//vc-button//button[.//span[normalize-space()='Next']]"
      );
      if (res2.status !== 'success') {
        throw new Error('Next button failed to navigate to Set Target Audience');
      }

      const expectedUrl =
        'https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-privacy';
      await adminPage.waitForTimeout(500);
      const currentUrl = await adminPage.url();
      if (currentUrl !== expectedUrl) {
        throw new Error(
          `Expected Set Target Audience URL: ${expectedUrl}, got: ${currentUrl}`
        );
      }
    }
  });

  test.afterAll(async () => {
    if (customContext) {
      await customContext.close();
    }
  });


 test(`User is able to navigate back to "Set Duration" from target audience`, async () => {
    await adminPage.waitForTimeout(250);
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//button//*[normalize-space()='Back']`);
    let res=await BaseObj.waitForElement(`//*[normalize-space()='Set Duration']`);
      await adminPage.waitForTimeout(500);
     let res2 = await BaseObj.clickElement(
        "//vc-button//button[.//span[normalize-space()='Next']]"
      );
   if(res.status=== 'success'){
    console.log('User navigated to set duration after clicking back in target audience')
   }else{
    console.log('User failed to navigate to set duration after clicking back in target audience')
   }
    
  
  });



  /// Navigation of target audience list
  test(`User is able to click pagination next to view target audience list`, async () => {
    await adminPage.waitForTimeout(250);
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(
      `//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']/ancestor::div[@class='flex flex-1 justify-center']/preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`
    );
    await adminPage.waitForTimeout(500);

    await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is in']`);

    const paginationXPath = `//div[@class="pagination-btn-group"]//i[@class="pagination-btn vc-arrow-right"]`;

    try {
      adminPage.waitForSelector(paginationXPath,{timeout:5000});
     
      let res=await BaseObj.clickElement(paginationXPath);
      console.log('✅ Pagination next button clicked successfully');
      expect.soft(res.status,'A pagination button found which is clickable').toBe('success');
    } catch (error) {
      console.log('⚠️  Pagination next button not found or not visible for selected data - skipping');
      console.log('This is expected behavior if there are no more pages');
       expect.soft(paginationXPath,"Pagination next button not found or not visible for selected data - skipping").not.toContain(`//div[@class="pagination-btn-group"]//i[@class="pagination-btn vc-arrow-right"]`);
    }
    
    
    await adminPage.waitForTimeout(250);
  });

  
let Count:any
  test(`Verify the no. of count of selected user in target audience table`, async () => {
    let usersCountText=await adminPage.locator(`//div[contains(text(),'Total users selected for this challenge: ')]`).textContent()
   const CountText = usersCountText?.substring(usersCountText.lastIndexOf(':') + 1).trim() ?? '';
   Count = Number(CountText);
   
   const paginationXPath = `//div[@class="pagination-btn-group"]//i[@class="pagination-btn vc-arrow-right"]`;
    let countRowText= await adminPage.locator(`(//div[@class="current-page-rows"]//span)[last()]`).textContent();
    let countRow = Number((countRowText ?? '').trim()); 

   while (Number.isFinite(countRow)  && countRow <Count) {
    try {
      const loc = adminPage.locator(paginationXPath);
      await loc.waitFor({ state: 'visible', timeout: 3000 });
      await loc.click();
      console.log(' Pagination next button clicked successfully');
     
    } catch (error) {
      console.log('⚠️  Pagination next button not found or not visible for selected data - skipping');
      console.log('This is expected behavior if there are no more pages');
      break; // no more pages
    }
      // Re-read the count after paging
    await adminPage.waitForTimeout(100);
    countRowText = await adminPage.locator(`(//div[@class="current-page-rows"]//span)[last()]`).textContent();
    countRow = Number((countRowText ?? '').trim());
    console.log("total user count found until this row :",countRow);
     if(countRow==Count){
          console.log(`✅ No. of user count ${Count} ,matches the no. of users ${countRow} in table`)
          
      }
  }
  expect.soft(countRow,'No. of User Count should match the no. user rows in table').toBeLessThanOrEqual(Count);
 await adminPage.waitForTimeout(250);
  });

 
  test(`should be able to find user via searchbar`, async () => {
    const BaseObj = new BasePage(adminPage);

    let text= await adminPage.locator('(//td[@class="flex flex-row items-center gap-4"]//div)[1]').textContent();
    console.log(text)
    const res = await BaseObj.fillInput(`//vc-input-field[@placeholder='Search user by name']//div[@class='flex flex-col']//input`,text);
    await adminPage.waitForSelector(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${text}']`);
    let textreturn= await adminPage.locator(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${text}']`).textContent();
   
    if(textreturn==text){
    if (res.status === 'success') {
      console.log(`✅ User appears in table when searched via search bar`);
    } else {
      console.log('❌ User failed to appear in table when search via search bar');
    }}
     expect(text,`Should Be able to search user via search bar in table count`).toEqual(textreturn);
    await adminPage.waitForTimeout(250);
   
  });



  test(`should be able to select Departname dropDown at "IS IN" ${testData.TargetAudience.DefaultDepartment}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Department name...');

    const res = await BaseObj.clickElement(
      `//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`
    );
    await adminPage.waitForTimeout(250);

    if (res.status === 'success') {
      console.log(`✅ Department dropdown clicked  successfully`);
    } else {
      console.log('❌ Department dropdown  failed to click');
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department dropdown when status is "Is in" `).toBe('success');
  });

  test(`should be able to switch to "IS NOT IN from "IS IN"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Department name...');

    await BaseObj.clickElement(`//span[normalize-space(.)='is in'][1]`);
    await adminPage.waitForTimeout(500);

    const res = await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    if (res.status === 'success') {
      console.log(`✅ switch to IS NOT IN successfully`);
    } else {
      console.log('❌ switch to IS NOT IN failed');
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should switch to "is not in"`).toBe('success');
  });

  test(`should be able to select departpment dropdown for "IS NOT IN" ${testData.TargetAudience.DefaultDepartment}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Department name...');

    await BaseObj.clickElement(
      `//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`
    );
    await adminPage.waitForTimeout(250);

    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    const res = await BaseObj.clickElement(
      `//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`
    );
    await adminPage.waitForTimeout(250);
    if (res.status === 'success') {
      console.log(`✅ select department dropdown for 'is not in' successfull`);
    } else {
      console.log("❌ select department dropdown for 'is not in' failed");
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department dropdown when status is "Is not in"`).toBe('success');
  });

  test(`should be able to select Department name at "IS IN" ${testData.TargetAudience.DefaultDepartment}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Department name...');

    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//vc-option//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(
      `//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`
    );
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement('//div//vc-checkbox//input[1]');
    await adminPage.waitForTimeout(250);
    const res = await BaseObj.clickElement(
      `//li[@title='${testData.TargetAudience.TargetedDepartment}']`
    );

    if (res.status === 'success') {
      console.log(`✅ Department name clicked  successfully`);
    } else {
      console.log('❌ Department name failed to click');
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department name when status is "Is in" `).toBe('success');
  });

  test(`Selected department - ${testData.TargetAudience.TargetedDepartment} should be visible in user selected list w.r.t relevant users`, async () => {
    const targetAudiencePage = new TargetAudiencePage(adminPage);
    const result = await targetAudiencePage.verifyDepartmentInUserList(
      testData.TargetAudience.TargetedDepartment
    );

    expect(result.status, result.message).toBe('success');
  });

  test(`should be able to select Department name at "IS NOT IN" ${testData.TargetAudience.DefaultDepartment}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Department name...');
    await adminPage.waitForTimeout(250);

    await BaseObj.clickElement(`//button//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(
      `//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.TargetedDepartment}']`
    );
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement('//div//vc-checkbox//input[1]');
    await adminPage.waitForTimeout(250);
    const res = await BaseObj.clickElement(
      `//li[@title='${testData.TargetAudience.TargetedDepartment}']`
    );

    if (res.status === 'success') {
      console.log(`✅ Department name clicked  successfully`);
    } else {
      console.log('❌ Department name failed to click');
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click department name when status is "Is not in" `).toBe('success');
  });

  test(`Selected department - ${testData.TargetAudience.TargetedDepartment} for is not in should be visible in user selected list w.r.t relevant users`, async () => {
    const targetAudiencePage = new TargetAudiencePage(adminPage);
    const result = await targetAudiencePage.verifyDepartmentInUserList(
      testData.TargetAudience.TargetedDepartment
    );

    expect(result.status, result.message).toBe('success');
  });

  // -------- Country target audience --------

  test(`should be able to select Country dropdown at "IS IN" ${testData.Country.DefaultCountry}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    await BaseObj.clickElement(`//span[normalize-space(.)='is in']`);
    const res = await BaseObj.clickElement(
      `//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`
    );
    await adminPage.waitForTimeout(500);

    if (res.status === 'success') {
      console.log(`✅ Country dropdown clicked  successfully`);
    } else {
      console.log('❌ Country dropdown  failed to click');
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click country dropdown when status is "Is in" `).toBe('success');
  });

  test(`should be able to switch to "IS NOT IN from "IS IN" for country/Region`, async () => {
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(500);

    const res = await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is not in']`);
    if (res.status === 'success') {
      console.log(`✅ switch to IS NOT IN successfully`);
    } else {
      console.log('❌ switch to IS NOT IN failed');
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should switch to "is not in" for Country/Region`).toBe('success');
  });

  test(`should be able to select Country/region dropdown for "IS NOT IN" ${testData.Country.DefaultCountry}"`, async () => {
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(
      `//span[normalize-space(.)='${testData.Country.DefaultCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`
    );

    await adminPage.waitForTimeout(250);
    const res = await BaseObj.clickElement(
      `//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`
    );
    await adminPage.waitForTimeout(250);
    if (res.status === 'success') {
      console.log(`✅ select country dropdown for 'is not in' successfull`);
    } else {
      console.log("❌ select country dropdown for 'is not in' failed");
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click Country dropdown when status is "Is not in"`).toBe('success');
  });

  test(`should be able to select Country name at "IS IN" ${testData.Country.DefaultCountry}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Country name...');

    await BaseObj.clickElement(
      `//span[normalize-space(.)='${testData.Country.DefaultCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`
    );
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//child::span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(
      `//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`
    );
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement('//div//vc-checkbox//input[1]');
    await adminPage.waitForTimeout(250);
    const res = await BaseObj.clickElement(`//li[@title='${testData.Country.TargetedCountry}']`);

    if (res.status === 'success') {
      console.log(`✅ Country name clicked  successfully`);
    } else {
      console.log('❌ Country name failed to click');
    }
    await adminPage.waitForTimeout(500);
    expect(res.status, `User should click country name when status is "Is in" `).toBe('success');
  });

  test(`Selected country - ${testData.Country.TargetedCountry} should be visible in user selected list w.r.t relevant users`, async () => {
    const targetAudiencePage = new TargetAudiencePage(adminPage);
    const result = await targetAudiencePage.verifyCountryInUserList(testData.Country.TargetedCountry);

    expect(result.status, result.message).toBe('success');
  });

  test(`should be able to select Country name at "IS NOT IN" ${testData.Country.TargetedCountry}"`, async () => {
    const BaseObj = new BasePage(adminPage);
    console.log('selecting Country name...');
    await adminPage.waitForTimeout(250);

    await BaseObj.clickElement(
      `//span[normalize-space(.)='${testData.Country.TargetedCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`
    );
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(
      `//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.TargetedCountry}']`
    );
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement('//div//vc-checkbox//input[1]');
    await adminPage.waitForTimeout(250);
    const res = await BaseObj.clickElement(`//li[@title='${testData.Country.TargetedCountry}']`);

    if (res.status === 'success') {
      console.log(`✅ Country name clicked  successfully`);
    } else {
      console.log('❌ Country name failed to click');
    }
    await adminPage.waitForTimeout(250);
    expect(res.status, `User should click country name when status is "Is not in" `).toBe('success');
  });

  test(`Selected country - ${testData.Country.TargetedCountry} for 'is not in' should be visible in user selected list w.r.t relevant users`, async () => {
    const targetAudiencePage = new TargetAudiencePage(adminPage);
    const result = await targetAudiencePage.verifyCountryInUserList(testData.Country.TargetedCountry);

    expect(result.status, result.message).toBe('success');
  });


 test(`user should click on bulk upload icon`, async () => {
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//i[@class="vc-upload"]`);

    await adminPage.waitForSelector(`//span[@class='title']`,{timeout:2000});
    let res2= await BaseObj.assertText(`//span[@class='title']`,"Bulk Invite Users")
   
 
    if (res2?.status === 'success') {
      console.log(`✅ User appears in table when searched via search bar`);
    } else {
      console.log('❌ User failed to appear in table when search via search bar');
    }
     expect(res2.status,`Should Pop up to Bulk Invite userafter clicking bulk upload icon`).toBe("success");
    await adminPage.waitForTimeout(250);
   
  });

   test(`user is able to close bulk icon pop up by clicking close icon`, async () => {
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`(//*[name()='svg'][contains(@class,'cursor-pointer')][contains(@class,'absolute')])[last()]`);

    await adminPage.waitForSelector(`//span[@class='title']`,{timeout:2000});
    let res2= await BaseObj.assertText(`//div[@class='heading']`,"Set Target Audience")
   
 
    if (res2?.status === 'success') {
      console.log(`✅ User closes the pop up bulk invite user`);
    } else {
      console.log('❌ User failed to closes the pop up bulk invite user');
    }
     expect(res2.status,`Should close Pop up Bulk Invite user after clicking close icon`).toBe("success");
    await adminPage.waitForTimeout(250);
   
  });

   test(`user should upload empty CSV files`, async () => {
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//i[@class="vc-upload"]`);
    await adminPage.waitForSelector(`//span[@class='title']`,{timeout:2000});
   let res2= await BaseObj.assertText(`//span[@class='title']`,"Bulk Invite Users")
    let res3= await BaseObj.fileUpload(`//button[@class='btn-type-primary btn-variant-default btn-size-sm']`,"/Users/ayushmanchaudhury/Documents/Vantage-Fit-Dashboard-Automation/Test-Data/numbers.csv");

    
   let emptypop=  BaseObj.waitForElement(`//div[normalize-space()='Please import a valid format .csv file.']`);
   
 
    if (res2?.status === 'success' && res3?.status==='success' && (await emptypop).status==='success') {
      console.log(`✅ User uploaded empty csv & popup warning displayed succesfully`);
    } else {
      console.log('❌ User uploaded empty csv & popup warning displayed failed');
    }
     expect((await emptypop).status,'Should Pop up "Please import a valid format .csv file." for empty csv').toEqual('success');
    await adminPage.waitForTimeout(250);
   
  });

   test(`user should upload invalid CSV files with missing coloumns`, async () => {
    const BaseObj = new BasePage(adminPage);

    let res3= await BaseObj.fileUpload(`//button[@class='btn-type-primary btn-variant-default btn-size-sm']`,"/Users/ayushmanchaudhury/Documents/Vantage-Fit-Dashboard-Automation/Test-Data/InvalidFormatBulk.csv");
    let emptypop=  BaseObj.waitForElement(`//div[normalize-space()='Please import a valid format .csv file.']`);
   
 
    if (res3?.status==='success' && (await emptypop).status==='success') {
      console.log(`✅ User uploaded empty csv & popup warning displayed succesfully`);
    } else {
      console.log('❌ User uploaded empty csv & popup warning displayed failed');
    }
     expect((await emptypop).status,'Should Pop up "Please import a valid format .csv file." for empty csv').toEqual('success');
    await adminPage.waitForTimeout(250);
   
  });


    test(`user should upload valid CSV file`, async () => {
    const BaseObj = new BasePage(adminPage);

    let res3= await BaseObj.fileUpload(`//button[@class='btn-type-primary btn-variant-default btn-size-sm']`,"/Users/ayushmanchaudhury/Documents/Vantage-Fit-Dashboard-Automation/Test-Data/ValidBulkData.csv");
    
   
   let tablecsv= BaseObj.waitForElement(`//*[contains(@class, 'mt-8')]//table`);

    if (res3?.status==='success' && (await tablecsv).status==='success') {
      console.log(`✅ User uploaded valid csv succesfully`);
    } else {
      console.log('❌ User failed to upload csv file');
    }
     expect((await tablecsv).status,'Should show the table possesing the users in the uploaded csv.').toEqual('success');
    await adminPage.waitForTimeout(250);
   
  });



  test(`user should click add participant after uploading valid csv file`, async () => {
    const BaseObj = new BasePage(adminPage);

    let res3= await BaseObj.clickElement(`//*[contains(text(), 'Add Participants')]`)

    if (res3?.status==='success') {
      console.log(`✅ User has clicked add participants`);
    } else {
      console.log('❌ User failed to click add participants');
    }
     expect(( res3).status,'Should be able to click Add participant button after uploading csv.').toEqual('success');
    await adminPage.waitForTimeout(750);
   
  });


test(`uploaded csv users should be added into user count table`, async () => {
  
  let usersCountText = await adminPage.locator(`//div[contains(text(),'Total users selected for this challenge: ')]`).textContent();

  const CountText = usersCountText?.substring(usersCountText.lastIndexOf(':') + 1).trim() ?? '';
  const Count2 = Number(CountText);

  if (Count !== Count2) {
    console.log("✅ User Count table updated user count after adding via csv:", Count2);
  } else {
    console.log("❌ User Count table failed to update the count after adding new users");
  }

  expect(Count2, 'User count should update after CSV upload w.r.t to target set').not.toEqual(Count);

  await adminPage.waitForTimeout(250);
});


 test(`user should click on Add participant icon in user count table`, async () => {
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//i[@class="vc-add-user"]`);
   

    await adminPage.waitForSelector(`(//*[contains(text(),'Add Participant')])[1]`,{timeout:2000});
    let res2= await BaseObj.assertText(`(//*[contains(text(),'Add Participant')])[1]`,"Add Participant")
   
 
    if (res2?.status === 'success') {
      console.log(`✅ Pop up add participants appeared`);
    } else {
      console.log('❌ failed to Pop up add participants appeared');
    }
     expect(res2.status,`Should Pop up to "+ Add participant" user after clicking bulk upload icon`).toBe("success");
    await adminPage.waitForTimeout(250);
   
  });


  test(`should be able to find user via 1st 3 letters in searchbar to add participant`, async () => {
    const BaseObj = new BasePage(adminPage);

   
    const res = await BaseObj.fillInput(`(//input[contains(@placeholder, 'Search user by name or email')])[2]`,'van');
    // await adminPage.waitForSelector(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${text}']`);
    // let textreturn= await adminPage.locator(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${text}']`).textContent();
   let res2= await BaseObj.waitForElement('(//vantage-circle-dashboard-user-search-list-item//button)[1]');
    // if(textreturn==text){
    if (res2.status === 'success') {
      console.log(`✅ User appears in search list`);
    } else {
      console.log('❌ User failed to appear in search list');
    }
     expect(res2.status,`Searched user add button shouuld be visible in search list`).toBe('success');
   
    await adminPage.waitForTimeout(500);
   
  });

  test(`should be able to find user via searchbar to add participant in popup "+ add participant"`, async () => {
    const BaseObj = new BasePage(adminPage);

   
    const res = await BaseObj.fillInput(`(//input[contains(@placeholder, 'Search user by name or email')])[2]`,testData.TargetAudience.Add_Participant);
    // await adminPage.waitForSelector(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${text}']`);
    // let textreturn= await adminPage.locator(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${text}']`).textContent();
   let res2= await BaseObj.waitForElement(`//*[@class='name'][normalize-space(.)='${testData.TargetAudience.Add_Participant}']//ancestor::vantage-circle-dashboard-user-search-list-item//button//*[normalize-space(.)='Add']`);
    // if(textreturn==text){
   await BaseObj.clickElement(`//*[@class='name'][normalize-space(.)='${testData.TargetAudience.Add_Participant}']//ancestor::vantage-circle-dashboard-user-search-list-item//button//*[normalize-space(.)='Add']`)
//     await BaseObj.clickElement(`(//*[name()='svg'][contains(@class,'cursor-pointer')][contains(@class,'absolute')])[2]`)

//  let text= await adminPage.locator('(//td[@class="flex flex-row items-center gap-4"]//div)[1]').textContent();
//     console.log(text)
//     const res3 = await BaseObj.fillInput(`//vc-input-field[@placeholder='Search user by name']//div[@class='flex flex-col']//input`,testData.TargetAudience.Add_Participant);
//     await adminPage.waitForSelector(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${testData.TargetAudience.Add_Participant}']`);
//     let textreturn= await adminPage.locator(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${testData.TargetAudience.Add_Participant}']`).textContent();
   

//    if (res2.status === 'success' && textreturn===testData.TargetAudience.Add_Participant) {
//       console.log(`✅ User :${testData.TargetAudience.Add_Participant} appears in search list and is clicked`);
//     } else {
//       console.log(`❌ User :${testData.TargetAudience.Add_Participant} failed to appear in search list`);
//     }
//      expect(res2.status,`Searched user :${testData.TargetAudience.Add_Participant} is clicked and added to user count table `).toBe('success');
   
    await adminPage.waitForTimeout(250);
   
  });



   test(`should be able to close  popup "+ add participant"`, async () => {
    const BaseObj = new BasePage(adminPage);

   
   let res= await BaseObj.clickElement(`(//*[name()='svg'][contains(@class,'cursor-pointer')][contains(@class,'absolute')])[2]`)

   if (res.status === 'success') {
      console.log(`✅ User successfully closed add participant pop up`);
    } else {
      console.log(`❌ User failed to closed add participant pop up`);
    }
     expect(res.status,`user should close the "+add participant" pop `).toBe('success');
   
    await adminPage.waitForTimeout(250);
   
  });
////vantage-circle-dashboard-user-search-list-item//button//span[normalize-space(.)='Add']

  test(`verify user added via "+ add participant" is added in User count table`, async () => {
    const BaseObj = new BasePage(adminPage);

   let text= await adminPage.locator('(//td[@class="flex flex-row items-center gap-4"]//div)[1]').textContent();
    console.log(text)
    const res3 = await BaseObj.fillInput(`//vc-input-field[@placeholder='Search user by name']//div[@class='flex flex-col']//input`,testData.TargetAudience.Add_Participant);
    await adminPage.waitForSelector(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${testData.TargetAudience.Add_Participant}']`);
    let textreturn= await adminPage.locator(`//td[@class="flex flex-row items-center gap-4"]//div[normalize-space(.)='${testData.TargetAudience.Add_Participant}']`).textContent();
   

   if (textreturn===testData.TargetAudience.Add_Participant) {
      console.log(`✅ User :${testData.TargetAudience.Add_Participant} appears in user count table`);
    } else {
      console.log(`❌ User :${testData.TargetAudience.Add_Participant} failed to appear in user count table`);
    }
     expect(text,`Added user :${testData.TargetAudience.Add_Participant} should be displayed in user count table row`).toEqual(testData.TargetAudience.Add_Participant);
   
    await adminPage.waitForTimeout(250);
  
   
  });


  test('should be able to click next to naviagte to "Setup Task For The Challenge"', async () => {
    const BaseObj = new BasePage(adminPage);

    const res2 = await BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    const currentUrl = adminPage.url();
    const expectedUrl =
      'https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-config';

    if (res2.status === 'success') {
      console.log(
        `✅ Next button is clicked & 🚀 navigated to Setup Task For The Challenge successfully with url: ${currentUrl} `
      );
    } else {
      console.log('❌ Next button failed to direct to Setup Task For The Challenge');
    }

    await adminPage.waitForTimeout(500);
    await expect(
      adminPage,
      'Next button should navigate to Setup Task For The Challenge page'
    ).toHaveURL(expectedUrl);
  });


  //// Setup Task For The Challenge
  test('User should verify the header text "Setup Task For The Challenge" in challenge config page', async () => {
    const BaseObj = new BasePage(adminPage);
    const res = await BaseObj.assertText(
      `//div[normalize-space(.)='Challenge Configuration']`,
      'Challenge Configuration'
    );
    const res2 = await BaseObj.assertText(
      `//div[normalize-space(.)='Setup Task For The Challenge']`,
      'Setup Task For The Challenge'
    );

    if (res2.status === 'success' && res.status === 'success') {
      console.log(`✅ Correctly loaded text header : ${res2.actualText}`);
      console.log(`✅ Correctly loaded text header : ${res.actualText}`);
    } else {
      console.log(`❌ Failed to load correct header text, returned: ${res2.actualText}`);
    }

    await adminPage.waitForTimeout(500);
    expect(
      res.status,
      'Challenge Configuration text is loaded correctly in create-challenge/custom-challenge/challenge-config'
    ).toBe('success');
    expect(
      res2.status,
      'Setup Task For The Challenge header text is loaded correctly in create-challenge/custom-challenge/challenge-config'
    ).toBe('success');
  });


 test(`User is able to navigate back to "Set Target Audience" from Challenge Configuration`, async () => {
    await adminPage.waitForTimeout(250);
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//button//*[normalize-space()='Back']`);
    let res=await BaseObj.waitForElement(`//*[normalize-space()='Set Target Audience']`);
      await adminPage.waitForTimeout(500);
     let res2 = await BaseObj.clickElement(
        "//vc-button//button[.//span[normalize-space()='Next']]"
      );
   if(res.status=== 'success'){
    console.log('✅ User navigated to set target audience after clicking back in challenge configuration')
   }else{
    console.log('❌ User failed to navigate to set target audience after clicking back in challenge configuration')
   }
     expect(
      res2.status,
      'Setup Task For The Challenge header text is loaded correctly in create-challenge/custom-challenge/challenge-config'
    ).toBe('success');
    
   
  });



});
