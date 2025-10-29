import { test, expect, Page, BrowserContext } from '@playwright/test';
import { LoginPage } from '../../../../pages/LoginPage';
import { DashboardPage } from '../../../../pages/DashboardPage';
import { AdminDashboardPage } from '../../../../pages/AdminDashboardPage';
import { DashboardSidebarPage } from '../../../../pages/DashboardSidebarPage';
import { CreateChallengePage } from '../../../../pages/CreateChallengePage';
import { BasePage } from '../../../../pages/BasePage';
import { TargetAudiencePage } from '../../../../pages/TargetAudiencePage';
import { chromium } from 'playwright';
import testData from '../../../../Test-Data/355/CoverageTestdata(Activity Task)/ActivityTaskGrp3.json';
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
    const isChromium = browser.browserType().name() === 'Chromium';

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
    await page.waitForURL('**/ng/home', { timeout: 60000 });

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

            /////// ///// //////     Nutrition   /////// ///////



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



test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for task: ${testData.Activitiy_Tasks.activity[0]}`, async () => {

  const BaseObj = new BasePage(adminPage);

  // Step 1: Click on the dropdown to select No of Days
  const RewardSelect = adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);

  // Step 2: Select the desired number of days
  const res = await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);

  // Step 3: Get the selected value from the dropdown (your original locator)
  const RewardAfterSelect = adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);

  // Step 4: Get the task title and check it contains "X days"
  const UGTitle = await adminPage.locator(`//div[@class='task-title']`).textContent();

  if (UGTitle?.includes(`${testData.Activitiy_Tasks.NoOFDays} days`)) {
    console.log(`✅ Task title correctly includes '${testData.Activitiy_Tasks.NoOFDays} days' afteer selecting new no. of days`);
  } else {
    console.warn(`❌ Task title does NOT include '${testData.Activitiy_Tasks.NoOFDays} days'. Found: "${UGTitle}"`);
  }

  // Step 5: Assert selected value in dropdown
  expect(UGTitle).toContain(testData.Activitiy_Tasks.NoOFDays);

  // Step 6: Log selection result
  if (res?.status === 'success') {
    console.log(`✅ User successfully selected desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`);
  } else {
    const actualSelected = await RewardAfterSelect.textContent();
    console.log(`❌ User failed to select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}. Actual selected: "${actualSelected}"`);
  }

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
      await adminPage.waitForTimeout(250);
});


      //////////////////////////    Heart rate     //////////////////////////   


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



test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for: ${testData.Activitiy_Tasks.activity[1]}`, async () => {

  const BaseObj = new BasePage(adminPage);
  const RewardSelect = adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);

  const res = await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);

  const RewardAfterSelect = adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);

  const UGTitle = await adminPage.locator(`(//div[@class='task-title'])[last()]`).textContent();

  if (UGTitle?.includes(`${testData.Activitiy_Tasks.NoOFDays} days`)) {
    console.log(`✅ Task title correctly includes '${testData.Activitiy_Tasks.NoOFDays} days' afteer selecting new no. of days`);
  } else {
    console.warn(`❌ Task title does NOT include '${testData.Activitiy_Tasks.NoOFDays} days'. Found: "${UGTitle}"`);
  }

  expect(UGTitle).toContain(testData.Activitiy_Tasks.NoOFDays);

  if (res?.status === 'success') {
    console.log(`✅ User successfully selected desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`);
  } else {
    const actualSelected = await RewardAfterSelect.textContent();
    console.log(`❌ User failed to select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}. Actual selected: "${actualSelected}"`);
  }

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

////////  Weight Log Coverage    /////////////


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



test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for: ${testData.Activitiy_Tasks.activity[2]}`, async () => {

  const BaseObj = new BasePage(adminPage);
  const RewardSelect = adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);

  const res = await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);

  const RewardAfterSelect = adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);

  const UGTitle = await adminPage.locator(`(//div[@class='task-title'])[last()]`).textContent();

  if (UGTitle?.includes(`${testData.Activitiy_Tasks.NoOFDays} days`)) {
    console.log(`✅ Task title correctly includes '${testData.Activitiy_Tasks.NoOFDays} days' afteer selecting new no. of days`);
  } else {
    console.warn(`❌ Task title does NOT include '${testData.Activitiy_Tasks.NoOFDays} days'. Found: "${UGTitle}"`);
  }

  expect(UGTitle).toContain(testData.Activitiy_Tasks.NoOFDays);

  if (res?.status === 'success') {
    console.log(`✅ User successfully selected desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`);
  } else {
    const actualSelected = await RewardAfterSelect.textContent();
    console.log(`❌ User failed to select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}. Actual selected: "${actualSelected}"`);
  }

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


///////      Log any activity test coverage      //////////


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



test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for: ${testData.Activitiy_Tasks.activity[3]}`, async () => {

  const BaseObj = new BasePage(adminPage);
  const RewardSelect = adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);

  const res = await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);

  const RewardAfterSelect = adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);

  const UGTitle = await adminPage.locator(`(//div[@class='task-title'])[last()]`).textContent();

  if (UGTitle?.includes(`${testData.Activitiy_Tasks.NoOFDays} days`)) {
    console.log(`✅ Task title correctly includes '${testData.Activitiy_Tasks.NoOFDays} days' afteer selecting new no. of days`);
  } else {
    console.warn(`❌ Task title does NOT include '${testData.Activitiy_Tasks.NoOFDays} days'. Found: "${UGTitle}"`);
  }

  expect(UGTitle).toContain(testData.Activitiy_Tasks.NoOFDays);

  if (res?.status === 'success') {
    console.log(`✅ User successfully selected desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`);
  } else {
    const actualSelected = await RewardAfterSelect.textContent();
    console.log(`❌ User failed to select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}. Actual selected: "${actualSelected}"`);
  }

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


//////////////   7 Minute workout Coverage    /////////////


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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for: ${testData.Activitiy_Tasks.activity[4]}`, async () => {

  const BaseObj = new BasePage(adminPage);
  const RewardSelect = adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);

  const res = await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);

  const RewardAfterSelect = adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);

  const UGTitle = await adminPage.locator(`(//div[@class='task-title'])[last()]`).textContent();

  if (UGTitle?.includes(`${testData.Activitiy_Tasks.NoOFDays} days`)) {
    console.log(`✅ Task title correctly includes '${testData.Activitiy_Tasks.NoOFDays} days' afteer selecting new no. of days`);
  } else {
    console.warn(`❌ Task title does NOT include '${testData.Activitiy_Tasks.NoOFDays} days'. Found: "${UGTitle}"`);
  }

  expect(UGTitle).toContain(testData.Activitiy_Tasks.NoOFDays);

  if (res?.status === 'success') {
    console.log(`✅ User successfully selected desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`);
  } else {
    const actualSelected = await RewardAfterSelect.textContent();
    console.log(`❌ User failed to select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}. Actual selected: "${actualSelected}"`);
  }

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


///////////////   Mood-O-Meter     //////////////


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


test(`User selects the no. of days for activity week -- as ${testData.Activitiy_Tasks.NoOFDays} days for: ${testData.Activitiy_Tasks.activity[5]}`, async () => {

  const BaseObj = new BasePage(adminPage);
  const RewardSelect = adminPage.locator("//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]");
  await RewardSelect.click();
  await adminPage.waitForTimeout(250);

  const res = await BaseObj.clickElement(`//span[contains(normalize-space(.),"${testData.Activitiy_Tasks.NoOFDays}")]`);

  const RewardAfterSelect = adminPage.locator(`//div[contains(normalize-space(.), 'NO OF DAYS')]/following-sibling::vc-select[1]//button[contains(@class,'select-btn')]//span[contains(normalize-space(.),'${testData.Activitiy_Tasks.NoOFDays}')]`);

  const UGTitle = await adminPage.locator(`(//div[@class='task-title'])[last()]`).textContent();

  if (UGTitle?.includes(`${testData.Activitiy_Tasks.NoOFDays} days`)) {
    console.log(`✅ Task title correctly includes '${testData.Activitiy_Tasks.NoOFDays} days' afteer selecting new no. of days`);
  } else {
    console.warn(`❌ Task title does NOT include '${testData.Activitiy_Tasks.NoOFDays} days'. Found: "${UGTitle}"`);
  }

  expect(UGTitle).toContain(testData.Activitiy_Tasks.NoOFDays);

  if (res?.status === 'success') {
    console.log(`✅ User successfully selected desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}`);
  } else {
    const actualSelected = await RewardAfterSelect.textContent();
    console.log(`❌ User failed to select desired No of Days as ${testData.Activitiy_Tasks.NoOFDays}. Actual selected: "${actualSelected}"`);
  }

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



/////////////    Yoga Session     //////////////



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





          /////////////    Track Sleep    //////////////



test(`User drag an activity :${testData.Activitiy_Tasks.activity[7]} , into Weeks`, async () => {
  const BaseObj = new BasePage(adminPage);
  const activityName = testData.Activitiy_Tasks.activity[7];

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




test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[7]}`, async () => {

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




test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[7]}`, async () => {

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



test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[7]}`, async () => {
   
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

test(`User should be able to add ${testData.Activitiy_Tasks.activity[7]} task to week`, async () => {
   
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


          /////////////    Health Vitals    //////////////


 test(`User drag an activity :${testData.Activitiy_Tasks.activity[8]} , into Weeks`, async () => {
   const BaseObj = new BasePage(adminPage);
   const activityName = testData.Activitiy_Tasks.activity[8];
 
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
 
 
 
 
 test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[8]}`, async () => {
 
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
 
 
 
 
 test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[8]}`, async () => {
 
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
 
 
 
 test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[8]}`, async () => {
    
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
 
 test(`User should be able to add ${testData.Activitiy_Tasks.activity[8]} task to week`, async () => {
    
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
 
 
 
           /////////////    Log Cigarettes Smoke    //////////////


           test(`User drag an activity :${testData.Activitiy_Tasks.activity[9]} , into Weeks`, async () => {
            const BaseObj = new BasePage(adminPage);
            const activityName = testData.Activitiy_Tasks.activity[9];
          
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
          
          
          
          
          test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[9]}`, async () => {
          
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
          
          
          
          
          test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[9]}`, async () => {
          
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
          
          
          
          test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[9]}`, async () => {
             
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
          
          test(`User should be able to add ${testData.Activitiy_Tasks.activity[9]} task to week`, async () => {
             
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
          
          
          
       
  /////////////    Book Reading    //////////////


   test(`User drag an activity :${testData.Activitiy_Tasks.activity[10]} , into Weeks`, async () => {
    const BaseObj = new BasePage(adminPage);
    const activityName = testData.Activitiy_Tasks.activity[10];

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




  test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[10]}`, async () => {

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




  test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[10]}`, async () => {

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



  test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[10]}`, async () => {

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

  test(`User should be able to add ${testData.Activitiy_Tasks.activity[10]} task to week`, async () => {

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


       
  /////////////    Log strength/weight training   //////////////


  test(`User drag an activity :${testData.Activitiy_Tasks.activity[11]} , into Weeks`, async () => {
    const BaseObj = new BasePage(adminPage);
    const activityName = testData.Activitiy_Tasks.activity[11];

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




  test(`User selects the reward value for activity -- ${testData.Activitiy_Tasks.activity[11]}`, async () => {

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




  test(`User selects "Click here to view the prize in a different country" for ${testData.Activitiy_Tasks.activity[11]}`, async () => {

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



  test(`User should be able to close 'prize view for different country' popup  for ${testData.Activitiy_Tasks.activity[11]}`, async () => {

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

  test(`User should be able to add ${testData.Activitiy_Tasks.activity[11]} task to week`, async () => {

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