import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../../../pages/LoginPage';
import { DashboardPage } from '../../../../pages/DashboardPage';
import { AdminDashboardPage } from '../../../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../../../pages/CreateChallengePage';
import { BasePage } from '../../../../pages/BasePage';
import { TargetAudiencePage } from '../../../../pages/TargetAudiencePage';
import { chromium } from 'playwright';
import testData from '../../../../Test-Data/355/CoverageTestdata(Activity Task)/ActivityTaskGrp1.json';
import JavaScriptExecutor from '../../../../utils/JavaScriptExecutor';



// Main suite for Create Challenge tests
test.describe.serial('Custom Challenge Coverage ~(Challenge configuration ~ [Activity tasks])', () => {
  test.describe.configure({ retries: 1 });

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


{
    const res3 = await BaseObj.clickElement("//vc-button//button[.//span[normalize-space()='Next']]");
    const expectedUrl =
      'https://dashboard-v2.vantagecircle.co.in/fit/create-challenge/custom-challenge/challenge-config';

      let ActualURL= adminPage.url();

    if (res3.status === 'success' &&  ActualURL===expectedUrl) {
      console.log(
        `✅ Next button is clicked & 🚀 navigated to Setup Task For The Challenge successfully `
      );
    } else if(ActualURL!== expectedUrl){
        throw new Error(
          `Expected Set Target Audience URL: ${expectedUrl}, got: ${ActualURL}`
        );
    } 
    else {
      console.log('❌ Next button failed to direct to Setup Task For The Challenge');
    }
  }


  });

  test.afterAll(async () => {
    if (customContext) {
      await customContext.close();
    }
  });


 test(`User is able to navigate back to "Set target audience" from challenge configuration`, async () => {
    await adminPage.waitForTimeout(250);
    const BaseObj = new BasePage(adminPage);

    await BaseObj.clickElement(`//button//*[normalize-space()='Back']`);
    let res=await BaseObj.waitForElement(`//*[normalize-space()='Set Target Audience']`);
      await adminPage.waitForTimeout(500);
     let res2 = await BaseObj.clickElement(
        "//vc-button//button[.//span[normalize-space()='Next']]"
      );
   if(res.status=== 'success' && res2.status==='success'){
    console.log('✅ User navigated to set duration after clicking back in target audience')
   }else{
    console.log('❌ User failed to navigate to set duration after clicking back in target audience')
   }
    
     await adminPage.waitForTimeout(250);
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

/////// /////             Steps task      ////// /////// ///////



test(`User clicks on 'Add Week' and drag an activity :${testData.Activitiy_Tasks.activity[0]} ,into Weeks`, async () => {
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



test(`User verify the minimum target range for ${testData.Activitiy_Tasks.activity[0]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[0]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[0])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[0]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('5000'); //
});



test(`User verify the maximum target range for ${testData.Activitiy_Tasks.activity[0]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[0]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[0])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[0]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('40000'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[0]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for task : ${testData.Activitiy_Tasks.activity[0]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup for: ${testData.Activitiy_Tasks.activity[0]}`, async () => {
   
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
      await adminPage.waitForTimeout(250);
});


//////////////////////////       Video watching task          //////////////////////////       


test(`User drag an activity :${testData.Activitiy_Tasks.activity[1]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[1];

  // --- Wait for the activity task bar/panel ---
  const taskbar = adminPage.locator('.activity-task-container');
  await expect(taskbar).toBeVisible();

  // --- Ensure the items container is rendered ---
  const items = taskbar.locator('.items-container');
  await expect(items).toBeVisible();

  const source = items.locator('[draggable="true"]').filter({ hasText: activityName }).first();

  await expect(source, `The activity tile "${activityName}" should be visible to drag`).toBeVisible();

  // --- Target: the Weeks drop zone (first visible) ---
  const target = adminPage.locator('.tasks-container').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Drop zone should be visible').toBeVisible();

  // --- Drag & drop (built-in API) ---
  await source.dragTo(target);
  console.log('drag successful');

  // --- Post-drop verification: header shows the dropped activity ---
  const header = adminPage.locator('.header-title');
  await expect(header).toContainText(activityName, { timeout: 5000 });

  // If you need to keep your helper-based assertion:
  const res = await BaseObj.assertText("//div[@class='header-title']", activityName);
  expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");
});





test(`User 'daily' target type should able no. of days dropdown for ${testData.Activitiy_Tasks.activity[1]}`, async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[normalize-space()='Watch 2 or more videos from our curated library section 3 days this week']`),"Watch 2 or more videos from our curated library section 3 days this week").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nWatch 2 or more videos from our curated library section 3 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nWatch 2 or more videos from our curated library section 3 days this week >>> failed to diplayed on target daily")
    ) 
  
});


test(`User 'Weekly' target type should disable no. of days dropdown  for ${testData.Activitiy_Tasks.activity[1]}`, async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
          await expect(adminPage.locator(`//div[normalize-space()='Watch 2 videos from our curated library section this week']`),"Watch 2 videos from our curated library section this week").toBeVisible();
        await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should disappear on Weekly target").not.toBeVisible();
      console.log("✅ Watch 2 videos from our curated library section this week ==> is displayed on clicking weekly")
    }else(
      console.log("❌ Watch 2 videos from our curated library section this week ==> failed to display on clicking weekly")
    )
  //
  

    
});



test(`User verify the minimum target range  for ${testData.Activitiy_Tasks.activity[1]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[1]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();

  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[1])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[1]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('1'); //
});



test(`User verify the maximum target range  for ${testData.Activitiy_Tasks.activity[1]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[1]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[1])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[1]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('20'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[1]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days  for ${testData.Activitiy_Tasks.activity[1]}`, async () => {

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

test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[1]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[1]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[1]} task to week`, async () => {
   
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

////////  Cycling/Wheel-Chair Coverage    /////////////


test(`User drag an activity :${testData.Activitiy_Tasks.activity[2]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[2];

  // --- Wait for the activity task bar/panel ---
  const taskbar = adminPage.locator('.activity-task-container');
  await expect(taskbar).toBeVisible();

  // --- Ensure the items container is rendered ---
  const items = taskbar.locator('.items-container');
  await expect(items).toBeVisible();

  const source = items.locator('[draggable="true"]').filter({ hasText: activityName }).first();

  await expect(source, `The activity tile "${activityName}" should be visible to drag`).toBeVisible();

  // --- Target: the Weeks drop zone (first visible) ---
  const target = adminPage.locator('.tasks-container').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Drop zone should be visible').toBeVisible();

  // --- Drag & drop (built-in API) ---
  await source.dragTo(target);
  console.log('drag successful');

  // --- Post-drop verification: header shows the dropped activity ---
  const header = adminPage.locator('.header-title');
  await expect(header).toContainText(activityName, { timeout: 5000 });

  // If you need to keep your helper-based assertion:
  const res = await BaseObj.assertText("//div[@class='header-title']", activityName);
  expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");
});





test(`User 'daily' target type should able no. of days dropdown for ${testData.Activitiy_Tasks.activity[2]}`, async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[normalize-space()='Cycle/Wheelchair for 5 kms (3.11 miles) in one go 2 days this week']`),"Cycle/Wheelchair for 5 kms (3.11 miles) in one go 2 days this week").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nCycle/Wheelchair for 5 kms (3.11 miles) in one go 2 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nCycle/Wheelchair for 5 kms (3.11 miles) in one go 2 days this week >>> failed to diplayed on target daily")
    ) 
  
});


test(`User 'Weekly' target type should disable no. of days dropdown  for ${testData.Activitiy_Tasks.activity[2]}`, async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
          await expect(adminPage.locator(`//div[normalize-space()='Cycle/Wheelchair 5 kms (3.11 miles) in total this week']`),"Cycle/Wheelchair 5 kms (3.11 miles) in total this week").toBeVisible();
        await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should disappear on Weekly target").not.toBeVisible();
      console.log("✅ Day drop down has disappeared on selecting week\nCycle/Wheelchair 5 kms (3.11 miles) in total this week==> is displayed on clicking weekly")
    }else(
      console.log("❌ Day drop down didnt disappeared on selecting week\nCycle/Wheelchair 5 kms (3.11 miles) in total this week ==> failed to display on clicking weekly")
    )
  //
  

    
});



test(`User verify the minimum target range  for ${testData.Activitiy_Tasks.activity[2]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[2]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[2])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[2]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('2'); //
});



test(`User verify the maximum target range  for ${testData.Activitiy_Tasks.activity[2]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[2]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[2])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[2]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('100'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[2]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days  for ${testData.Activitiy_Tasks.activity[2]}`, async () => {

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

test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[2]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[2]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[2]} task to week`, async () => {
   
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
      await adminPage.waitForTimeout(250);
});


///////      Active minuites test coverage      //////////


test(`User drag an activity :${testData.Activitiy_Tasks.activity[3]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[3];

  // --- Wait for the activity task bar/panel ---
  const taskbar = adminPage.locator('.activity-task-container');
  await expect(taskbar).toBeVisible();

  // --- Ensure the items container is rendered ---
  const items = taskbar.locator('.items-container');
  await expect(items).toBeVisible();

  const source = items.locator('[draggable="true"]').filter({ hasText: activityName }).first();

  await expect(source, `The activity tile "${activityName}" should be visible to drag`).toBeVisible();

  // --- Target: the Weeks drop zone (first visible) ---
  const target = adminPage.locator('.tasks-container').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Drop zone should be visible').toBeVisible();

  // --- Drag & drop (built-in API) ---
  await source.dragTo(target);
  console.log('drag successful');

  // --- Post-drop verification: header shows the dropped activity ---
  const header = adminPage.locator('.header-title');
  await expect(header).toContainText(activityName, { timeout: 5000 });

  // If you need to keep your helper-based assertion:
  const res = await BaseObj.assertText("//div[@class='header-title']", activityName);
  expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");
});





test(`User 'daily' target type should able no. of days dropdown for ${testData.Activitiy_Tasks.activity[3]}`, async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[normalize-space()='Spend 20+ active minutes 4 days this week']`),"Spend 20+ active minutes 4 days this week").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nSpend 20+ active minutes 4 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nSpend 20+ active minutes 4 days this week >>> failed to diplayed on target daily")
    ) 
  
});


test(`User 'Weekly' target type should disable no. of days dropdown  for ${testData.Activitiy_Tasks.activity[3]}`, async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
          await expect(adminPage.locator(`//div[normalize-space()='Spend 20+ active minutes this week']`),"Spend 20+ active minutes this week").toBeVisible();
        await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should disappear on Weekly target").not.toBeVisible();
      console.log("✅ Day drop down has disappeared on selecting week\nSpend 20+ active minutes this week==> is displayed on clicking weekly")
    }else(
      console.log("❌ Day drop down didnt disappeared on selecting week\nSpend 20+ active minutes this week ==> failed to display on clicking weekly")
    )
  //
  

    
});



test(`User verify the minimum target range  for ${testData.Activitiy_Tasks.activity[3]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[3]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[3])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[3]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('15'); //
});



test(`User verify the maximum target range  for ${testData.Activitiy_Tasks.activity[3]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[3]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[3])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[3]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('400'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[3]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days  for ${testData.Activitiy_Tasks.activity[3]}`, async () => {

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

test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[3]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[3]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[3]} task to week`, async () => {
   
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


//////////////   Squat Workout Coverage    /////////////


test(`User drag an activity :${testData.Activitiy_Tasks.activity[4]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[4];

  // --- Wait for the activity task bar/panel ---
  const taskbar = adminPage.locator('.activity-task-container');
  await expect(taskbar).toBeVisible();

  // --- Ensure the items container is rendered ---
  const items = taskbar.locator('.items-container');
  await expect(items).toBeVisible();

  const source = items.locator('[draggable="true"]').filter({ hasText: activityName }).first();
await source.scrollIntoViewIfNeeded();
  await expect(source, `The activity tile "${activityName}" should be visible to drag`).toBeVisible();

  // --- Target: the Weeks drop zone (first visible) ---
  const target = adminPage.locator('.tasks-container').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Drop zone should be visible').toBeVisible();

  // --- Drag & drop (built-in API) ---
  await source.dragTo(target);
  console.log('drag successful');

  // --- Post-drop verification: header shows the dropped activity ---
  const header = adminPage.locator('.header-title');
  await expect(header).toContainText(activityName, { timeout: 5000 });

  // If you need to keep your helper-based assertion:
  const res = await BaseObj.assertText("//div[@class='header-title']", activityName);
  expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");
});





test(`User 'daily' target type should able no. of days dropdown for ${testData.Activitiy_Tasks.activity[4]}`, async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[normalize-space()='Complete 10+ squats in one go 4 days this week']`),"Complete 10+ squats in one go 4 days this week").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nComplete 10+ squats in one go 4 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nComplete 10+ squats in one go 4 days this week >>> failed to diplayed on target daily")
    ) 
  
});


test(`User 'Weekly' target type should disable no. of days dropdown  for ${testData.Activitiy_Tasks.activity[4]}`, async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
          await expect(adminPage.locator(`//div[normalize-space()='Complete a total of 10+ squats this week']`),"Complete a total of 10+ squats this week").toBeVisible();
        await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should disappear on Weekly target").not.toBeVisible();
      console.log("✅ Day drop down has disappeared on selecting week\nComplete a total of 10+ squats this week==> is displayed on clicking weekly")
    }else(
      console.log("❌ Day drop down didnt disappeared on selecting week\nComplete a total of 10+ squats this week ==> failed to display on clicking weekly")
    )
  //
  

    
});



test(`User verify the minimum target range  for ${testData.Activitiy_Tasks.activity[4]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[4]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[4])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[4]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('10'); //
});



test(`User verify the maximum target range  for ${testData.Activitiy_Tasks.activity[4]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[4]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[4])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[4]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('50'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[4]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days  for ${testData.Activitiy_Tasks.activity[4]}`, async () => {

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

test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[4]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[4]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[4]} task to week`, async () => {
   
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


///////////////   Meditation     //////////////


test(`User drag an activity :${testData.Activitiy_Tasks.activity[5]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[5];

  // --- Wait for the activity task bar/panel ---
  const taskbar = adminPage.locator('.activity-task-container');
  await expect(taskbar).toBeVisible();

  // --- Ensure the items container is rendered ---
  const items = taskbar.locator('.items-container');
  await expect(items).toBeVisible();

  const source = items.locator('[draggable="true"]').filter({ hasText: activityName }).first();
await source.scrollIntoViewIfNeeded();
  await expect(source, `The activity tile "${activityName}" should be visible to drag`).toBeVisible();

  // --- Target: the Weeks drop zone (first visible) ---
  const target = adminPage.locator('.tasks-container').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Drop zone should be visible').toBeVisible();

  // --- Drag & drop (built-in API) ---
  await source.dragTo(target);
  console.log('drag successful');

  // --- Post-drop verification: header shows the dropped activity ---
  const header = adminPage.locator('.header-title');
  await expect(header).toContainText(activityName, { timeout: 5000 });

  // If you need to keep your helper-based assertion:
  const res = await BaseObj.assertText("//div[@class='header-title']", activityName);
  expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");
});





test(`User 'daily' target type should able no. of days dropdown for ${testData.Activitiy_Tasks.activity[5]}`, async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[normalize-space()='Spend 5 or more mindful minutes in one go at least 2 days this week']`),"Spend 5 or more mindful minutes in one go at least 2 days this week").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nSpend 5 or more mindful minutes in one go at least 2 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nSpend 5 or more mindful minutes in one go at least 2 days this week >>> failed to diplayed on target daily")
    ) 
  
});


test(`User 'Weekly' target type should disable no. of days dropdown  for ${testData.Activitiy_Tasks.activity[5]}`, async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
          await expect(adminPage.locator(`//div[normalize-space()='Spend 5 or more mindful minutes in total this week']`),"Spend 5 or more mindful minutes in total this week").toBeVisible();
        await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should disappear on Weekly target").not.toBeVisible();
      console.log("✅ Day drop down has disappeared on selecting week\nSpend 5 or more mindful minutes in total this week ==> is displayed on clicking weekly")
    }else(
      console.log("❌ Day drop down didnt disappeared on selecting week\nSpend 5 or more mindful minutes in total this week ==> failed to display on clicking weekly")
    )
  
  

    
});



test(`User verify the minimum target range  for ${testData.Activitiy_Tasks.activity[5]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[5]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[5])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[5]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('5'); //
});



test(`User verify the maximum target range  for ${testData.Activitiy_Tasks.activity[5]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[5]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[5])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[5]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('15'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[5]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days  for ${testData.Activitiy_Tasks.activity[5]}`, async () => {

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

test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[5]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[5]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[5]} task to week`, async () => {
   
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



/////////////     Article Reading.     //////////////



test(`User drag an activity :${testData.Activitiy_Tasks.activity[6]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[6];

  // --- Wait for the activity task bar/panel ---
  const taskbar = adminPage.locator('.activity-task-container');
  await expect(taskbar).toBeVisible();

  // --- Ensure the items container is rendered ---
  const items = taskbar.locator('.items-container');
  await expect(items).toBeVisible();

  const source = items.locator('[draggable="true"]').filter({ hasText: activityName }).first();
await source.scrollIntoViewIfNeeded();
  await expect(source, `The activity tile "${activityName}" should be visible to drag`).toBeVisible();

  // --- Target: the Weeks drop zone (first visible) ---
  const target = adminPage.locator('.tasks-container').first();
  await target.scrollIntoViewIfNeeded();
  await expect(target, 'Drop zone should be visible').toBeVisible();

  // --- Drag & drop (built-in API) ---
  await source.dragTo(target);
  console.log('drag successful');

  // --- Post-drop verification: header shows the dropped activity ---
  const header = adminPage.locator('.header-title');
  await expect(header).toContainText(activityName, { timeout: 5000 });

  // If you need to keep your helper-based assertion:
  const res = await BaseObj.assertText("//div[@class='header-title']", activityName);
  expect(res.status, "Dragged activity should open (Target Type , Rewards etc)").toBe("success");
});





test(`User 'daily' target type should able no. of days dropdown for ${testData.Activitiy_Tasks.activity[6]}`, async () => {

    let selectedTarget=  adminPage.locator(`//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');

    if (checkStatus=='true'){
        await expect(adminPage.locator(`//div[normalize-space()='Read 2 or more articles from our curated library section 3 days this week']`),"Read 2 or more articles from our curated library section 3 days this week").toBeVisible();
          await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should appear on Daily target").toBeVisible();
      console.log("✅ No of days dropdown is displayed when checked on daily target\nRead 2 or more articles from our curated library section 3 days this week >>> is diplayed on target daily")
    }else( 
      console.log("❌ No of days dropdown is not displayed when checked on daily target\nRead 2 or more articles from our curated library section 3 days this week >>> failed to diplayed on target daily")
    ) 
  
});


test(`User 'Weekly' target type should disable no. of days dropdown  for ${testData.Activitiy_Tasks.activity[6]}`, async () => {

    adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`).click();
    let selectedTarget= adminPage.locator(`//span[normalize-space(.)='Weekly']//parent::label//preceding-sibling::div`);
    await adminPage.waitForTimeout(250);
    const checkStatus=  await selectedTarget.getAttribute('data-checked');
   // await adminPage.waitForTimeout(500);
 if (checkStatus=='true'){
          await expect(adminPage.locator(`//div[normalize-space()='Read 2 articles from our curated library section this week']`),"Read 2 articles from our curated library section this week").toBeVisible();
        await expect(adminPage.locator(`//div[normalize-space()='DAYS THIS WEEK']`),"No of days dropdown should disappear on Weekly target").not.toBeVisible();
      console.log("✅ Day drop down has disappeared on selecting week\nRead 2 articles from our curated library section this week ==> is displayed on clicking weekly")
    }else(
      console.log("❌ Day drop down didnt disappeared on selecting week\nRead 2 articles from our curated library section this week ==> failed to display on clicking weekly")
    )
  
  

    
});



test(`User verify the minimum target range  for ${testData.Activitiy_Tasks.activity[6]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMinValue[6]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMinValue[6])) {

    console.log('✅ System automatically returning the minimum target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMinValue[6]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value<${actual}`).toBe('1'); //
});



test(`User verify the maximum target range  for ${testData.Activitiy_Tasks.activity[6]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // --- Selectors ---
  const targetInputXpath =
    `//*[normalize-space(text())='TARGET']//following-sibling::vc-input-field//input[@placeholder='Target']`;
  const dailyToggleXpath =
    `//span[normalize-space(.)='Daily']//parent::label//preceding-sibling::div`;

  // 1) Type a too-low value (below min)
  await BaseObj.fillInput(targetInputXpath, testData.Activitiy_Tasks.targetMaxValue[6]);

  // Trigger validation if it runs on blur
  await adminPage.locator(`xpath=${targetInputXpath}`).press('Tab');

  // 2) Click "Daily" (your previous snippet created locator but didn’t click)
  await adminPage.locator(`xpath=${dailyToggleXpath}`).click();

  // 3) Read value from INPUT (not a <div>)
  const targetInput = adminPage.locator(`xpath=${targetInputXpath}`);
  const actual = await targetInput.inputValue();
  console.log('Target value (from input):', actual);


  // 5) Keep your logging semantics
  if (actual !== String(testData.Activitiy_Tasks.targetMaxValue[6])) {
    console.log('✅ System automatically returning the maxium target value successfully');
  } else {
    console.log(
      `❌ System failed to automatically return the minimum target value and saved ${testData.Activitiy_Tasks.targetMaxValue[5]}`
    );
  }

  expect(actual,`Should return ${actual} automatically if value>${actual}`).toBe('20'); //
});


test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[6]}`, async () => {

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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days  for ${testData.Activitiy_Tasks.activity[6]}`, async () => {

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

test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[6]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[6]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[6]} task to week`, async () => {
   
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




});