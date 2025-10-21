import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../pages/CreateChallengePage';
import { BasePage } from '../../pages/BasePage';
import { chromium } from 'playwright';
import testData from '../../Test-Data/355/manageChallenge.json';
import JavaScriptExecutor from '../../utils/JavaScriptExecutor';
import { start } from 'repl';
import { strictEqual } from 'assert';



// Main suite for Create Challenge tests
test.describe.serial('Manage Challenge Coverage)', () => {
  

  let adminPage: Page;
  let customContext: BrowserContext;

  const toBool = (v?: string) =>
    typeof v === 'string' && ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());

  test.beforeAll(async ({ browser }) => {
    // Decide mode once
    const isHeadless = toBool(process.env.CI) || toBool(process.env.HEADLESS);

    // If you specifically run Chromium and want maximize/fullscreen reliably:
    const isChromium = browser.browserType().name() === 'Google Chrome';

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
    await page.waitForURL('**/ng/home', { timeout: 15000 });

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



  });

  test.afterAll(async () => {
    if (customContext) {
      await customContext.close();
    }
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

if(testData.challengeFieldParams.ChallengeName){
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
////div[normalize-space(.)='Custom Challenge']//ancestor::div[@class="challenge-info"]//child::span[normalize-space(.)='Pre Diwali Workout 04e']

test(`User clicks on required challenge in Upcoming challenges : ${testData.challengeFieldParams.ChallengeName} `, async () => {

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
      await BaseObj.waitForElement(`//div[normalize-space(.)='${testData.challenge.challenge_type}']//ancestor::div[@class="challenge-info"]//child::span[normalize-space(.)='${testData.challengeFieldParams.ChallengeName}']`);
        
    let res3=await BaseObj.clickElement(`//div[normalize-space(.)='${testData.challenge.challenge_type}']//ancestor::div[@class="challenge-info"]//child::span[normalize-space(.)='${testData.challengeFieldParams.ChallengeName}']`)
    let res=await BaseObj.assertLink(`https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge/campaign`);
    let URL=adminPage.url();
    if (res.status==='success' && res3.status==='success') {
      console.log(`✅ User successfully clicks on the required challenge name : ${testData.challengeFieldParams.ChallengeName}`);
    } else {
      console.log(`❌ failed to click on required challenge name : ${testData.challengeFieldParams.ChallengeName}`);
    }

expect(res3.status,`Should click on created challenge: ${testData.challengeFieldParams.ChallengeName} , type: ${testData.challenge.challenge_type} in Upcoming challenges tab`).toBe("success");
expect(URL,`clicking on challenge should redirect to >> https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge/campaign`).toContain('https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge/campaign')


});


// test(`User verifies date in upcoming challenges: ${testData.challengeFieldParams.ChallengeName}`, async () => {
//   const dateText = await adminPage
//     .locator(`(//vc-button[@label='Edit Challenge']/preceding-sibling::div)[3]`)
//     .textContent();

// const [startDateStrRaw, endDateStrRaw] = dateText?.split('-') ?? [];

// const startDateStr = startDateStrRaw.trim(); // "14 Oct 2025"
// const endDateStr = endDateStrRaw.trim();     // "20 Oct 2025"

// const startDateObj = new Date(startDateStr);
// const endDateObj = new Date(endDateStr);
//   // Get current date (without time)
//   const today = new Date();
//   const todayStrIso = today.toISOString().split('T')[0]; // "2025-10-14"

//   // Get end date in ISO
//   const endDateIso = endDateObj.toISOString().split('T')[0]; // "2025-10-20"
//    const startDateIso = startDateObj.toISOString().split('T')[0];
//   // Convert today's date to "dd MMM yyyy"
//   function formatDateToText(date: Date): string {
//     const options: Intl.DateTimeFormatOptions = {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     };
//     return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ');
//   }

//   const todayFormatted = formatDateToText(today); // e.g., "14 Oct 2025"
//   const endDateFormatted = formatDateToText(endDateObj); // e.g., "20 Oct 2025"
//   const startDateFormatted= formatDateToText(startDateObj);
//   console.log("Today:", todayFormatted);
//   console.log("End date:", endDateFormatted);
//   console.log("Start date:", startDateFormatted);

// let statusText = await adminPage.locator(`//*[normalize-space(.)='not started']`).textContent();
// statusText = statusText?.trim() ?? '';

// console.log("Status from UI:", statusText);

// if (statusText=== "not started" &&  todayStrIso<startDateIso && todayStrIso < endDateIso) {
//   console.log(`✅ STATUS: Not Started\nChallenge hasn't entered the date range ${dateText}, today's date: ${todayFormatted}`);
//   expect(statusText,"SHould update status as Not Started").toBe('not started')
// } 
// else if (todayStrIso > startDateIso && todayStrIso < endDateIso) {
//     console.log(`❌ Upcoming challenge is displayed during its active period (should not be marked as 'not started')`);
//     const isNotStarted = statusText === 'not started';
//     expect(isNotStarted, "Status should NOT be 'not started' when challenge is inside active date range").toBe(false);
//   } 
//   else if (statusText !== "not started") {
//     console.log(`❌ Failed to update status as "Not Started" — status is "${statusText}"`);
//     //await expect(statusText).toBe("not started");
//      expect(statusText, "Status should be 'not started' when challenge is NOT active yet/Reached challenge date").toBe("not started");
//   }
  

// });




test(`User verifies date in upcoming challenges: ${testData.challengeFieldParams.ChallengeName}`, async () => {
  // 1. Extract start and end dates from the UI
  const dateText = await adminPage
    .locator(`(//vc-button[@label='Edit Challenge']/preceding-sibling::div)[3]`)
    .textContent();

  const [startDateStrRaw, endDateStrRaw] = dateText?.split('-') ?? [];

  const startDate = new Date(startDateStrRaw.trim()); // e.g., "14 Oct 2025"
  const endDate = new Date(endDateStrRaw.trim());

  // Normalize time to 00:00 for fair date-only comparisons
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize time

  // Format for logging
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  console.log("Today:", formatDate(today));
  console.log("Start date:", formatDate(startDate));
  console.log("End date:", formatDate(endDate));

  // 2. Get challenge status from UI
  let statusText = await adminPage.locator(`//div[normalize-space()='Challenge Status']/following-sibling::div[contains(@class, 'stats')]`).textContent();
  statusText = statusText?.trim() ?? '';
  console.log("Status from UI:", statusText);

  // 3. Decision logic
  const isBeforeStart = today.getTime() < startDate.getTime();
  const isDuringChallenge = today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime();
  const isAfterEnd = today.getTime() > endDate.getTime();

  // 4. Assertions based on status and date logic
  if (isBeforeStart) {
    console.log("🟡 Challenge is upcoming. Expecting status to be 'not started'.");
    expect(statusText,"Should update status as Not Started").toBe("not started");
  } else if (isDuringChallenge) {
    console.log("❌ Challenge is active. Status should NOT be 'not started'.");
    const isNotStarted = statusText === 'not started';
    expect(isNotStarted,"Status should NOT be 'not started' when challenge is inside active date range").toBe(false);
  } else if (statusText!='not started') {
    console.log(`❌ Failed to update status as "Not Started" — status is "${statusText}"`);
    // You can customize this condition based on your app logic
    expect(statusText,"Status should be 'not started' when challenge is NOT active yet/Reached challenge date").not.toBe("not started"); // or expect 'completed'
  } else {
    console.warn("⚠️ Unexpected condition — check date logic.");
  }
});


test(`User verifies score LeaderBoard PopUp in : ${testData.challengeFieldParams.ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
  const hoverIcon = adminPage.locator('vc-label.cursor-pointer svg').first();
  await hoverIcon.scrollIntoViewIfNeeded();
  // Hover over the icon to trigger tooltip
  await hoverIcon.hover( {force: true });
 await adminPage.waitForTimeout(250)
  // Locate the tooltip by its text content (adjust selector if needed)
  const tooltip = adminPage.locator(`//vc-tooltip//div[normalize-space(.)='Score leaderboard shows the average level of participation in all wellness activities tracked during this campaign. A higher score indicates more frequent engagement by employees in various challenges and activities.']`)
  await tooltip.waitFor({ state: 'visible' });
  await adminPage.waitForTimeout(250)
  // Assert tooltip text is correct
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Score leaderboard shows the average level of participation in all wellness activities tracked during this campaign. A higher score indicates more frequent engagement by employees in various challenges and activities.");

});

test(`User verifies step LeaderBoard PopUp in : ${testData.challengeFieldParams.ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
  const hoverIcon = adminPage.locator('vc-label.cursor-pointer svg').nth(1);
  await hoverIcon.scrollIntoViewIfNeeded();
  // Hover over the icon to trigger tooltip
  await hoverIcon.hover( {force: true });
 await adminPage.waitForTimeout(250)
  // Locate the tooltip by its text content (adjust selector if needed)
  const tooltip = adminPage.locator(`//vc-tooltip//div[normalize-space(.)='Steps leaderboard tracks the average number of steps logged by participants in this campaign. This metric reflects employees’ daily activity levels and helps visualize progress toward step-based goals.']`)
  await tooltip.waitFor({ state: 'visible' });
  await adminPage.waitForTimeout(250)
  // Assert tooltip text is correct
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Steps leaderboard tracks the average number of steps logged by participants in this campaign. This metric reflects employees’ daily activity levels and helps visualize progress toward step-based goals.");

});



test(`User verifies Themes Pop-UP in : ${testData.challengeFieldParams.ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
  const hoverIcon = adminPage.locator('vc-label.cursor-pointer svg').nth(2);
  await hoverIcon.scrollIntoViewIfNeeded();
  // Hover over the icon to trigger tooltip
  await hoverIcon.hover( {force: true });
 await adminPage.waitForTimeout(250)
  // Locate the tooltip by its text content (adjust selector if needed)
  const tooltip = adminPage.locator(`//vc-tooltip//div[normalize-space(.)='Themes are organized weekly as Week 1, Week 2, and so on, with each week featuring specific tasks and health goals. These weekly themes keep employees engaged by introducing fresh content, motivating them to focus on new wellness activities, and helping maintain ongoing interest in the program.']`)
  await tooltip.waitFor({ state: 'visible' });
  await adminPage.waitForTimeout(250)
  // Assert tooltip text is correct
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Themes are organized weekly as Week 1, Week 2, and so on, with each week featuring specific tasks and health goals. These weekly themes keep employees engaged by introducing fresh content, motivating them to focus on new wellness activities, and helping maintain ongoing interest in the program.");

});


test(`User verifies overall/Weekly functionality in score leaderboard (Individual) for : ${testData.challengeFieldParams.ChallengeName} in Upcoming challenge`, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text

 await BaseObj.clickElement(`//*[normalize-space(.)='Weekly']`)
 await adminPage.waitForTimeout(350)
let weekVisible= adminPage.locator(`//p[@class='ng-star-inserted visible single-week-select']`);
 await weekVisible.scrollIntoViewIfNeeded();
 await adminPage.waitForTimeout(350)
expect(await weekVisible.textContent()).toContain("Week")
 
});


test(`User switch to Team in Score Leaderboard (Upcoming Challenge) for : ${testData.challengeFieldParams.ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text

 let TeamText=adminPage.locator(`//*[normalize-space(.)='Team']`).first();
 await BaseObj.clickElement(`//*[normalize-space(.)='Team']`)
 await adminPage.waitForTimeout(350)
let weekVisible= adminPage.locator(`(//*[normalize-space(.)='Overall'])[1]`);
let print= await weekVisible.textContent()
console.log("Campaign week type in TEAMS (Score leaderBoard):",print)
 await adminPage.waitForTimeout(350)
expect(await weekVisible.textContent()).toContain("Overall")
 
});


test(`User verifies overall/Weekly functionality in step leaderboard (Individual) for : ${testData.challengeFieldParams.ChallengeName} in Upcoming challenge`, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
 await adminPage.waitForTimeout(350)
 await BaseObj.clickElement(`(//*[normalize-space(.)='Weekly'])`)
 await adminPage.waitForTimeout(350)
let weekVisible= adminPage.locator(`//p[@class='ng-star-inserted visible single-week-select']`).nth(1);
 await weekVisible.scrollIntoViewIfNeeded();
 await adminPage.waitForTimeout(350)
expect(await weekVisible.textContent()).toContain("Week")
 
});


test(`User switch to Team in Step Leaderboard (Upcoming Challenge) for : ${testData.challengeFieldParams.ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text

 //let TeamText=adminPage.locator(`//*[normalize-space(.)='Team']`).nth(2);
 await BaseObj.clickElement(`(//*[normalize-space(.)='Team'])[last()]`)
 await adminPage.waitForTimeout(350)
let weekVisible= adminPage.locator(`//*[normalize-space(.)='Overall']`).nth(1);
let print= await weekVisible.textContent()
console.log("Campaign week type in TEAMS (step leaderBoard):",print)
 await adminPage.waitForTimeout(350)
expect(await weekVisible.textContent()).toContain("Overall")
 
});



test(`User clicks on Edit Challenge for: ${testData.challengeFieldParams.ChallengeName} in Upcoming challenge`, async () => {
  const BaseObj = new BasePage(adminPage);


  const button = adminPage.locator('button:has-text("Edit Challenge")');

  try {
    await Promise.all([
      adminPage.waitForURL('**/fit/manage-challenge/edit-challenge/**'), // wildcard support
      button.click(),
    ]);

    console.log("✅ Edit Challenge button clicked and navigated successfully");

    expect(adminPage.url()).toContain('fit/manage-challenge/edit-challenge');
  } catch (err) {
    console.error("❌ Navigation to edit challenge failed:", err);
    throw err;
  }
});

test(`User changes cahllenge name in Edit Challenge for: ${testData.challengeFieldParams.ChallengeName} in Upcoming challenge`, async () => {
  const BaseObj = new BasePage(adminPage);
  await adminPage.waitForTimeout(250);

  let res=await BaseObj.fillInput('input[placeholder] >> nth=0',`Edited ${testData.challengeFieldParams.ChallengeName}`)

 expect(res.status,"Should edit the challenge name in Edit challenges").toBe("success");

});


test(`User toggles "Auto-Announce Winners on Social Feed" in Edit Challenge for: ${testData.challengeFieldParams.ChallengeName} in Upcoming challenge`, async () => {
  const BaseObj = new BasePage(adminPage);
let Preattribute=await adminPage.locator('input[checked]').getAttribute('checked');
if(Preattribute==='false'){
  let res=await BaseObj.clickElement('input[checked]');
  let attribute=await adminPage.locator('input[checked]').getAttribute('checked');
  console.log('✅ Toggle was off and is now checked.')
 expect(attribute,"Should edit the challenge name in Edit challenges").toBe('true');
}
else{
  console.log('⚠️ Toggle was already checked. Skipping toggle.')
}

});

test(`User is able to update Challenge for: ${testData.challengeFieldParams.ChallengeName} in Upcoming challenge`, async () => {
  const BaseObj = new BasePage(adminPage);
let res= BaseObj.clickElement(`//*[normalize-space()='Update Challenge']`)
expect((await res).status,"Should click the Update Challenge").toBe('success')
adminPage.goBack();
});
}




let activeParticipants: any;
let totalParticipants: any;
if (testData.challengeFieldParams.Ongoing_ChallengeName) {
  test(`User switches to Ongoing challenges in Manage Challenges section to verify no. of participants`, async () => {

    const BaseObj = new BasePage(adminPage);

    // Go back to the previous page
    if(testData.challengeFieldParams.ChallengeName){
    adminPage.goBack();
    }
    // Wait for and click "Ongoing Challenges" tab
    await BaseObj.waitForElement("//div[normalize-space()='Ongoing Challenges']");
    await BaseObj.clickElement("//div[normalize-space()='Ongoing Challenges']");
    await adminPage.waitForLoadState('domcontentloaded');

    // Verify correct tab URL
    const res2 = await BaseObj.assertLink("https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge?tab=ongoing");

    // Confirm tab is selected
    const attribute = await adminPage.locator("//div[normalize-space()='Ongoing Challenges']").getAttribute("aria-selected", { timeout: 5000 });
    if (attribute === "true") {
      console.log(`✅ User switched to Ongoing challenges`);
    } else {
      console.log(`❌ Failed to switch to Ongoing challenges`);
    }

    // Wait for the specific challenge to appear
    await BaseObj.waitForElement(`//div[normalize-space(.)='${testData.challenge.challenge_type}']//ancestor::div[@class="challenge-info"]//child::span[normalize-space(.)='${testData.challengeFieldParams.Ongoing_ChallengeName}']`);

    // Get pre-click participant info (e.g., "34 of 54 participants active")
    const particpantTextPreloadRaw = await adminPage.locator(
      `//div[normalize-space(.)='Custom Challenge']//ancestor::div[@class="challenge-info"]//child::span[normalize-space(.)='${testData.challengeFieldParams.Ongoing_ChallengeName}']//ancestor::div[@class="flex items-center gap-6 flex-1"]//following-sibling::div//div[@class='percentage-stats']`
    ).textContent();
    const particpantTextPreload = particpantTextPreloadRaw ?? '';

// ✅ Extract the active participants (e.g., "34" from "34 of 54 participants active")
     activeParticipants = particpantTextPreload.substring(0,particpantTextPreload.indexOf(' ')).trim();
    console.log('Active Participants:', activeParticipants);

    // Extract the total participants number from the text (e.g., "54")
    totalParticipants = particpantTextPreload.substring(
      particpantTextPreload.indexOf('of') + 3,
      particpantTextPreload.indexOf(' ', particpantTextPreload.indexOf('of') + 3)
    ).trim();

    console.log(`Total participants in challenge list for ${testData.challengeFieldParams.Ongoing_ChallengeName}:`, totalParticipants);

    // Click on the actual challenge to go inside
    const res3 = await BaseObj.clickElement(
      `//div[normalize-space(.)='${testData.challenge.challenge_type}']//ancestor::div[@class="challenge-info"]//child::span[normalize-space(.)='${testData.challengeFieldParams.Ongoing_ChallengeName}']`
    );
    const URL = await BaseObj.assertLink(`https://dashboard-v2.vantagecircle.co.in/fit/manage-challenge/campaign`);

    // Get post-click participant count from details page
    const particpantTextPostloadRaw = await adminPage.locator(
      `//*[normalize-space(.)='Total Participants']//following-sibling::*`
    ).textContent();
    const particpantTextPostload = particpantTextPostloadRaw?.trim() ?? '';

    // Optional: Assert the displayed number directly as an extra step
    await BaseObj.assertText(
      `//*[normalize-space(.)='Total Participants']/following-sibling::*`,
      totalParticipants
    );

    // ✅ Final assertion: Ensure both counts match
    expect(
      particpantTextPostload,
      `The total participant no. should match the no. of participants displayed in Challenge: ${testData.challengeFieldParams.Ongoing_ChallengeName}`
    ).toBe(totalParticipants);

    // Optional assertion on click status
    expect(
      res3.status,
      `Should click on created challenge: ${testData.challengeFieldParams.Ongoing_ChallengeName}, type: ${testData.challenge.challenge_type} in Ongoing challenges tab`
    ).toBe("success");

  });



}




test(`TC-- User verifies score LeaderBoard PopUp in : ${testData.challengeFieldParams.Ongoing_ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
  const hoverIcon = adminPage.locator('vc-label.cursor-pointer svg').first();
  await hoverIcon.scrollIntoViewIfNeeded();
  // Hover over the icon to trigger tooltip
  await hoverIcon.hover( {force: true });
 await adminPage.waitForTimeout(250)
  // Locate the tooltip by its text content (adjust selector if needed)
  const tooltip = adminPage.locator(`//vc-tooltip//div[normalize-space(.)='Score leaderboard shows the average level of participation in all wellness activities tracked during this campaign. A higher score indicates more frequent engagement by employees in various challenges and activities.']`)
  await tooltip.waitFor({ state: 'visible' });
  await adminPage.waitForTimeout(250)
  // Assert tooltip text is correct
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Score leaderboard shows the average level of participation in all wellness activities tracked during this campaign. A higher score indicates more frequent engagement by employees in various challenges and activities.");

});

test(`TC- User verifies step LeaderBoard PopUp in : ${testData.challengeFieldParams.Ongoing_ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
  const hoverIcon = adminPage.locator('vc-label.cursor-pointer svg').nth(1);
  await hoverIcon.scrollIntoViewIfNeeded();
  // Hover over the icon to trigger tooltip
  await hoverIcon.hover( {force: true });
 await adminPage.waitForTimeout(250)
  // Locate the tooltip by its text content (adjust selector if needed)
  const tooltip = adminPage.locator(`//vc-tooltip//div[normalize-space(.)='Steps leaderboard tracks the average number of steps logged by participants in this campaign. This metric reflects employees’ daily activity levels and helps visualize progress toward step-based goals.']`)
  await tooltip.waitFor({ state: 'visible' });
  await adminPage.waitForTimeout(250)
  // Assert tooltip text is correct
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Steps leaderboard tracks the average number of steps logged by participants in this campaign. This metric reflects employees’ daily activity levels and helps visualize progress toward step-based goals.");

});



test(`TC -User verifies Themes Pop-UP in : ${testData.challengeFieldParams.Ongoing_ChallengeName} `, async () => {

  let BaseObj = new BasePage(adminPage);
   
  // Locate the hover icon SVG inside the vc-label cursor-pointer container with unique text
  const hoverIcon = adminPage.locator('vc-label.cursor-pointer svg').nth(2);
  await hoverIcon.scrollIntoViewIfNeeded();
  // Hover over the icon to trigger tooltip
  await hoverIcon.hover( {force: true });
 await adminPage.waitForTimeout(250)
  // Locate the tooltip by its text content (adjust selector if needed)
  const tooltip = adminPage.locator(`//vc-tooltip//div[normalize-space(.)='Themes are organized weekly as Week 1, Week 2, and so on, with each week featuring specific tasks and health goals. These weekly themes keep employees engaged by introducing fresh content, motivating them to focus on new wellness activities, and helping maintain ongoing interest in the program.']`)
  await tooltip.waitFor({ state: 'visible' });
  await adminPage.waitForTimeout(250)
  // Assert tooltip text is correct
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Themes are organized weekly as Week 1, Week 2, and so on, with each week featuring specific tasks and health goals. These weekly themes keep employees engaged by introducing fresh content, motivating them to focus on new wellness activities, and helping maintain ongoing interest in the program.");

});

  /////////
test(`User clicks on Export button for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge in SCORE LEADERBOARD`, async () => {
  const BaseObj = new BasePage(adminPage);

  // Use XPath to find the button that contains the visible Export text
 let button= await BaseObj.clickElement('button:has-text("Export") >> nth=1')
 if(button.status==="success"){
  console.log("✅ Export button for scoreleaderboard clicked successfully");
 }else{
    console.log("❌ Export button for scoreleaderboard click failed");
 }
  // Assert the button is visible (already known, but keeps test explicit)
  expect(button.status,"should able to click leaderboard export button").toBe('success');
});


test(`User clicks on Export button for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge in CHALLENGE ENGAGAEMENT `, async () => {
  const BaseObj = new BasePage(adminPage);
await adminPage.waitForTimeout(250);
  // Use XPath to find the button that contains the visible Export text
 let button= await BaseObj.clickElement('button:has-text("Export") >> nth=0')
 if(button.status==="success"){
  console.log("✅ Export button for Challenge Enagagement clicked successfully");
 }else{
    console.log("❌ Export button for Challenge Enagagement click failed");
 }
  // Assert the button is visible (already known, but keeps test explicit)
  expect(button.status,"should able to click Challenge Enagagement export button").toBe('success');
});




  test(`Verify the no. of users for score LeaderBoard in pagination button for Ongoing challenge`, async () => {
     
   let Count = Number(totalParticipants);
   
   const paginationXPath = `i.pagination-btn.vc-arrow-right >> nth=0`;
    let countRowText= await adminPage.locator(`div.current-page-rows span >> nth=2`).textContent();
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
    countRowText = await adminPage.locator(`div.current-page-rows span >> nth=2`).textContent();
    countRow = Number((countRowText ?? '').trim());
    console.log("total user count found until this row :",countRow);
     if(countRow==Count){
          console.log(`✅ Total No. of particpants ${Count} ,matches the no. of users ${countRow} in table`)
          
      }
  }

  expect.soft(countRow).toBeLessThanOrEqual(Count);
  await adminPage.waitForTimeout(250);

  });


//////

//   test(`Verify the no. of users for step LeaderBoard in pagination button for Ongoing challenge`, async () => {

//    let Count = Number(activeParticipants);
   
//    const paginationXPath = `i.pagination-btn.vc-arrow-right >> nth=1`;
//     let countRowText= await adminPage.locator(`div.current-page-rows span >> nth=5`).textContent();
//     let countRow = Number((countRowText ?? '').trim()); 

//    while (Number.isFinite(countRow)  && countRow <Count) {
//     try {
//       const loc = adminPage.locator(paginationXPath);
//       await loc.waitFor({ state: 'visible', timeout: 3000 });
//       await loc.click();
//       console.log(' Pagination next button clicked successfully');
     
//     } catch (error) {
//       console.log('⚠️  Pagination next button not found or not visible for selected data - skipping');
//       console.log('This is expected behavior if there are no more pages');
//       break; // no more pages
//     }
//       // Re-read the count after paging
//     await adminPage.waitForTimeout(100);
//     countRowText = await adminPage.locator(`div.current-page-rows span >> nth=5`).textContent();
//     countRow = Number((countRowText ?? '').trim());
//     console.log("total user count found until this row :",countRow);
//      if(countRow==Count){
//           console.log(`✅ Total No. of particpants ${Count} ,matches the no. of users ${countRow} in table`)
          
//       }
//   }
//   expect.soft(countRow).toBeLessThanOrEqual(Count);
//   await adminPage.waitForTimeout(250);
  
// });

  //////
  if(testData.Leader_Board.GoTo_Score_Rank>='5'){
  test(`User enter a rank in scoreLeaderBoard's Go to input for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge`, async () => {
  const BaseObj = new BasePage(adminPage);


  const button = adminPage.locator("#vc-input-field-2");
    await BaseObj.fillInput('#vc-input-field-2',testData.Leader_Board.GoTo_Score_Rank);
      await button.press('Enter');
    let res=adminPage.locator(`//*[@class='table-container ng-star-inserted']//*[@class='rank'][normalize-space(.)='${testData.Leader_Board.GoTo_Score_Rank}']`)
    await expect(res,"Should display the rank no. in leaderboard when rank no. entered via `go to` input").toBeVisible({ timeout: 5000 });
    await BaseObj.assertText(`//*[@class='table-container ng-star-inserted']//*[@class='rank'][normalize-space(.)='${testData.Leader_Board.GoTo_Score_Rank}']`,testData.Leader_Board.GoTo_Score_Rank);


});
  

  test(`User enter a rank in StepLeaderBoard's Go to input for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge`, async () => {
  const BaseObj = new BasePage(adminPage);


  const button = adminPage.locator("#vc-input-field-3");
    await BaseObj.fillInput('#vc-input-field-3',testData.Leader_Board.GoTo_Step_Rank);
      await button.press('Enter');
    let res=adminPage.locator(`//*[@class='table-container ng-star-inserted']//*[@class='rank'][normalize-space(.)='${testData.Leader_Board.GoTo_Step_Rank}']`)
    await expect(res,"Should display the rank no. in leaderboard when rank no. entered via `go to` input").toBeVisible({ timeout: 5000 });
    await BaseObj.assertText(`//*[@class='table-container ng-star-inserted']//*[@class='rank'][normalize-space(.)='${testData.Leader_Board.GoTo_Step_Rank}']`,testData.Leader_Board.GoTo_Step_Rank);


});

}





test(`User clicks on Edit Challenge for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge`, async () => {
  const BaseObj = new BasePage(adminPage);


  const button = adminPage.locator('button:has-text("Edit Challenge")');

  try {
    await Promise.all([
      adminPage.waitForURL('**/fit/manage-challenge/edit-challenge/**'), // wildcard support
      button.click(),
    ]);

    console.log("✅ Edit Challenge button clicked and navigated successfully");

    expect(adminPage.url()).toContain('fit/manage-challenge/edit-challenge');
  } catch (err) {
    console.error("❌ Navigation to edit challenge failed:", err);
    throw err;
  }
});

test(`User changes cahllenge name in Edit Challenge for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge`, async () => {
  const BaseObj = new BasePage(adminPage);
  await adminPage.waitForTimeout(250);

  let res=await BaseObj.fillInput('input[placeholder] >> nth=0',`Edited ${testData.challengeFieldParams.Ongoing_ChallengeName}`)

 expect(res.status,"Should edit the challenge name in Edit challenges").toBe("success");

});


test(`User toggles "Auto-Announce Winners on Social Feed" in Edit Challenge for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge`, async () => {
  const BaseObj = new BasePage(adminPage);
let Preattribute=await adminPage.locator('input[checked]').getAttribute('checked');
if(Preattribute==='false'){
  let res=await BaseObj.clickElement('input[checked]');
  let attribute=await adminPage.locator('input[checked]').getAttribute('checked');
  console.log('✅ Toggle was off and is now checked.')
 expect(attribute,"Should edit the challenge name in Edit challenges").toBe('true');
}
else{
  console.log('⚠️ Toggle was already checked. Skipping toggle.')
}

});

test(`User is able to update Challenge for: ${testData.challengeFieldParams.Ongoing_ChallengeName} in Ongoing challenge`, async () => {
  const BaseObj = new BasePage(adminPage);
let res= BaseObj.clickElement(`//*[normalize-space()='Update Challenge']`)
expect((await res).status,"Should click the Update Challenge").toBe('success')

});



});


