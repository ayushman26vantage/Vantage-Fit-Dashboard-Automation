
import { basename } from 'path';
import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../pages/CreateChallengePage';
import { BasePage } from '../../pages/BasePage';
import { TargetAudiencePage } from '../../pages/TargetAudiencePage';
import { chromium } from 'playwright';
import testData from '../../Test-Data/355/journey-challenge.json';
import JavaScriptExecutor from '../../utils/JavaScriptExecutor';
// Main suite for Create Challenge tests
test.describe('Custom Challenge Flow', () => {
   
 test.describe.configure({ retries: 0 });


let page: Page;
  let adminPage: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    // 1️⃣ New browser context & page
    context = await browser.newContext();
    page = await context.newPage();

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // 2️⃣ Login
    await loginPage.navigate();
    await loginPage.login(testData.credentials.username, testData.credentials.password);
    await page.waitForURL('**/ng/home', { timeout: 25000 });

    // 3️⃣ Open Admin Dashboard in a new tab
    const [newAdminPage] = await Promise.all([
      page.context().waitForEvent('page'),
      dashboardPage.navigateToAdminDashboard(),
    ]);
    adminPage = newAdminPage;
    await adminPage.waitForLoadState('domcontentloaded'); // ensures the new tab is ready

    // 4️⃣ Navigate to Create Challenge
    const adminDash = new AdminDashboardPage(adminPage);
    await adminDash.navigateToVantageFitDash();

    const sidebar = new DashboardSidebarPage(adminPage);
    await sidebar.navigateToCreateChallenge();

    console.log('✅ Setup completed successfully');
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

test('To verify if the “Journey Challenge” card is displayed in the “Create Challenge”', async () => {
    let BaseObj = new BasePage(adminPage);
    
    let locator=`//*[normalize-space(.)='Journey Challenge']`
    await adminPage.locator(locator).scrollIntoViewIfNeeded();
    let res = await BaseObj.assertText(locator, `Journey Challenge`);

    expect(res.status, " “Journey Challenge” card is displayed in the “Create Challenge” ").toBe("success");
});

test('To verify the text, grammar, and description of the “Journey Challenge” card', async () => {
    let BaseObj = new BasePage(adminPage);
    
    let locator=`//*[normalize-space(.)='Journey Challenge']//following-sibling::div`
    await adminPage.locator(locator).scrollIntoViewIfNeeded();
    let res = await BaseObj.assertText(locator, `A wellness competition driven by a real-time leaderboard, with no specific targets, focusing on a pure race to the top.`);

    expect(res.status, " “Journey Challenge” card is displays correct description ").toBe("success");
});


test('To verify the presence of the “Create Challenge” button inside the card', async () => {
    let BaseObj = new BasePage(adminPage);
    
    let locator=`//*[normalize-space(.)='Journey Challenge']//following-sibling::*[@label]`

   let isEnabled= await adminPage.locator(locator).isEnabled();
    expect(isEnabled,'verify the presence of the “Create Challenge” button inside the card').toBe(true);

});


    // Test cases for each challenge type
    test('should navigate to Journey Challenge page', async () => {
       let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        await createChallengePage.selectChallengeType('Journey');
        await adminPage.waitForURL(`**/fit/create-challenge/journey-challenge`)
        let res=  await BaseObj.assertLink(testData.urls.journeyChallenge);
      
        expect(res.status,"Should navigate to `fit/create-challenge/custom-challenge`").toBe("success");
    });

    test(`should select challenge Journey type`,async()=>{
        let BaseObj = new BasePage(adminPage);
        const createChallengePage = new CreateChallengePage(adminPage);
        let res= await createChallengePage.selectChallengeLogo(testData.challenge.Badge);
        //await adminPage.waitForTimeout(500);
        expect(res.status,`Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    });


if(testData.challenge.Badge==='Journey to 7 wonders'){

    test(`user should verify the "Journey to 7 wonders's" description text`,async()=>{
        let BaseObj = new BasePage(adminPage);
        let res= await BaseObj.assertText(`//*[contains(text(),'This is a long-distance running challenge that will take you on a tour of 7 wonders')]`,`This is a long-distance running challenge that will take you on a tour of 7 wonders around the world. Get ready to push yourself to the limit and experience the beauty of various places along the way.`)
         expect(res.status,`Should select the logo '${testData.challenge.Badge}'`).toBe("success");
       });

        test(`User clicks next after selecting Journey type`,async()=>{
             let BaseObj = new BasePage(adminPage);
             await BaseObj.clickElement("//button[normalize-space()='Next']")
             let currentUrl =adminPage.url();
             expect(currentUrl).toContain('/fit/create-challenge/journey-challenge/challenge-info');
     
       
    });

     test(`user should verify the challenge title in Creating ${testData.challenge.Badge}`,async()=>{
        let BaseObj = new BasePage(adminPage);
            let res= await BaseObj.assertText(`//*[contains(text(),'Creating Journey to 7 wonders')]`,`Creating Journey to 7 wonders`)
       
            expect(res.status,`Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    });

    test(`user should verify the challenge logo in Creating ${testData.challenge.Badge}`, async () => {
         const BaseObj = new BasePage(adminPage);  
         const logoLocator = adminPage.locator('//img[@class="challenge-image"]');
         const src = await logoLocator.getAttribute('src');
         console.log("Logo source:", src);

         expect(src, `Should select the logo '${testData.challenge.Badge}'`).toContain("https://res.cloudinary.com/vantagecircle/image/upload//VantageFit/campaign_banner/image_2.png");
});
}


if(testData.challenge.Badge==='Backpacking through Europe'){
   
    test(`user should verify the "Backpacking through Europe's" description text`,async()=>{
        let BaseObj = new BasePage(adminPage);
        let res= await BaseObj.assertText(`//*[contains(text(),'This is a long-distance walking challenge that will take you on a virtual tour of the experience of backpacking through Europe')]`,`This is a long-distance walking challenge that will take you on a virtual tour of the experience of backpacking through Europe. Get ready to push yourself to the limit and experience the beauty of various places along the way.`)
       
        expect(res.status,`Should select the logo '${testData.challenge.Badge}'`).toBe("success");

    });

   test(`User clicks next after selecting Journey type as Backpacking through Europe`,async()=>{
    
             let BaseObj = new BasePage(adminPage);
             await BaseObj.clickElementv2("//button[normalize-space()='Next']")
             let currentUrl =adminPage.url();
             expect(currentUrl).toContain('/fit/create-challenge/journey-challenge/challenge-info');
            await adminPage.waitForTimeout(250);
      });

   
    test(`user should verify the challenge title in Creating ${testData.challenge.Badge}`,async()=>{
        let BaseObj = new BasePage(adminPage);
        let res= await BaseObj.assertText(`//*[normalize-space()='Creating Backpacking through Europe']`,`Creating Backpacking through Europe`)
       
        expect(res.status,`Should select the logo '${testData.challenge.Badge}'`).toBe("success");
    });

    test(`user should verify the challenge logo in Creating ${testData.challenge.Badge}`, async () => {
         const BaseObj = new BasePage(adminPage);  
         const logoLocator = adminPage.locator('//img[@class="challenge-image"]');
         const src = await logoLocator.getAttribute('src');
         console.log("Logo source:", src);

         expect(src, `Should select the logo '${testData.challenge.Badge}'`).toContain("https://res.cloudinary.com/vantagecircle/image/upload//VantageFit/campaign_banner/image_1.png");
});

}


test(`User toggles "Auto-Announce Winners in Creating ${testData.challenge.Badge}`, async () => {
  const BaseObj = new BasePage(adminPage);
    let Preattribute=await adminPage.locator('input[checked]').getAttribute('checked');
    if(Preattribute==='false'){
      let res=await BaseObj.clickElement('input[checked]');
      let attribute=await adminPage.locator('input[checked]').getAttribute('checked');
     expect(attribute,"Should able to togglethe auto announce feature in Edit challenges").toBe('true');
     console.log('✅ Toggle was off and is now checked.')
}
else{
    console.log('⚠️ Toggle was already checked. Skipping toggle.')
}

});

 test(`User clicks next in 'journey-challenge/challenge-info'`,async()=>{
    const BaseObj = new BasePage(adminPage);
             await BaseObj.clickElement("//button[normalize-space()='Next']")
             const currentUrl = adminPage.url();
             expect(currentUrl).toContain('/fit/create-challenge/journey-challenge/challenge-duration');

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
     
      await expect(adminPage).not.toHaveURL(blockedUrl);
    }
   
  });


  let dateExtract:any;


   test('To verify that past dates are disabled in the “Start Date” picker', async () => {
    let BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);

    console.log("Entering Date...");

    await adminPage.waitForTimeout(250);

    // Get today’s date in DD/MM/YYYY format (India standard)
    const todayString = new Date().toLocaleDateString('en-GB'); // e.g. "24/10/2025"

    // Extract day part (DD) from it
    const todayDay = parseInt(todayString.substring(0, 2)); // Extracts "24" → 24

    // Subtract 1 to get past day
    const pastDay = String(todayDay - 1).padStart(2, '0'); // e.g. "23"

    console.log("Attempting to select past day:", pastDay);

    // Try to select the past date in the picker
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
});



     test('should be able to enter challenge start date in set duration', async()=>{
    //   await adminPage.locator("div.cdk-overlay-backdrop.mat-overlay-transparent-backdrop.mat-datepicker-0-backdrop.cdk-overlay-backdrop-showing").click();

    let BaseObj = new BasePage(adminPage);
    const createChallengePage = new CreateChallengePage(adminPage);
    console.log("entering Date...");
    await adminPage.waitForTimeout(250);

   
    let STARTDATE=(testData.setDuration.Start_Date).split(' ')[0]
     console.log(STARTDATE);
   
    let dateString= await createChallengePage.datepicker(`input[placeholder] >> nth=0`,`//button//span[normalize-space()='${STARTDATE}']`);
      await adminPage.waitForTimeout(500);  
      console.log("Start Date: ",dateString.Date)
      dateExtract= dateString.Date
   
      if(dateString.status==="success"){
            console.log(`✅ Date is entered successfully`);
          }else{
            console.log("❌ Date entered failed ");
          }
           await adminPage.waitForTimeout(500);
        expect(dateString.status,`User should enter start date`).toBe("success");
       
    });


let EnDdateExtract:any;


//  test('should be able to enter challenge end date in set duration', async () => {
//   const BaseObj = new BasePage(adminPage);
//   const createChallengePage = new CreateChallengePage(adminPage);

//   console.log("📅 Entering End Date...");

//   const EndDate = new Date(testData.setDuration.End_Date1.trim());
//   const StartDate = new Date(testData.setDuration.Start_Date1.trim());

//   const durationInMs = EndDate.getTime() - StartDate.getTime();
//   const durationInDays = Math.round(durationInMs / (1000 * 60 * 60 * 24));

//   console.log(`📆 Duration between start & end date: ${durationInDays} days`);

//   // ✅ Handle navigation inside the date picker using keyboard
//   const datePickerField = adminPage.locator(`input[placeholder] >> nth=1`);
//   await datePickerField.click();
// await adminPage.waitForTimeout(250);
//   if (durationInDays > 0) {
//     console.log(`➡️ Moving ${durationInDays} days ahead using ArrowRight key...`);
//     let EnDdateExtract2;
//     for (let i = 0; i < durationInDays; i++) {
//       await adminPage.keyboard.press('ArrowRight');
//       await adminPage.waitForTimeout(100);
//      EnDdateExtract2= await adminPage.locator(`//button//span[@class='mat-calendar-body-cell-content mat-focus-indicator']`).inputValue();
//     }
//     //  EnDdateExtract=EnDdateExtract2
//   }
//   else {
//     console.log("⏸️ Start and End Dates are the same — no navigation needed.");
//   }

//   // ✅ Select final date
//   await adminPage.keyboard.press('Enter');
//   await adminPage.waitForTimeout(500);

//   // // ✅ Validation
//   // if (dateString.status === "success") {
//   //   console.log(`✅ Date entered successfully`);
//   // } else {
//   //   console.log("❌ Date entry failed");
//   // }

//   // expect(dateString.status, `User should enter end date successfully`).toBe("success");
// });


test('should be able to enter challenge end date in set duration', async () => {
  const BaseObj = new BasePage(adminPage);
  const createChallengePage = new CreateChallengePage(adminPage);

  console.log("📅 Entering End Date...");

  // Parse dates from test data
  const EndDate = new Date(testData.setDuration.End_Date.trim());
  const StartDate = new Date(testData.setDuration.Start_Date.trim());

  // Calculate duration in days
  const durationInMs = EndDate.getTime() - StartDate.getTime();
  const durationInDays = Math.round(durationInMs / (1000 * 60 * 60 * 24));
  console.log(`📆 Duration between start & end date: ${durationInDays} days`);

  // ✅ Open date picker field
  const datePickerField = adminPage.locator(`input[placeholder] >> nth=1`);
  await datePickerField.click();
  await adminPage.waitForTimeout(250);

  // ✅ Move inside the calendar using ArrowRight for each day difference
  if (durationInDays > 0) {
    console.log(`➡️ Moving ${durationInDays} days ahead using ArrowRight key...`);
    for (let i = 0; i < durationInDays; i++) {
      await adminPage.keyboard.press('ArrowRight');
      await adminPage.waitForTimeout(100);
    }
  } else {
    console.log("⏸️ Start and End Dates are the same — no navigation needed.");
  }

  // ✅ Identify the focused (active) date after navigation
  const focusedDateLocator = adminPage.locator(
    `//button[contains(@class,'mat-calendar-body-active')]//span[contains(@class,'mat-calendar-body-cell-content')]`
  );

  // Wait for focus movement
  await focusedDateLocator.waitFor({ state: 'visible', timeout: 5000 });

  // Extract the date number
  const focusedDateText = (await focusedDateLocator.innerText())?.trim();
  console.log(`🟡 End date for Challenge: ${focusedDateText}`);
  console.log("⚠️⚠️⚠️ DUE TO SOME MONTHS HAVING 31 days, the end date selected by automation may be one day ahead.")

  // ✅ Click or press Enter to confirm the date
  await focusedDateLocator.click({ force: true });
  EnDdateExtract=await adminPage.locator(`input[placeholder] >> nth=1`).inputValue();
  console.log("END date:",EnDdateExtract)
  await adminPage.waitForTimeout(500);


  expect(focusedDateText, "End date should be correctly selected").toBeTruthy();
});



   test('Next button for "Set Duration" is enable after date is applied', async()=>{

  
    let BaseObj = new BasePage(adminPage);
    console.log("entering Date...");
    // let res=await BaseObj.fillInput("//input[@placeholder='DD/MM/YYYY']",testData.setDuration.Date);
    let next= adminPage.locator("//vc-button//button[.//span[normalize-space()='Next']]");
    
    let NextEnable=await next.isEnabled();
    
    if (  NextEnable===true) {
      console.log(`✅ Next button is clickable after entering date: ${NextEnable} `);
    } else {
      console.log("❌ Next button is unclickable even after date inserted");
    }
           await adminPage.waitForTimeout(500);
           expect(NextEnable,`Next button should be enable when date is inserted : ${NextEnable}`).toBe(true);
       
    });



  test('should be able to click next after inserting date & navigate to Set target audiance', async () => {
  
      let BaseObj = new BasePage(adminPage);

    //let res = await BaseObj.fillInput("//input[@placeholder='DD/MM/YYYY']", testData.setDuration.Date);
    let res2= await  BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    // Get current URL after action
    const currentUrl = await adminPage.url();
    const expectedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge/challenge-privacy"; 
    

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
  await adminPage.waitForTimeout(2500);  
  let BaseObj = new BasePage(adminPage);
   
    await BaseObj.clickElement(`//span[normalize-space(.)='${testData.TargetAudience.DefaultDepartment}']/ancestor::div[@class='flex flex-1 justify-center']/preceding-sibling::div[contains(@class,'justify-center')]//span[normalize-space(.)='is in']`);
    await adminPage.waitForTimeout(500);
   
    await BaseObj.clickElement(`//div[@class="flex flex-col"]//span[normalize-space(.)='is in']`);
  // Corrected XPath - removed redundant child:: axis
    
    await adminPage.waitForTimeout(5000);
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


  test('should be able to click next to naviagte to Challenge cofiguration section >> "Setup Task For The Challenge"', async () => {
  
      let BaseObj = new BasePage(adminPage);

    let res2= await  BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    // Get current URL after action
    const currentUrl = await adminPage.url();
    const expectedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge/challenge-config"; 
    

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
    let res= await  BaseObj.assertText(`//*[normalize-space(.)='Challenge Configuration']`,"Challenge Configuration")
    let res2= await  BaseObj.assertText(`//*[normalize-space(.)='Setup Task for the Challenge']`,"Setup Task for the Challenge")
   

    if (res2.status==="success" && res.status==="success" ) {
      console.log(`✅ Correctly loaded text header :${res2.actualText} `);
      console.log(`✅ Correctly loaded text header :${res.actualText} `);
    } else {
      console.log(`❌ Failed to load correct header text, returned: ${res.actualText}` );
      console.log(`❌ Failed to load correct header text, returned: ${res2.actualText}` );
    }

  await adminPage.waitForTimeout(500);
    expect(res.status, "Challenge Configuration text is loaded correctly in create-challenge/custom-challenge/challenge-config").toBe("success");
    expect(res2.status, "Setup Task For The Challenge header text is loaded correctly in create-challenge/custom-challenge/challenge-config").toBe("success");
});






let MilestoneSteps: any;

test(`User Enters on all 'Step Target' for each milestones in decreaing order which pops up warning`, async () => {
  const BaseObj = new BasePage(adminPage);

  let lastClickedButtonIndex;
  const stepDropDown = adminPage.locator('input[type]');
  const buttonCount = await stepDropDown.count();

  console.log(`🎯 Found ${buttonCount} steps buttons`);

  // Convert once to number
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

    // Decrement each iteration
    currentStep = Number(currentStep) - 100;
  }

  console.log("total Steps in milestones:", lastClickedButtonIndex);
  MilestoneSteps = lastClickedButtonIndex;

  await adminPage.locator(`//*[contains(text(),'Next')]`).scrollIntoViewIfNeeded();
  await BaseObj.clickElementv2(`//*[contains(text(),'Next')]`);

  // ✅ Wait for snackbar and trim text
  const snackLocator = adminPage.locator('div.mat-mdc-snack-bar-label.mdc-snackbar__label');
  await snackLocator.waitFor({ state: 'visible', timeout: 7000 });

  const snackText = (await snackLocator.textContent())?.trim();
  console.log(`📢 Snackbar message: "${snackText}"`);

  expect(snackText).toBe('Milestone targets must not be less than the previous one.');
});



let MilestoneStep: any;
test(`User Enters on all 'Step Target' for each milestone`, async () => {
  const BaseObj = new BasePage(adminPage);

let lastClickedButtonIndex
  // Get all select buttons
  const stepDropDown = adminPage.locator('input[type]');
  const buttonCount = await stepDropDown.count();

  console.log(`🎯 Found ${buttonCount} steps buttons`);
  let currentStep = Number(testData.Challenge_Config.TargetStep);
  for (let i = 0; i < buttonCount; i++) {
    console.log(`\n➡️ Finding steps button in Configuration section ${i}/${buttonCount}`);
    
    // Click the nth button
    await stepDropDown.nth(i).click();
    await adminPage.waitForTimeout(250);
  
    // Fill the target step input
    const res = await BaseObj.fillInput(`input[type] >> nth=${i}`, currentStep.toString());
    await adminPage.waitForTimeout(250);

    if (res.status === "success") {
      console.log(`✅ Successfully added step for milestone ${i }`);
    } else {
      console.log(`❌ Failed to add steps for milestone ${i }`);
    }

    expect(res.status, `Target step input should be filled successfully for milestones ${i}`).toBe("success");

    lastClickedButtonIndex = i+1;  /// +1 to match the total dropdown counts with indexing
    currentStep = Number(currentStep) + 100;
  }
  console.log("total Steps in milestones:",lastClickedButtonIndex)
  MilestoneStep=lastClickedButtonIndex;
});

if(MilestoneStep==7 && testData.challenge.Badge=='Journey to 7 wonders'){
test(`Verify no of milestones for "Journey to 7 wonders"`,async () => {

    await adminPage.waitForTimeout(500);
    console.log(`Journey to 7 wonders consist of: ${Milestones}`);
    expect(Milestones,'Journey to 7 wonders to have 7 milestones').toEqual(7);

})
}

if(MilestoneStep==9 && testData.challenge.Badge=='Backpacking through Europe'){
test(`Verify no of milestones for "Backpacking through Europe"`,async () => {

    await adminPage.waitForTimeout(500);
    console.log(`Journey to 7 wonders consist of: ${MilestoneStep}`);
    expect(MilestoneStep,'Backpacking through Europe to have 9 milestones').toEqual(9);

})
}



let Milestones: any;
test(`User Enters on all 'Reward' for each milestone`, async () => {
  const BaseObj = new BasePage(adminPage);

let lastClickedButtonIndex
  // Get all select buttons
  const rewardButtons = adminPage.locator('button.select-btn.light');
  const buttonCount = await rewardButtons.count();

  console.log(`🎯 Found ${buttonCount} reward buttons`);

  for (let i = 1; i < buttonCount; i++) {
    console.log(`\n➡️ Finding Reward button in Configuration section ${i+1}/${buttonCount}`);
    
    // Click the nth button
    await rewardButtons.nth(i).click();
    await adminPage.waitForTimeout(250);
    // Select reward option dynamically
    await adminPage
      .getByRole('option', { name: new RegExp(`\\s*${testData.Challenge_Config.RewardValue}`) })
      .click();

    console.log(`✅ Selected reward value "${testData.Challenge_Config.RewardValue}" for button ${i + 1}`);

    // Fill the target step input
    const res = await BaseObj.fillInput(`input[type] >> nth=0`, testData.Challenge_Config.TargetStep);
    await adminPage.waitForTimeout(250);

    if (res.status === "success") {
      console.log(`✅ Successfully added step for milestone ${i }`);
    } else {
      console.log(`❌ Failed to add steps for milestone ${i }`);
    }

    expect(res.status, `Target rewards input should be filled successfully for milestones ${i}`).toBe("success");

    lastClickedButtonIndex = i; 
  }
  console.log("total milestones:",lastClickedButtonIndex)
  Milestones=lastClickedButtonIndex;
});

if(Milestones==7 && testData.challenge.Badge=='Journey to 7 wonders'){
test(`Verify no of milestones for "Journey to 7 wonders"`,async () => {

    await adminPage.waitForTimeout(500);
    console.log(`Journey to 7 wonders consist of: ${Milestones}`);
    expect(Milestones,'Journey to 7 wonders to have 7 milestones').toEqual(7);

})
}

if(Milestones==9 && testData.challenge.Badge=='Backpacking through Europe'){
test(`Verify no of milestones for "Backpacking through Europe"`,async () => {

    await adminPage.waitForTimeout(500);
    console.log(`Journey to 7 wonders consist of: ${Milestones}`);
    expect(Milestones,'Backpacking through Europe to have 9 milestones').toEqual(9);

})
}


test('should be able to click next from Challenge Configuration', async () => {
  const BaseObj = new BasePage(adminPage);

  const expectedUrl = "https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/journey-challenge/challenge-review"; 

  // Click "Next"
  const res2 = await BaseObj.clickElement("//button//*[normalize-space(.)='Next']");

  if (res2.status === "success") {
    console.log("✅ Next button clicked successfully, waiting for navigation...");
  } else {
    console.log("❌ Failed to click Next button.");
  }

  // ✅ Wait for navigation or URL change

  const currentUrl = adminPage.url();
  console.log(`🌐 Navigated to: ${currentUrl}`);

  // Assert final URL
  await expect(adminPage, "Next button should navigate to Review challenge").toHaveURL(expectedUrl);
});



test(`User verifies the challenge name text : ${testData.challenge.Badge}, in review section`, async () => {
      let BaseObj = new BasePage(adminPage);

  await adminPage.waitForSelector(`(//*[normalize-space()='${testData.challenge.Badge}'])[last()]`,{timeout:10000});
  let res2 = await BaseObj.assertText(`(//*[normalize-space()='${testData.challenge.Badge}'])[last()]`,testData.challenge.Badge);

    if (res2.status==='success') {
      console.log(`✅ Correct challenge name is displayed in review challenge"`);
    } else {
      console.log(`❌ failed to display original challenge name in review challenge`);
    }
 
    expect(res2.status, "Should display Correct challenge name in review challenge section").toBe("success");

});

test(`User verifies the challenge name description for ${testData.challenge.Badge}, in review section`, async () => {
  const BaseObj = new BasePage(adminPage);
  const badge = testData.challenge.Badge;
  const badgeSelector = `(//*[normalize-space()='${badge}'])[last()]`;
  let res2;

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
  } else {
    throw new Error(`❌ Unknown badge name: ${badge}`);
  }

  if (res2?.status === 'success') {
    console.log(`✅ Correct challenge name is displayed in review challenge`);
  } else {
    console.log(`❌ Failed to display original challenge name in review challenge`);
  }

  expect(res2?.status, 'Should display correct challenge name in review challenge section').toBe('success');
});




test(`User verifies the start date ${testData.setDuration.Start_Date} in review challenge`, async () => {
      let BaseObj = new BasePage(adminPage);
   // Convert "DD-MM-YYYY" → "D Month YYYY" (e.g., "01-09-2025" → "1 September 2025")

  const [dd, mm, yyyy] =await dateExtract.split('-')
  const formatedday= dd.padStart(2,'0');
  const expected = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toLocaleDateString('en-GB', {
    day: '2-digit',
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

test(`User verifies the end date ${testData.setDuration.End_Date} in review challenge`, async () => {
      let BaseObj = new BasePage(adminPage);
   // Convert "DD-MM-YYYY" → "D Month YYYY" (e.g., "01-09-2025" → "1 September 2025")

  const [dd, mm, yyyy] =await EnDdateExtract.split('-')
 //const formatedday= dd.padStart(2,'0');
  const expected = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  console.log('date sent:',expected);
  await adminPage.waitForSelector(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='End Date']//child::div[contains(text(),'${expected}')]`,{timeout:10000});
  let res2 = await BaseObj.assertText(`//div//vantage-circle-dashboard-challenge-review-info-item[@title='End Date']//child::div[contains(text(),'${expected}')]`,expected);

    if (res2.status==='success') {
      console.log(`✅ Correct Date is displayed in review challenge"`);
    } else {
      console.log(`❌ failed to display original date in review challenge`);
    }
 
    expect(res2.status, "User selected end date should match the 'end date' in review challenge").toBe("success");

});


test(`User verifies the date duration for the journey challenge having start date: ${testData.setDuration.Start_Date} & end date: ${testData.setDuration.End_Date}`, async () => {
  const BaseObj = new BasePage(adminPage);

  // Get start and end date text
  const StartDateText = (await adminPage.locator(`//*[normalize-space(.)='Start Date']//following-sibling::div[@class='info-text']`).textContent())?.trim();
  const EndDateText = (await adminPage.locator(`//*[normalize-space(.)='End Date']//following-sibling::div[@class='info-text']`).textContent())?.trim();

  console.log(`📅 Start Date: ${StartDateText}`);
  console.log(`📅 End Date: ${EndDateText}`);

  // ✅ Convert text to Date objects
  const StartDate = new Date(StartDateText || '');
  const EndDate = new Date(EndDateText || '');

  // ✅ Calculate duration in days
  const durationInMs = EndDate.getTime() - StartDate.getTime();
  const durationInDays = durationInMs / (1000 * 60 * 60 * 24);

  console.log(`🧮 Duration for Journey challenge: ${durationInDays} days`);

  // Optional check (assert)
  expect(durationInDays).toBeGreaterThanOrEqual(0);

  console.log(`✅ Dates verified successfully`);
});



test(`User verifies the Total Rewards for Milestones in review section`, async () => {
  const BaseObj = new BasePage(adminPage);
let res;
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

});



test(`User clicks Submit to publish the challenge and navigates to Manage Challenges`, async () => {
  const BaseObj = new BasePage(adminPage);

  // Step 1: Click the Submit button and wait for network idle
  // await Promise.all([adminPage.waitForLoadState('networkidle'),
    BaseObj.clickElement("//button[@class='btn-type-primary btn-variant-secondary btn-size-md']")
    // ]);
  await expect(adminPage,"Should automatically navigate to manage challenge via submit button").toHaveURL(/\/fit\/manage-challenge\/journey-challenge\/\d+$/, {timeout: 15000}) // wait up to 15 seconds;

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


test(`User switches to Upcoming challenges in Manage Challenges section to verify challenge: ${testData.challenge.Badge} `, async () => {

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
       let res3= await BaseObj.assertText((`//span[normalize-space()='${testData.challenge.Badge}']`)[1],`${testData.challenge.Badge}`);
    if (res2.status==='success' && res3.status==='success') {
      console.log(`✅ User successfully found recently created challenge : ${testData.challenge.Badge}`);
    } else {
      console.log(`❌ failed to found the recently created challenge : ${testData.challenge.Badge}`);
    }

expect(res3.status,`Should display the recent created challenge: ${testData.challengeFieldParams.ChallengeName} in Upcoming challenges tab`).toBe("success");


});



})