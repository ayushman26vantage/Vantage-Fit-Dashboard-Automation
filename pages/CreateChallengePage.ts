// import { Page } from '@playwright/test';
// import { BasePage } from './BasePage';
// import assert from 'assert';


// export class CreateChallengePage extends BasePage {
//     constructor(page: Page) {
//         super(page);
//     }

//     private getChallengeCardSelector(challengeType: 'Custom' | 'Race' | 'Journey' | 'E-Marathon' | 'Streak'): string {
//         const titleText = challengeType === 'E-Marathon' ? 'E-Marathon' : `${challengeType} Challenge`;
//         return `//div[contains(@class, 'card-title') and normalize-space(text())='${titleText}']/ancestor::div[contains(@class, 'card-body')]`;
//     }

//     /**
//      * Clicks the "Create Challenge" button for a specific challenge type.
//      * @param challengeType - The title of the challenge to create.
//      */
//     async selectChallengeType(challengeType: 'Custom' | 'Race' | 'Journey' | 'E-Marathon' | 'Streak') {
//         const challengeCardSelector = this.getChallengeCardSelector(challengeType);
//         const createButtonSelector = `${challengeCardSelector}//button[normalize-space()='Create Challenge']`;
        
//         const createButton = this.page.locator(createButtonSelector);
//         await createButton.waitFor({ state: 'visible', timeout: 10000 });
//         await createButton.click();
//     }

//     /**
//      * Gets the description text for a specific challenge type.
//      * @param challengeType - The title of the challenge.
//      */
//     async getChallengeDescription(challengeType: 'Custom' | 'Race' | 'Journey' | 'E-Marathon' | 'Streak'): Promise<string | null> {
//         const challengeCardSelector = this.getChallengeCardSelector(challengeType);
//         const descriptionSelector = `${challengeCardSelector}//div[contains(@class, 'card-description')]`;
        
//         const descriptionElement = this.page.locator(descriptionSelector);
//         await descriptionElement.waitFor({ state: 'visible', timeout: 10000 });
//         return await descriptionElement.textContent();
//     }

//     private getTemplateCardSelector(templateTitle: string): string {
//         return `//div[contains(@class, 'card-title') and normalize-space(text())='${templateTitle}']/ancestor::div[contains(@class, 'card-container')]`;
//     }

//     /**
//      * Clicks the "Use Template" button for a specific template.
//      * @param templateTitle - The title of the template to use.
//      */
//     async selectTemplate(templateTitle: 'Stress Free Month' | 'Elevate Endurance' | 'Mindful Moving' | 'Healthy Habits Hero') {
//         const templateCardSelector = this.getTemplateCardSelector(templateTitle);
//         const useTemplateButton = this.page.locator(`${templateCardSelector}//button`);
        
//         await useTemplateButton.waitFor({ state: 'visible', timeout: 10000 });
//         await useTemplateButton.click();
//     }

//     /**
//      * Gets the description text for a specific template.
//      * @param templateTitle - The title of the template.
//      */
//     async getTemplateDescription(templateTitle: 'Stress Free Month' | 'Elevate Endurance' | 'Mindful Moving' | 'Healthy Habits Hero'): Promise<string | null> {
//         const templateCardSelector = this.getTemplateCardSelector(templateTitle);
//         const descriptionSelector = `${templateCardSelector}//div[contains(@class, 'card-body')]`;
        
//         const descriptionElement = this.page.locator(descriptionSelector);
//         await descriptionElement.waitFor({ state: 'visible', timeout: 10000 });
//         return await descriptionElement.textContent();
//     }

//     async selectChallengeLogo(image){
//     try{
//       let logo=this.page.locator(`//div[contains(text(),'${image}')]`);
//       await logo.click();
//       return {status:"success", message:"desired logo selected successfully"}
//     }catch(error){
//         console.error('Error while selcting logo in challenge',error.message);
//         return {status:"failure", message:"desired logo failed to select"}
//     }
//     }

//     async checkDraggable(locatorOrXpath, expectedValue) {
//     try {
//       const locator = this.page.locator(locatorOrXpath);
//       await locator.waitFor({ state: 'attached', timeout: 5000 });

//       const actualValue = await locator.getAttribute('draggable'); // string | null
//       assert.strictEqual(
//         actualValue,
//         expectedValue,
//         `Expected draggable="${expectedValue}" but got "${actualValue}"`
//       );

//       return {
//         status: 'success',
//         message: `actual="${actualValue}" === expected="${expectedValue}"`,
//         actualValue
//       };
//     } catch (error) {
//       return {
//         status: 'failure',
//         message: `Expected draggable="${expectedValue}"`,
//         error: error.message
//       };
//     }
//   }

//   async imgCloudnarySrcExtract(locatorOrXpath){

//       try{
//         const locator = this.page.locator(locatorOrXpath);
//       await locator.waitFor({ state: 'attached', timeout: 5000 });

//       const actualValue = await locator.getAttribute('src');
      
//       return actualValue;

        
//     }
//     catch(error){
//         console.error("failed to locate img src:",error.message);
//     }
//   }
// //// above and below func interlinked together where above func returns url which is inseerted to 1st params of the below func.
//    async VerifyFileUploaded(OriginalSrc, locatorAfterupload) {

//      try{
//       //   const locator = this.page.locator(locatorOrXpath);
//       // await locator.waitFor({ state: 'attached', timeout: 5000 });

//       // const actualValue = await locator.getAttribute('src');
//       // const update=this.page.locator(locatorAfterupload);
//       // await update.waitFor({ state: 'attached', timeout: 5000 });
//       let locator= this.page.locator(locatorAfterupload).waitFor({state:"attached",timeout:5000});
//       const updatevalue= await this.page.locator(locatorAfterupload).getAttribute('src');
//       console.log("new file uploaded Cloudanary url:",updatevalue)
//       if(updatevalue !== OriginalSrc){
//          return {
//         status: 'success',
//         message: `file uploaded successfully`,

//       };
//     }}
//     catch(error){
//         console.error("Upload failed",error.message);

//         return {
//         status: 'failure',
//         message: `failed to upload file `,
//         error: error.message
//       };

//     }
//  }
 
// } 


import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import assert from 'assert';

// Narrow, reusable string unions for clarity
type ChallengeType = 'Custom' | 'Race' | 'Journey' | 'E-Marathon' | 'Streak';
type TemplateTitle = 'Stress Free Month' | 'Elevate Endurance' | 'Mindful Moving' | 'Healthy Habits Hero';

// Small result helpers
type Ok = { status: 'success'; message: string; actualValue?: string | null };
type Err = { status: 'failure'; message: string; error?: string };

export class CreateChallengePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // ---- private helpers -----------------------------------------------------

  private static errMsg(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
  }

  private getChallengeCardSelector(challengeType: ChallengeType): string {
    const titleText = challengeType === 'E-Marathon' ? 'E-Marathon' : `${challengeType} Challenge`;
    // card-title matches exact text, then return its card body container
    return `//div[contains(@class,'card-title') and normalize-space(text())='${titleText}']/ancestor::div[contains(@class,'card-body')]`;
  }

  private getTemplateCardSelector(templateTitle: TemplateTitle): string {
    // Keeping your structure; adjust 'card-container' if DOM differs
    return `//div[contains(@class,'card-title') and normalize-space(text())='${templateTitle}']/ancestor::div[contains(@class,'card-container')]`;
  }

  private ensureLocator(selOrLoc: string | Locator): Locator {
    return typeof selOrLoc === 'string' ? this.page.locator(selOrLoc) : selOrLoc;
  }

  // ---- public actions ------------------------------------------------------

  /**
   * Clicks the "Create Challenge" button for a specific challenge type.
   */
  async selectChallengeType(challengeType: ChallengeType): Promise<void> {
    const challengeCardSelector = this.getChallengeCardSelector(challengeType);
    const createButtonSelector = `${challengeCardSelector}//button[normalize-space()='Create Challenge']`;

    const createButton = this.page.locator(createButtonSelector);
    await createButton.waitFor({ state: 'visible', timeout: 10_000 });
    await createButton.click();
  }

  /**
   * Gets the description text for a specific challenge type.
   */
  async getChallengeDescription(challengeType: ChallengeType): Promise<string | null> {
    const challengeCardSelector = this.getChallengeCardSelector(challengeType);
    const descriptionSelector = `${challengeCardSelector}//div[contains(@class,'card-description')]`;

    const descriptionElement = this.page.locator(descriptionSelector);
    await descriptionElement.waitFor({ state: 'visible', timeout: 10_000 });
    const text = await descriptionElement.textContent();
    return text?.trim() ?? null;
  }

  /**
   * Clicks the "Use Template" button for a specific template.
   */
  async selectTemplate(templateTitle: TemplateTitle): Promise<void> {
    const templateCardSelector = this.getTemplateCardSelector(templateTitle);
    const useTemplateButton = this.page.locator(`${templateCardSelector}//button`);
    await useTemplateButton.waitFor({ state: 'visible', timeout: 10_000 });
    await useTemplateButton.click();
  }

  /**
   * Gets the description text for a specific template.
   */
  async getTemplateDescription(templateTitle: TemplateTitle): Promise<string | null> {
    const templateCardSelector = this.getTemplateCardSelector(templateTitle);
    const descriptionSelector = `${templateCardSelector}//div[contains(@class,'card-body')]`;

    const descriptionElement = this.page.locator(descriptionSelector);
    await descriptionElement.waitFor({ state: 'visible', timeout: 10_000 });
    const text = await descriptionElement.textContent();
    return text?.trim() ?? null;
  }

  /**
   * Select a challenge logo by visible text.
   */
  async selectChallengeLogo(image: string): Promise<Ok | Err> {
    try {
      const logo = this.page.locator(`//div[normalize-space(text())='${image}']`);
      await logo.waitFor({ state: 'visible', timeout: 10_000 });
      await logo.click();
      return { status: 'success', message: 'desired logo selected successfully' };
    } catch (error: unknown) {
      const msg = CreateChallengePage.errMsg(error);
      console.error('Error while selecting logo in challenge:', msg);
      return { status: 'failure', message: 'desired logo failed to select', error: msg };
    }
  }

  /**
   * Assert that the element has draggable attribute equal to expectedValue.
   */
  async checkDraggable(
    locatorOrXpath: string | Locator,
    expectedValue: string | null
  ): Promise<Ok | Err & { actualValue?: string | null }> {
    try {
      const locator = this.ensureLocator(locatorOrXpath);
      await locator.waitFor({ state: 'attached', timeout: 5_000 });

      const actualValue = await locator.getAttribute('draggable'); // string | null
      assert.strictEqual(
        actualValue,
        expectedValue,
        `Expected draggable="${expectedValue}" but got "${actualValue}"`
      );

      return {
        status: 'success',
        message: `actual="${actualValue}" === expected="${expectedValue}"`,
        actualValue
      };
    } catch (error: unknown) {
      const msg = CreateChallengePage.errMsg(error);
      return {
        status: 'failure',
        message: `Expected draggable="${expectedValue}"`,
        error: msg
      };
    }
  }

  /**
   * Extracts the src of an <img> from a selector or Locator.
   */
  async imgCloudinarySrcExtract(locatorOrXpath: string | Locator): Promise<string | null> {
    try {
      const locator = this.ensureLocator(locatorOrXpath);
      await locator.waitFor({ state: 'attached', timeout: 5_000 });
      const src = await locator.getAttribute('src');
      return src ?? null;
    } catch (error: unknown) {
      const msg = CreateChallengePage.errMsg(error);
      console.error('failed to locate img src:', msg);
      return null;
    }
  }

  /**
   * Verifies that after an upload, the image src changed from OriginalSrc.
   * Pass the post-upload image selector in `locatorAfterUpload`.
   */
  async verifyFileUploaded(
    OriginalSrc: string | null,
    locatorAfterUpload: string | Locator
  ): Promise<Ok | Err> {
    try {
      const target = this.ensureLocator(locatorAfterUpload);
      await target.waitFor({ state: 'attached', timeout: 5000 });

      const updatedSrc = await target.getAttribute('src');
      console.log('new file uploaded Cloudinary url:', updatedSrc);

      if (updatedSrc && updatedSrc !== OriginalSrc) {
        return { status: 'success', message: 'file uploaded successfully' };
      }

      // Explicit failure case if src didn’t change
      return {
        status: 'failure',
        message: 'file upload did not change the image src'
      };
    } catch (error: unknown) {
      const msg = CreateChallengePage.errMsg(error);
      console.error('Upload failed:', msg);
      return { status: 'failure', message: 'failed to upload file', error: msg };
    }
  }

    async datepicker(locatorField:any,locDateNo :any){
  try {
       let dateField= this.page.locator(locatorField);
       await dateField.click();

       let dateNo=await this.page.waitForSelector(locDateNo,{timeout:5000})
        await dateNo.click();
        // await this.page.waitForTimeout(500);  
        let uf= await this.page.locator(locatorField).inputValue();
      return { status: 'success', message: 'date selected successfully', Date:uf };

  } catch (error) {
    console.error("error in selecting date from date picker",error)
    return { status: 'failure', message: 'failed to select date' };
  }
  }


}
