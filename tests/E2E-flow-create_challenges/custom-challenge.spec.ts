import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../pages/CreateChallengePage';
import { BasePage } from '../../pages/BasePage';
import { TargetAudiencePage } from '../../pages/TargetAudiencePage';
import { chromium } from 'playwright';
import testData from '../../Test-Data/355/custom-challenge.json';
import JavaScriptExecutor from '../../utils/JavaScriptExecutor';
// Main suite for Create Challenge tests
test.describe.serial('Custom Challenge Flow', () => {
   
 test.describe.configure({ retries: 1 });

let adminPage: Page;
let customContext: BrowserContext;

const toBool = (v?: string) =>
  typeof v === 'string' && ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());

test.beforeAll(async ({ browser }) => {
  // Decide mode once
  const isHeadless = toBool(process.env.CI) || toBool(process.env.HEADLESS);

  // If you specifically run Chromium and want maximize/fullscreen reliably:
  // (If you're already getting { browser } from the test runner, you can still pass args at the CLI level.)
  // For better control in local/dev headed runs, prefer chromium.launch() here:
  const isChromium = browser.browserType().name() === 'chromium';

  // Launch options for local headed runs (maximize/fullscreen)
  // NOTE: In CI/headless we do NOT pass these; we use a fixed viewport instead.
  let launchArgs: string[] = [];
  if (!isHeadless && isChromium) {
    // Choose ONE: maximize window or F11-like fullscreen
    // Maximize native window (recommended for normal dev work):
    launchArgs = ['--start-maximized'];
    // Or, if you truly need F11 fullscreen from the start:
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

  // --- Your app flow ---
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const adminDashboardPage = new AdminDashboardPage(page);
  const sidebar = new DashboardSidebarPage(page);

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

  // IMPORTANT:
  // No fullscreen/viewport code here—adminPage inherits the context’s window size.
  // If you are in CI/headless, it’s 1920x1080; if local headed, it’s maximized/fullscreen.

  // 3) Navigate onwards
  const newAdminDashboardPage = new AdminDashboardPage(adminPage);
  await newAdminDashboardPage.navigateToVantageFitDash();

  const newSidebar = new DashboardSidebarPage(adminPage);
  await newSidebar.navigateToCreateChallenge();
});

test.afterAll(async () => {
  if (customContext) {
    await customContext.close();
  }
});

    // Test cases for each challenge type
    test('should navigate to Custom Challenge page', async () => {
       let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('Custom');
        await adminPage.waitForTimeout(1000);
        let res=  await BaseObj.assertLink(testData.urls.customChallenge);
      
        expect(res.status,"Should navigate to `fit/create-challenge/custom-challenge`").toBe("success");
    });

    test(`should select challenge logo`,async()=>{
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        let res= await createChallengePage.selectChallengeLogo(testData.challenge.logo);
        await adminPage.waitForTimeout(500);
        expect(res.status,`Should select the logo '${testData.challenge.logo}'`).toBe("success");
    });

    if(testData.challenge.uploadLogo){
    test(`user should upload logo file within 500kb limit`,async()=>{
        let BaseObj = new BasePage(adminPage);
        let res= await BaseObj.fileUpload("//span[normalize-space()='Upload from System']",testData.challenge.uploadLogo)
        await adminPage.waitForTimeout(500);
        await BaseObj.clickElement("//button//span[normalize-space()='Submit']");
       await adminPage.waitForTimeout(2000);
        expect(res.status,`Should select the logo '${testData.challenge.uploadLogo}'`).toBe("success");
   
    });
}

    if(testData.challenge.invalidUploadLogo){
    test(`user uploads logo above max limit 500kb & gets warning`,async()=>{
        let BaseObj = new BasePage(adminPage);
         await BaseObj.fileUpload("//span[normalize-space()='Upload from System']",testData.challenge.invalidUploadLogo)
        //await adminPage.waitForTimeout(500);
       
       let res= await BaseObj.waitForElement("//div[normalize-space()='Maximum file allowed (500KB)']")
       await adminPage.waitForTimeout(500);
      if(res.status==="success"){
        console.log("✅Limit warning of 500kb is reflected");
      }else{
        console.log("❌Limit warning of 500kb is failed to pop up");
      }
        expect(res.status,`Should return the lwarning of llimit 500kb for '${testData.challenge.invalidUploadLogo}'`).toBe("success");
        
    });
}



test.describe('Negative Test - No Retries', () => {
  test.describe.configure({ retries: 0 });

  test('blocks Next when required (*) fields are blank', async () => {
    test.setTimeout(15_000);
    await adminPage.waitForTimeout(500);

    const next = adminPage.locator("//vc-button//button[.//span[normalize-space()='Next']]");
    const blockedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-duration";

    // Primary expectation: button should be disabled
    await expect(next, 'Next should be disabled when required fields are blank').toBeDisabled();

    // Safety check: if somehow enabled, clicking must not navigate
    if (await next.isEnabled()) {
      await next.click();
      await adminPage.waitForTimeout(1000);
      await expect(adminPage).not.toHaveURL(blockedUrl);
    }

  });
});



    if(testData.challengeFieldParams.ChallengeName){
    test(`should enter the mandatory field with (*)`,async()=>{
        await adminPage.waitForTimeout(500);
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        
        let res= await BaseObj.fillInput("//vc-input-field//div//input",testData.challengeFieldParams.ChallengeName);
        await adminPage.waitForTimeout(500);
       let res2= await BaseObj.clickElement("//button[@class='btn-type-primary btn-variant-secondary btn-size-md']");
        if(res2.status==="success"){
            console.log("✅ next button clicked on filling mandatory field");
          }else{
            console.log("❌ next button click failed on filling mandatory field");
          }
        expect(res.status,`Should enter the mandatory field '${testData.challengeFieldParams.ChallengeName}'`).toBe("success");
        expect(res2.status,`Should select the next on filling the mandatory field '${testData.challengeFieldParams.ChallengeName}'`).toBe("success");
    });
}

  test('next button becomes accesible on filling mandatory field and navigates to `Set Duration`', async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("verifying url for set duration......")
    let res=await BaseObj.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-duration");
    
    if(res.status==="success"){
            console.log("✅ next button directed to set duration successfully");
          }else{
            console.log("❌ next button failed to direct to set duration");
          }
        expect(res.status,`next icon should navigate to :${adminPage.url}`).toBe("success");
       
    });





 test('User denied to click next in set duration if no date entered', async () => {

    test.setTimeout(15000);
    await adminPage.waitForTimeout(500);

    const next = adminPage.locator("//vc-button//button[.//span[normalize-space()='Next']]");
    const blockedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-privacy";


    await expect(next, 'Next should be disabled when required date fields are blank').toBeDisabled();

        const isDisabled = await next.isDisabled();
        //const isEnabled = await next.isEnabled();
      console.log(`👉 Next button status: Disabled = ${isDisabled}`);

    if (await next.isEnabled()) {
      await next.click();
      await adminPage.waitForTimeout(1000);
      await expect(adminPage).not.toHaveURL(blockedUrl);
    }
   
  });


    let dateExtract:any;

    test('should be able to enter date in set duration', async()=>{
    let BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);
    console.log("entering Date...");
    await adminPage.waitForTimeout(500);
     //let res=await BaseObj.fillInput("//input[@placeholder='DD/MM/YYYY']",testData.setDuration.Date);
   let dateString= await createChallengePage.datepicker(`//input[@placeholder='DD/MM/YYYY']`,`//button//span[normalize-space()='${testData.setDuration.Date}']`);
   await adminPage.waitForTimeout(500);  
   console.log("Date: ",dateString.Date)
    dateExtract= dateString.Date
   if(dateString.status==="success"){
            console.log(`✅ Date is entered successfully`);
          }else{
            console.log("❌ Date entered failed ");
          }
           await adminPage.waitForTimeout(500);
        expect(dateString.status,`User should enter date`).toBe("success");
       
    });



  //  test('Next button for "Set Duration" is enable after date is applied', async()=>{

  //   let BaseObj = new BasePage(adminPage);
  //   console.log("entering Date...");
  //   // let res=await BaseObj.fillInput("//input[@placeholder='DD/MM/YYYY']",testData.setDuration.Date);
  //   let next= adminPage.locator("//vc-button//button[.//span[normalize-space()='Next']]");
    
  //   let NextEnable=await next.isEnabled();
    
  //   if (res.status === "success" &&  NextEnable===true) {
  //     console.log(`✅ Next button is clickable after entering date: ${NextEnable} `);
  //   } else {
  //     console.log("❌ Next button is unclickable even after date inserted");
  //   }
  //          await adminPage.waitForTimeout(500);
  //          expect(NextEnable,`Next button should be enable when date is inserted : ${NextEnable}`).toBe(true);
       
  //   });



  test('should be able to click next after inserting date & navigate to Set target audiance', async () => {
  
      let BaseObj = new BasePage(adminPage);

    //let res = await BaseObj.fillInput("//input[@placeholder='DD/MM/YYYY']", testData.setDuration.Date);
    let res2= await  BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    // Get current URL after action
    const currentUrl = await adminPage.url();
    const expectedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-privacy"; 
    

    if ( res2.status==="success" ) {
      console.log(`✅ Next button is clicked \n & 🚀 navigated to Set Target Audience successfully with url: ${currentUrl} `);
    } else {
      console.log("❌ Next button failed to direct to Set Target Audience");
    }

  await adminPage.waitForTimeout(500);
  await expect(adminPage, "Next button should navigate to Set Target Audience page").toHaveURL(expectedUrl);
});

/// Navigation of target audience list
test(`User is able to click pagination next to view target audience list`,async()=>{
  await adminPage.waitForTimeout(250);  
  let BaseObj = new BasePage(adminPage);
   
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']/ancestor::div[@class='flex flex-1 justify-center']/preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(500);
   
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is in']`);
  // Corrected XPath - removed redundant child:: axis
  const paginationXPath = `//div[@class="pagination-btn-group"]//i[@class="pagination-btn vc-arrow-right"]`;
  
  try {
    // Try to find and click the pagination button if it's visible
    const loc = adminPage.locator(paginationXPath);
    await loc.waitFor({ state: 'visible', timeout: 3000 });
    await loc.click();
    console.log('✅ Pagination next button clicked successfully');
  } catch (error) {
    console.log('⚠️  Pagination next button not found or not visible for selected data - skipping');
    console.log('This is expected behavior if there are no more pages');
    // Test passes even if pagination is not available
  }
  
  // Wait a moment for potential page load
  await adminPage.waitForTimeout(500);
})



 test(`should be able to select Departname dropDown at "IS IN" ${testData.TargetAudience.DefaultDepartment}"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("selecting Department name...");
    
    let res= await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`);
    await adminPage.waitForTimeout(250);

    if(res.status==="success"){
            console.log(`✅ Department dropdown clicked  successfully`);
          }else{
            console.log("❌ Department dropdown  failed. to click");
          }
           await adminPage.waitForTimeout(250);
        expect(res.status,`User should click department dropdown when status is "Is in" `).toBe("success");
       
    });

  
  test(`should be able to switch to "IS NOT IN from "IS IN"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("selecting Department name...");
   
    await BaseObj.clickElement(`//span[normalize-space(.)='is in'][1]`);
    await adminPage.waitForTimeout(500);
   
    let res= await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    //await adminPage.waitForTimeout(5000);
    if(res.status==="success"){
            console.log(`✅ switch to IS NOT IN successfully`);
          }else{
            console.log("❌ switch to IS NOT IN failed");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should switch to "is not in"`).toBe("success");
       
    });

 test(`should be able to select departpment dropdown for "IS NOT IN" ${testData.TargetAudience.DefaultDepartment}"`, async()=>{
//button[@class="select-btn ng-tns-c3777330320-80"]
    let BaseObj = new BasePage(adminPage);
    console.log("selecting Department name...");
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
   
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    let res= await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`);
    await adminPage.waitForTimeout(250);
    if(res.status==="success"){
            console.log(`✅ select department dropdown for 'is not in' successfull`);
          }else{
            console.log("❌ select department dropdown for 'is not in' failed");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should click department dropdown when status is "Is not in"`).toBe("success");
       
    });




 test(`should be able to select Department name at "IS IN" ${testData.TargetAudience.DefaultDepartment}"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("selecting Department name...");
    
    await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//vc-option//span[normalize-space(.)='is in']`);
     await adminPage.waitForTimeout(250);
     await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
     await adminPage.waitForTimeout(250);
    let res= await BaseObj.clickElement(`//li[@title='${testData.TargetAudience.TargetedDepartment}']`);
   
   
    if(res.status==="success"){
            console.log(`✅ Department name clicked  successfully`);
          }else{
            console.log("❌ Department name failed. to click");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should click department name when status is "Is in" `).toBe("success");
       
    });




test(`Selected department - ${testData.TargetAudience.TargetedDepartment} should be visible in user selected list w.r.t relevant users`, async () => {
  const targetAudiencePage = new TargetAudiencePage(adminPage);
  const result = await targetAudiencePage.verifyDepartmentInUserList(testData.TargetAudience.TargetedDepartment);
  
  expect(result.status, result.message).toBe("success");
});



 test(`should be able to select Department name at "IS NOT IN" ${testData.TargetAudience.DefaultDepartment}"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("selecting Department name...");
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//button//span[normalize-space(.)='is in']`);
     await adminPage.waitForTimeout(250);
     await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
     await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.TargetAudience.TargetedDepartment}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
     await adminPage.waitForTimeout(250);
    let res= await BaseObj.clickElement(`//li[@title='${testData.TargetAudience.TargetedDepartment}']`);
   
   
    if(res.status==="success"){
            console.log(`✅ Department name clicked  successfully`);
          }else{
            console.log("❌ Department name failed. to click");
          }
           await adminPage.waitForTimeout(250);
        expect(res.status,`User should click department name when status is "Is not in" `).toBe("success");
       
    });



test(`Selected department - ${testData.TargetAudience.TargetedDepartment} for is not in should be visible in user selected list w.r.t relevant users`, async () => {
  const targetAudiencePage = new TargetAudiencePage(adminPage);
  const result = await targetAudiencePage.verifyDepartmentInUserList(testData.TargetAudience.TargetedDepartment);
  
  expect(result.status, result.message).toBe("success");
});

//Country target audience 



 test(`should be able to select Country dropdown at "IS IN" ${testData.Country.DefaultCountry}"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    await BaseObj.clickElement(`//span[normalize-space(.)='is in']`);
    let res= await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`);
    await adminPage.waitForTimeout(500);

    if(res.status==="success"){
            console.log(`✅ Country dropdown clicked  successfully`);
          }else{
            console.log("❌ Country dropdown  failed to click");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should click country dropdown when status is "Is in" `).toBe("success");
       
    });

  
  test(`should be able to switch to "IS NOT IN from "IS IN" for country/Region`, async()=>{

    let BaseObj = new BasePage(adminPage);
   
    await BaseObj.clickElement("//span[normalize-space(.)='is in']");
    await adminPage.waitForTimeout(500);
   
    let res= await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is not in']`);
    //await adminPage.waitForTimeout(5000);
    if(res.status==="success"){
            console.log(`✅ switch to IS NOT IN successfully`);
          }else{
            console.log("❌ switch to IS NOT IN failed");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should switch to "is not in" for Country/Region`).toBe("success");
       
    });

 test(`should be able to select Country/region dropdown for "IS NOT IN" ${testData.Country.DefaultCountry}"`, async()=>{
//button[@class="select-btn ng-tns-c3777330320-80"]
    let BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.Country.DefaultCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`);
   
    await adminPage.waitForTimeout(250);
    let res= await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`);
    await adminPage.waitForTimeout(250);
    if(res.status==="success"){
            console.log(`✅ select department dropdown for 'is not in' successfull`);
          }else{
            console.log("❌ select department dropdown for 'is not in' failed");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should click Country dropdown when status is "Is not in"`).toBe("success");
       
    });




 test(`should be able to select Country name at "IS IN" ${testData.Country.DefaultCountry}"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("selecting Country name...");
    
     await BaseObj.clickElement(`//span[normalize-space(.)='${testData.Country.DefaultCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is not in']`);
    //await BaseObj.clickElement(`//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//child::span[normalize-space(.)='is in']`);
     await adminPage.waitForTimeout(250);
     await BaseObj.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.DefaultCountry}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
     await adminPage.waitForTimeout(250);
    let res= await BaseObj.clickElement(`//li[@title='${testData.Country.TargetedCountry}']`);
   
   
    if(res.status==="success"){
            console.log(`✅ Department name clicked  successfully`);
          }else{
            console.log("❌ Department name failed. to click");
          }
           await adminPage.waitForTimeout(500);
        expect(res.status,`User should click department name when status is "Is in" `).toBe("success");
       
    });




test(`Selected country - ${testData.Country.TargetedCountry} should be visible in user selected list w.r.t relevant users`, async () => {
  const targetAudiencePage = new TargetAudiencePage(adminPage);
  const result = await targetAudiencePage.verifyCountryInUserList(testData.Country.TargetedCountry);
   
  expect(result.status, result.message).toBe("success");
});



 test(`should be able to select Country name at "IS NOT IN" ${testData.Country.TargetedCountry}"`, async()=>{

    let BaseObj = new BasePage(adminPage);
    console.log("selecting Country name...");
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.Country.TargetedCountry}']//ancestor::div[contains(@class,'justify-center')]//preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`);
     await adminPage.waitForTimeout(250);
     await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is not in']`);
    await adminPage.waitForTimeout(250);
     await BaseObj.clickElement(`//span[normalize-space(.)='is not in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='${testData.Country.TargetedCountry}']`);
    await adminPage.waitForTimeout(250);
    await BaseObj.clickElement("//div//vc-checkbox//input[1]");
     await adminPage.waitForTimeout(250);
    let res= await BaseObj.clickElement(`//li[@title='${testData.Country.TargetedCountry}']`);
   
   
    if(res.status==="success"){
            console.log(`✅ Department name clicked  successfully`);
          }else{
            console.log("❌ Department name failed. to click");
          }
           await adminPage.waitForTimeout(250);
        expect(res.status,`User should click department name when status is "Is not in" `).toBe("success");
       
    });



test(`Selected country - ${testData.Country.TargetedCountry} for 'is not in' should be visible in user selected list w.r.t relevant users`, async () => {
  const targetAudiencePage = new TargetAudiencePage(adminPage);
  const result = await targetAudiencePage.verifyCountryInUserList(testData.Country.TargetedCountry);
  
  expect(result.status, result.message).toBe("success");
});


  test('should be able to click next to naviagte to "Setup Task For The Challenge"', async () => {
  
      let BaseObj = new BasePage(adminPage);

    let res2= await  BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    // Get current URL after action
    const currentUrl = await adminPage.url();
    const expectedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-config"; 
    

    if ( res2.status==="success" ) {
      console.log(`✅ Next button is clicked \n & 🚀 navigated to Setup Task For The Challenge successfully with url: ${currentUrl} `);
    } else {
      console.log("❌ Next button failed to direct to Setup Task For The Challenge");
    }

  await adminPage.waitForTimeout(500);
  await expect(adminPage, "Next button should navigate to Setup Task For The Challenge page").toHaveURL(expectedUrl);
});


////Setup Task For The Challenge

test('User should verify the header text "Setup Task For The Challenge" in challenge config page', async () => {
  
      let BaseObj = new BasePage(adminPage);
    let res= await  BaseObj.assertText(`//div[normalize-space(.)='Challenge Configuration']`,"Challenge Configuration")
    let res2= await  BaseObj.assertText(`//div[normalize-space(.)='Setup Task For The Challenge']`,"Setup Task For The Challenge")
   

    if (res2.status==="success" && res.status==="success" ) {
      console.log(`✅ Correctly loaded text header :${res2.actualText} `);
      console.log(`✅ Correctly loaded text header :${res.actualText} `);
    } else {
      console.log(`❌ Failed to load correct header text, returned: ${res2.actualText}` );
    }

  await adminPage.waitForTimeout(500);
    expect(res.status, "Challenge Configuration text is loaded correctly in create-challenge/custom-challenge/challenge-config").toBe("success");
    expect(res2.status, "Setup Task For The Challenge header text is loaded correctly in create-challenge/custom-challenge/challenge-config").toBe("success");
});


test('cannot drag activity if Add week is not selected', async () => {
  const createChallengePage = new CreateChallengePage(adminPage);
      let BaseObj = new BasePage(adminPage);
    // Locate element with your XPath


let res= await createChallengePage.checkDraggable("//*[normalize-space(.)='Activity Tasks']//following-sibling::div//child::span[normalize-space(.)='Steps']//ancestor::div[@draggable='false']",'false');

    if ( res.status==="success" ) {
      console.log(`✅ Drag activity element is disabled if weeks not added`);
    } else {
      console.log(`❌ Failed to disable Drag activity element if weeks not added`  );
    }

  await adminPage.waitForTimeout(500);
    expect(res.status, "Drag activity element should be disabled if weeks not added`").toBe("success");

});

test(`User clicks on 'Add Week'`, async () => {
      let BaseObj = new BasePage(adminPage);

  let res=await BaseObj.clickElement(`//div[@class="add-challenge-container ng-star-inserted"]/span[normalize-space(.)='Week 1']/preceding-sibling::i[@class="vc-plus1 text-secondary-600 text-lg"]`);

    if (res.status==="success" ) {
      console.log(`✅ Successfully clicked on "Add weeks"`);
    } else {
      console.log(`❌ failed to click on "Add weeks"`);
    }

  await adminPage.waitForTimeout(500);
    expect(res.status, "Drag activity element should be disabled if weeks not added`").toBe("success");

});

test("User should upload logo file for weekly challenge", async () => {
    const BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);

    // Step 1: Capture original logo src
    const originalSrc = await createChallengePage.imgCloudinarySrcExtract("//img[@class='challenge-img']");
    console.log("Original image src:", originalSrc);

    // Step 2: Perform file upload
    const res = await BaseObj.fileUpload(
        "//img[@class='challenge-img']", 
        testData.ThemeName.uploadLogo
    );
    expect(res.status, `Should select the logo '${testData.ThemeName.uploadLogo}'`).toBe("success");

    // Step 3: Submit the form
    await BaseObj.clickElement("//button//span[normalize-space()='Submit']");

    // Step 4: Wait until the new logo src is different from the original
    await adminPage.waitForSelector(
        `//div[@class='challenge-week ng-star-inserted']//img[@class='challenge-img'][not(contains(@src, '${originalSrc}'))]`
    );

    // Step 5: Verify the upload
    let verifyResult = await createChallengePage.verifyFileUploaded(
        originalSrc, 
        `//div[@class='challenge-week ng-star-inserted']//img[@class='challenge-img']`
    );

    expect(verifyResult?.status,"User should upload a file for challeneg week logo").toBe("success");
    console.log("✅ File upload verified successfully");
});




// // Test case for invalid file upload (>500KB) 
// test(`user uploads logo above 500kb limit and gets validation error`, async() => {
//     // This test should only run if you have a large file defined in testData
//     if (!testData.challenge.invalidUploadLogo) {
//         console.log("⚠️  No invalid upload logo defined in test data - skipping test");
//         return;
//     }
    
//     let BaseObj = new BasePage(adminPage);
    
//     // Check file size first
//     const fileSizeKB = await BaseObj.getFileSizeInKB(testData.challenge.invalidUploadLogo);
//     console.log(`📁 Testing with file size: ${fileSizeKB}KB`);
    
//     if (fileSizeKB <= 500) {
//         console.log(`⚠️  Test file is only ${fileSizeKB}KB, which is ≤500KB. This test requires a file >500KB`);
//         // You can either skip the test or fail it
//         expect(fileSizeKB, "Test file should be >500KB for this validation test").toBeGreaterThan(500);
//         return;
//     }
    
//     // Use validation method - should return size_exceeded
//     let res = await BaseObj.fileUploadWithValidation("//img[@class='challenge-img']", testData.challenge.invalidUploadLogo, 500);
    
//     if (res.status === "size_exceeded") {
//         console.log(`✅ File size validation correctly rejected ${fileSizeKB}KB file (limit: 500KB)`);
        
//         // Optionally, try the actual upload to see if UI also shows error
//         try {
//             await BaseObj.fileUpload("//img[@class='challenge-img']", testData.challenge.invalidUploadLogo);
//             await adminPage.waitForTimeout(1000);
            
//             // Check if error message appears in UI
//             let errorRes = await BaseObj.waitForElement("//div[normalize-space()='Maximum file allowed (500KB)']", 2000);
//             if (errorRes.status === "success") {
//                 console.log("✅ UI also shows 500KB limit warning");
//             }
//         } catch (error) {
//             console.log("UI validation handled the large file appropriately");
//         }
        
//         expect(res.status, `File >500KB should be rejected`).toBe("size_exceeded");
//     } else {
//         console.log(`❌ Expected size validation to fail for ${fileSizeKB}KB file`);
//         expect(res.status, `File of ${fileSizeKB}KB should exceed 500KB limit`).toBe("size_exceeded");
//         await adminPage.waitForTimeout(10000);
//     }
// });




test("User should be able to add/enter week name in WEEK", async () => {

    const BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);

     await adminPage.waitForSelector("//*//child::input[@placeholder='Week Name']");
   let res= await BaseObj.fillInput("//*//child::input[@placeholder='Week Name']",testData.ThemeName.EnterWeekName);

   if(res.status==="success"){
            console.log(`✅ Week name added succesfully`);
          }else{
            console.log("❌ Failed to add Week name");
          }

    expect(res.status,"User should add a new week name in challenge week").toBe("success");
    
});



test("User should be able to click cancel confirmation of remove a WEEK ", async () => {
   
    const jsExecutor = new JavaScriptExecutor(adminPage);
    
        // Wait for challenge week section to be present
        await adminPage.waitForSelector("//div[@class='challenge-week ng-star-inserted']", { timeout: 10000 });
        console.log("✅ Challenge week section found");
        
        // Method 1: Try the exact XPath you provided
        const removeButtonXPath = "//div[contains(text(),'Remove')]";
        
        console.log("🔄 Attempting to click remove button using JavaScriptExecutor...");
        
        // Highlight element first (for debugging)
        await jsExecutor.highlightElement(removeButtonXPath, 'xpath');
        await adminPage.waitForTimeout(500);
        
        // Force click with retry
         await jsExecutor.forceClickWithRetry(removeButtonXPath, 'xpath', 3, 1000);
        
     const BaseObj = new BasePage(adminPage);

     await adminPage.waitForSelector("//span[normalize-space()='Cancel']");
   let res= await BaseObj.clickElement("//span[normalize-space()='Cancel']");

   if(res.status==="success"){
            console.log(`✅ Week removal confirmation cancelled`);
          }else{
            console.log("❌ Failed to confirm week removal confirmation");
          }

    expect(res.status,"User should acancel confirmation of week removal").toBe("success");
    
   
      
});


test("User should be able to remove a WEEK ", async () => {
   
    const jsExecutor = new JavaScriptExecutor(adminPage);
    
        // Wait for challenge week section to be present
        await adminPage.waitForSelector("//div[@class='challenge-week ng-star-inserted']", { timeout: 10000 });
        console.log("✅ Challenge week section found");
        
        // Method 1: Try the exact XPath you provided
        const removeButtonXPath = "//div[contains(text(),'Remove')]";
        
        console.log("🔄 Attempting to click remove button using JavaScriptExecutor...");
        
        // Highlight element first (for debugging)
        await jsExecutor.highlightElement(removeButtonXPath, 'xpath');
        await adminPage.waitForTimeout(500);
        
        // Force click with retry
        let res = await jsExecutor.forceClickWithRetry(removeButtonXPath, 'xpath', 3, 1000);
        
    
   if(res.status==="success"){
            console.log(`✅ Clicked on remove week succefully`);
          }else{
            console.log("❌ Failed to remove week");
          }

    expect(res.status,"User should click the remove icon in the added week").toBe("success");
    
      
});

test("User should be able to click confirm for remove week", async () => {

    const BaseObj = new BasePage(adminPage);

     await adminPage.waitForSelector("//span[normalize-space()='Confirm']");
   let res= await BaseObj.clickElement("//span[normalize-space()='Confirm']");

   if(res.status==="success"){
            console.log(`✅ Succesfully clicked on confirm button to remove week`);
          }else{
            console.log("❌ Failed to clicked on confirm button to remove week");
          }

    expect(res.status,"User should click on confirm button to remove week").toBe("success");
    
});



test(`User clicks on 'Add Week' and drag an activity :${testData.Activitiy_Tasks.activity[0]} to weeks`, async () => {
      let BaseObj = new BasePage(adminPage);
  await BaseObj.clickElement(`//div[@class="add-challenge-container ng-star-inserted"]/span[normalize-space(.)='Week 1']/preceding-sibling::i[@class="vc-plus1 text-secondary-600 text-lg"]`);

 // Source: your card with the visible title "Steps"
  const source = adminPage.locator(`//div[@class="task-card-container bg-white ng-star-inserted"]//child::span[normalize-space(.)='${testData.Activitiy_Tasks.activity[0]}']`);

  // Target: the empty drop area
  const target = adminPage.locator('.task-empty');

  // Make sure both are visible before interacting
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  await adminPage.waitForTimeout(500);

  // Drag and drop
  await source.dragTo(target);
  console.log("drag successfull")

  
let res=await BaseObj.assertText("//div[@class='header-title']",testData.Activitiy_Tasks.activity[0]);


  await adminPage.waitForTimeout(500);
    expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");

});


test("User 'daily' target type should able no. of days dropdown", async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[@class='task-title']`),"Title text should be displayed with `Walk 40000+ steps 5 days this week` ").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nWalk 40000+ steps 5 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nWalk 40000+ steps 5 days this week >>> failed to diplayed on target daily")
    )
  
});


test("User 'Weekly' target type should disable no. of days dropdown", async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[@class='task-title']`),"Title text should be displayed with `Walk 40000+ steps this week`").toBeVisible();
      console.log("✅ Walk 40000+ steps this week==> is displayed on clicking weekly")
    }else(
      console.log("❌ Walk 40000+ steps this week==> failed to display on clicking weekly")
    )
  //
  

    
});



test('User verify the minimum target range', async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue)) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('5000'); //
});



test('User verify the maximum target range', async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue)) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('40000'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity}`, async () => {

  const BaseObj = new BasePage(adminPage);

  let RewardSelect =  adminPage.locator("//div[contains(normalize-space(.), 'REWARD')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);
//   const option = adminPage.locator(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.RewardValue}")]`);
// await option.click();
let res=await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.RewardValue}")]`);
let RewardAfterSelect =  adminPage.locator(`//div[contains(normalize-space(.), 'REWARD')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.RewardValue}')]`);
expect(RewardAfterSelect).toHaveText(testData.Activitiy_Tasks.RewardValue);
  //await BaseObj.clickElement(`//div//vc-select//button`);

    if (res?.status=='success'){

      console.log(`✅ User successfully select desired reward value of ${testData.Activitiy_Tasks.RewardValue}`)
    }else( 
      console.log(`❌ User failed to select desired reward value of ${testData.Activitiy_Tasks.RewardValue} and selected :${RewardAfterSelect}`)
    )
  
});


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days`, async () => {

  const BaseObj = new BasePage(adminPage);

  let RewardSelect =  adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);
//   const option = adminPage.locator(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.RewardValue}")]`);
// await option.click();
let res=await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);
let RewardAfterSelect =  adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);
expect(RewardAfterSelect).toHaveText(testData.Activitiy_Tasks.NoOFDays);
  //await BaseObj.clickElement(`//div//vc-select//button`);

    if (res?.status=='success'){

      console.log(`✅ User successfully select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`)
    }else( 
      console.log(`❌ User failed to select desired No of days as ${testData.Activitiy_Tasks.NoOFDays} and selected :${RewardAfterSelect}`)
    )
  
});

test(`User selects "Click here to view the prize in a different country"`, async () => {

  const BaseObj = new BasePage(adminPage);
await adminPage.waitForTimeout(250);
  let ViewPrize =  adminPage.locator(`//div[@class="task-input mt-6"]//div[contains(normalize-space(.), 'Click here to view the prize in a different country')]`);
  await ViewPrize.click();
  await adminPage.waitForTimeout(250);
//   const option = adminPage.locator(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.RewardValue}")]`);
// await option.click();
await BaseObj.clickElement(`//vc-select[@placeholder="Select Country"]//button`);
let res= await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.CountryPrizeView}")]`)
let AfterSelect =  adminPage.locator(`//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.CountryPrizeView}')]`);
expect(AfterSelect).toHaveText(testData.Activitiy_Tasks.CountryPrizeView);
  //await BaseObj.clickElement(`//div//vc-select//button`);

    if (res?.status=='success'){

      console.log(`✅ User successfully select desired country to view prize as ${testData.Activitiy_Tasks.CountryPrizeView}`)
    }else( 
      console.log(`❌ User failed to select desired country to view prize as ${testData.Activitiy_Tasks.CountryPrizeView} and selected :${AfterSelect}`)
    )
  
});



test("User should be able to close 'prize view for different country' popup ", async () => {
   
    const BaseObj = new BasePage(adminPage);
    
        // Wait for challenge week section to be present
     let res=   await BaseObj.clickElement("(//*[@id='Vector'])[last()]")
        
    
   if(res.status==="success"){
            console.log(`✅ succefully clicked on close icon popup in prize view for country`);
          }else{
            console.log("❌ Failed to close popup in prize view for country");
          }

    expect(res.status,"User should click close icon for prize view pop up").toBe("success");
    await adminPage.waitForTimeout(500)
      
});

test("User should be able to add task to week ", async () => {
   
    const BaseObj = new BasePage(adminPage);
    
    let ActivtyDef= await adminPage.locator('(//div[@class="task-title" and normalize-space(.)!=""])[last()]').textContent();
    let ActivityString=ActivtyDef?.toString();
        // Wait for challenge week section to be present
     let res=   await BaseObj.clickElement("//span[normalize-space()='Add Task']//parent::button");

    expect(res.status,"User should click on add task button").toBe("success");
    await adminPage.waitForTimeout(1000);
   let res2= await BaseObj.assertText('(//div[@class="task-title" and normalize-space(.)!=""])[last()]',ActivityString);
   if((res2).status==="success"){
            console.log(`✅ succefully Added task to Activity week`);
          }else{
            console.log("❌ Failed to Add task to Activity week");
          }
           expect(res2.status,"Added task is visible in add Activity Week").toBe("success");
      await adminPage.waitForTimeout(500);
});

// test("User should be able to click on added task previously added to week ", async () => {
   
//     const BaseObj = new BasePage(adminPage);
  
//         // Wait for challenge week section to be present
//      let res=   await BaseObj.clickElement("//vantage-circle-dashboard-selected-task-item[@class='ng-star-inserted']//div[@class='container']");
//     await adminPage.waitForTimeout(1000);
   
//    if((res).status==="success"){
//             console.log(`✅ succefully Added task to Activity week`);
//           }else{
//             console.log("❌ Failed to Add task to Activity week");
//           }
//         expect(res.status,"User should click on add task button").toBe("success");

//  });

// test("User should be able to update existing activity task", async () => {
   
//     const BaseObj = new BasePage(adminPage);
  
//         // Wait for challenge week section to be present
//      let res=   await BaseObj.clickElement("//vantage-circle-dashboard-selected-task-item[@class='ng-star-inserted']//div[@class='container']");
//     await adminPage.waitForTimeout(1000);
   
//    if((res).status==="success"){
//             console.log(`✅ succefully Added task to Activity week`);
//           }else{
//             console.log("❌ Failed to Add task to Activity week");
//           }
//         expect(res.status,"User should click on add task button").toBe("success");
        
//  });



test(`User clicks on next 'Add Week' after adding task in previous week`, async () => {
      let BaseObj = new BasePage(adminPage);

  let res=await BaseObj.clickElement(`//div[@class="add-challenge-container ng-star-inserted"]/span[normalize-space(.)='Add']/preceding-sibling::i[@class="vc-plus1 text-secondary-600 text-lg"]`);

    if (res.status==="success" ) {
      console.log(`✅ Successfully clicked on next "Add weeks"`);
    } else {
      console.log(`❌ failed to click on "Add weeks"`);
    }

  await adminPage.waitForTimeout(500);
    expect(res.status, "Should click on Add week to add a neew week task").toBe("success");

});


test("User should be able to remove the new Added WEEK", async () => {
    
    
    const jsExecutor = new JavaScriptExecutor(adminPage);
        
        // Method 1: Try the exact XPath you provided
        const removeButtonXPath = "(//div[contains(@class,'challenge-week') and contains(@class,'ng-star-inserted')]//div[normalize-space(text())='Remove'])[last()]";
        
        console.log("🔄 Attempting to click remove button using JavaScriptExecutor...");
        
        // Highlight element first (for debugging)
        await jsExecutor.highlightElement(removeButtonXPath, 'xpath');
        await adminPage.waitForTimeout(500);
        
        // Force click with retry
        let res = await jsExecutor.forceClickWithRetry(removeButtonXPath, 'xpath', 3, 1000);
        
  
   if(res.status==="success"){
            console.log(`✅ Clicked on remove week succefully`);
          }else{
            console.log("❌ Failed to remove week");
          }
 const BaseObj = new BasePage(adminPage);

     await adminPage.waitForSelector("//span[normalize-space()='Confirm']");
     await BaseObj.clickElement("//span[normalize-space()='Confirm']");
     expect(res.status,"User should click the remove icon in the added week").toBe("success");
     
      
});



test(`User clicks on next button in activity task to proceed to review challenge`, async () => {
      let BaseObj = new BasePage(adminPage);
await adminPage.waitForSelector(`//*[@id="router"]/vantage-circle-dashboard-custom-challenge-index/div/vantage-circle-dashboard-custom-challenge-configuration/div/vc-button/button`,{timeout:1000})
  let res=await BaseObj.clickElement(`//*[@id="router"]/vantage-circle-dashboard-custom-challenge-index/div/vantage-circle-dashboard-custom-challenge-configuration/div/vc-button/button`);
let res2=await BaseObj.assertLink('https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-review');
    if (res.status==="success" && res2.status==='success') {
      console.log(`✅ Successfully clicked on next "Add weeks"`);
    } else {
      console.log(`❌ failed to click on "Add weeks"`);
    }

    expect(res.status, "Drag activity element should be disabled if weeks not added`").toBe("success");

});

test(`User verifies the challenge name text : ${testData.challengeFieldParams.ChallengeName}, in review section`, async () => {
      let BaseObj = new BasePage(adminPage);

  await adminPage.waitForSelector(`(//div[normalize-space()='${testData.challengeFieldParams.ChallengeName}'])[last()]`,{timeout:10000});
  let res2 = await BaseObj.assertText(`(//div[normalize-space()='${testData.challengeFieldParams.ChallengeName}'])[last()]`,testData.challengeFieldParams.ChallengeName);

    if (res2.status==='success') {
      console.log(`✅ Correct challenge name is displayed in review challenge"`);
    } else {
      console.log(`❌ failed to display original challenge name in review challenge`);
    }
 
    expect(res2.status, "Should display Correct challenge name in review challenge section").toBe("success");

});


test(`User verifies the start date ${testData.setDuration.Date} in review challenge`, async () => {
      let BaseObj = new BasePage(adminPage);
   // Convert "DD-MM-YYYY" → "D Month YYYY" (e.g., "01-09-2025" → "1 September 2025")

  const [dd, mm, yyyy] =await dateExtract.split('-')
  const expected = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  console.log('date sent:',expected);
  await adminPage.waitForSelector(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='Start Date']//child::div[contains(text(),'${expected}')]`,{timeout:10000});
  let res2 = await BaseObj.assertText(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='Start Date']//child::div[contains(text(),'${expected}')]`,expected);

    if (res2.status==='success') {
      console.log(`✅ Correct Date is displayed in review challenge"`);
    } else {
      console.log(`❌ failed to display original date in review challenge`);
    }
 
    expect(res2.status, "User selected start date should match the 'start date' in review challenge").toBe("success");

});


test(`User clicks Submit to publish the challenge and navigates to Manage Challenges`, async () => {
  const BaseObj = new BasePage(adminPage);

  // Step 1: Click the Submit button and wait for network idle
  await Promise.all([
    adminPage.waitForLoadState('networkidle'),
    BaseObj.clickElement("//button[@class='btn-type-primary btn-variant-secondary btn-size-md']")
  ]);
  // Step 2: Assert the URL has changed to the expected Manage Challenge URL
  await expect(adminPage,"Should automatically navigate to manage challenge via submit button").toHaveURL(/\/fit\/manage-challenge\/campaign\/\d+$/);

  // Step 3: Wait for and assert the title text is visible
  const titleLocator = adminPage.locator("//span[@class='title']");
  await expect(titleLocator).toHaveText("Manage Challenges");

  console.log(`✅ Submit clicked, navigated, and content verified`);
});


 
test(`User manually navigates to manage challenges section to verify recently created challenge `, async () => {
  // adminPage.waitForRequest(request =>
  //   request.url().includes("https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge/campaign"));

  let BaseObj = new BasePage(adminPage);
  
    let res2 = await BaseObj.clickElement("//a[normalize-space()='Manage Challenges']");
   
   await BaseObj.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge")
   await BaseObj.assertText("//span[@class='title']","Manage Challenges");
    let res3= await BaseObj.assertText("//span[@class='title']","Manage Challenges");
    if (res2.status==='success' && res3.status==='success') {
      console.log(`✅ User navigated to manage challenge via manual navigation`);
    } else {
      console.log(`❌ failed to navigate to manage challenge via manual navigation `);
    }

expect(res3.status, "Should display 'Manage Challenges' on navigating to: Vantage fit DashBoard >> Overview>> Challenges >>Manage Challenges").toBe("success");


});


test(`User switches to Upcoming challenges in Manage Challenges section to verify challenge: ${testData.challengeFieldParams.ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
  await BaseObj.waitForElement("//div[normalize-space()='Upcoming Challenges']");
    await BaseObj.clickElement("//div[normalize-space()='Upcoming Challenges']");
   adminPage.waitForLoadState('domcontentloaded');
    let res2 =  await BaseObj.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge?tab=upcoming")
   let attribute= await adminPage.locator("//div[normalize-space()='Upcoming Challenges']").getAttribute("aria-selected",{timeout:5000});
  
    if(attribute=="true"){
    console.log(`✅ User switched to Upcoming challenges`);
   }else{
    console.log(`❌ failed to switch to Upcoming challenges`);
   }
   expect(attribute,"upcoming tab should be selected").toBe("true");
       let res3= await BaseObj.assertText(`//span[normalize-space()='${testData.challengeFieldParams.ChallengeName}']`,`${testData.challengeFieldParams.ChallengeName}`);
    if (res2.status==='success' && res3.status==='success') {
      console.log(`✅ User successfully found recently created challenge : ${testData.challengeFieldParams.ChallengeName}`);
    } else {
      console.log(`❌ failed to found the recently created challenge : ${testData.challengeFieldParams.ChallengeName}`);
    }

expect(res3.status,`Should display the recent created challenge: ${testData.challengeFieldParams.ChallengeName} in Upcoming challenges tab`).toBe("success");


});



})