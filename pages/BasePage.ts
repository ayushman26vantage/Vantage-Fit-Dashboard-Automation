// import { Page } from '@playwright/test';
// import { expect } from '@playwright/test';
// const assert = require('assert');
// export class BasePage {
//     protected page: Page;
//     protected readonly baseUrl = 'https://api.vantagecircle.co.in';

//     constructor(page: Page) {
//         this.page = page;
//     }

//     async navigate(path: string = '') {
//         const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
//         await this.page.goto(url);
//     }

//     async getTitle() {
//         return await this.page.title();
//     }

//     async waitForElement(selector: string, timeout: number = 10000) {
//         try{
//         await this.page.waitForSelector(selector, { timeout });
//         return{ status:"success", message:"element found within time frame"}
//         }catch(error){
//         console.error("error while waiting for element", error.message)
//         return{ status:"failure" , message:"element couldnt be found within time frame"}
//     }
// }
    

//     async clickElement(selector: string, timeout: number = 30000) {
//         try{
//         await this.waitForElement(selector, timeout);
//         await this.page.click(selector);
//            return{status:"success", message:`successfully clicked the element: ${selector}`}
//         }catch(error){
//             console.error("unable to click targeted element", error.message);
//             return{status:"failure", message:`failed to click the element: ${selector}`}
//         }
//     }

//     async clickElementByText(text: string, elementType: string = '*', timeout: number = 30000) {
//         const selector = `//${elementType}[normalize-space(text())='${text}']`;
//         return await this.clickElement(selector, timeout);
//     }

//     async findDropdownOption(dropdownText: string, optionText: string, timeout: number = 30000) {
//         try {
//             // Wait for dropdown to be visible
//             await this.page.waitForSelector(`//*[contains(text(), '${dropdownText}')]`, { timeout });
            
//             // Click on dropdown
//             await this.page.click(`//*[contains(text(), '${dropdownText}')]`);
//             await this.page.waitForTimeout(1000);
            
//             // Wait for and click option
//             const optionSelector = `//*[contains(text(), '${optionText}')]`;
//             await this.page.waitForSelector(optionSelector, { timeout });
//             await this.page.click(optionSelector);
            
//             return {status: "success", message: `Successfully selected '${optionText}' from '${dropdownText}' dropdown`};
//         } catch (error) {
//             console.error("Error selecting dropdown option:", error.message);
//             return {status: "failure", message: `Failed to select '${optionText}' from '${dropdownText}' dropdown`};
//         }
//     }

//     async fillInput(selector: string, value: string) {
//         try{
//         await this.waitForElement(selector);
//         await this.page.fill(selector, value);
//         return{ status:"success", message:"field is inserted correctly"}
//     }catch(error){
//         console.error("error while FILLING INPUT to fields", error.message)
//         return{ status:"failure" , message:"field input insertion unsuccessful"}
//     }
//     }
//     async fileUpload(selector: string, filename: string) {
//         try {

//         const [fileChooser] = await Promise.all([
//           this.page.waitForEvent('filechooser'),
//           this.page.click(selector) ]);

//          await fileChooser.setFiles(filename);
//         return { status:"success", message: `successfully uploaded file in: ${filename}` };  
       
//     }catch(error){
//             console.error("error while uploading logo", (error as Error).message);
//             return { status:"failure", message: `failed to upload file in: ${filename}` };
//         }
//     }

  
//     async getFileSizeInKB(filePath: string): Promise<number> {
//         try {
//             const fs = require('fs');
//             const stats = fs.statSync(filePath);
//             const fileSizeInKB = Math.ceil(stats.size / 1024); // Convert to KB and round up
//             return fileSizeInKB;
//         } catch (error) {
//             console.error(`Error getting file size for ${filePath}:`, (error as Error).message);
//             return 0;
//         }
//     }


//     async fileUploadWithValidation(selector: string, filename: string, maxSizeKB: number = 500) {
//         try {
//             // Check file size first
//             const fileSizeKB = await this.getFileSizeInKB(filename);
//             console.log(`📁 File size: ${fileSizeKB} KB (limit: ${maxSizeKB} KB)`);
            
//             if (fileSizeKB > maxSizeKB) {
//                 return { 
//                     status: "size_exceeded", 
//                     message: `File size ${fileSizeKB} KB exceeds limit of ${maxSizeKB} KB`,
//                     fileSizeKB,
//                     maxSizeKB
//                 };
//             }
            
//             // If size is valid, proceed with upload
//             const uploadResult = await this.fileUpload(selector, filename);
//             return {
//                 ...uploadResult,
//                 fileSizeKB,
//                 maxSizeKB
//             };
            
//         } catch (error) {
//             console.error("Error in file upload with validation:", (error as Error).message);
//             return { 
//                 status: "failure", 
//                 message: `Failed to upload file with validation: ${filename}`,
//                 fileSizeKB: 0,
//                 maxSizeKB
//             };
//         }
//     }

//     async assertLink(expectedLink) {
//     try {
//         await this.page.waitForTimeout(1000);
//         const actualLink = this.page.url(); // FIX: Await the async call
//         console.log(`[INFO] Actual URL: ${actualLink}`);
//         console.log(`[INFO] Expected URL: ${expectedLink}`);

//         // Extract part after '/ng' and strip query params directly here
//         const actualIdx = actualLink.indexOf('/fit');
//         const expectedIdx = expectedLink.indexOf('/fit');

//         const actualPath = actualIdx === -1 ? '' : actualLink.substring(actualIdx).split('?')[0];
//         const expectedPath = expectedIdx === -1 ? '' : expectedLink.substring(expectedIdx).split('?')[0];

//         console.log(`[INFO] Actual path after /fit: ${actualPath}`);
//         console.log(`[INFO] Expected path after /fit: ${expectedPath}`);

//         if (!actualPath.includes(expectedPath)) {
//             throw new Error(`Actual URL path "${actualPath}" does not include expected path "${expectedPath}"`);
//         }

//         console.log(`[INFO] URL path verification passed.`);
//         return { status: "success", message: `Actual URL path includes expected path: ${expectedPath}` };
//     } catch (error) {
//         console.error(`[ERROR] URL assertion failed: ${error.message}`);
//         return { status:"failure", message: error.message };
//     }
// }



//       async clickIfVisible(selector: string, timeout: number = 3000) {
//         try {
//             const locator = this.page.locator(selector);
//             try {
//                 await locator.waitFor({ state: 'visible', timeout });
//             } catch {
//                null
//             }
//             await locator.click();
//             return { status: 'success', message: `Clicked visible element: ${selector}` };
//         } catch (error) {
//             console.error('error while conditionally clicking element', (error as Error).message);
//             return { status: 'failure', message: `Error clicking element: ${selector}` };
//         }
//     }


// async assertText(locator, expectedText) {
//   try {
    
//     await this.page.locator(locator).waitFor({ state: 'attached', timeout: 5000 });
//     const actualText = await this.page.locator(locator).innerText();

//     assert.strictEqual(
//       actualText.trim(), expectedText, `Expected text "${expectedText}" but got "${actualText}"`
//     );

//     return {
//       status: 'success', message: `✅ Text matched: actual "${actualText}" === expected "${expectedText}"`,
//       actualText: actualText
//     };

//   } catch (error) {
//     console.error(`❌ Text assertion failed:`, error.message);
//     return {
//       status: 'failure',  message: `Failed: Expected "${expectedText}"`,
//       error: error.message
//     };
//   }
// }



//   async clickElementv2(selector: string, timeout: number = 30000) {
//         try{
//         await this.waitForElement(selector, timeout);
//         await this.page.locator(selector).click();
//            return{status:"success", message:`successfully clicked the element: ${selector}`}
//         }catch(error){
//             console.error("unable to click targeted element", error.message);
//             return{status:"failure", message:`failed to click the element: ${selector}`}
//         }
//     }



// } 


import { Page, expect } from '@playwright/test';
import assert from 'assert';

type Result =
  | { status: 'success'; message: string; [k: string]: unknown }
  | { status: 'failure' | 'size_exceeded'; message: string; [k: string]: unknown };

export class BasePage {
  protected page: Page;
  protected readonly baseUrl = 'https://api.vantagecircle.co.in';

  constructor(page: Page) {
    this.page = page;
  }

  // Helper to safely unwrap error messages
  private errMsg(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  async navigate(path: string = ''): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async waitForElement(selector: string, timeout: number = 10_000): Promise<Result> {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return { status: 'success', message: 'element found within time frame' };
    } catch (error: unknown) {
      console.error('error while waiting for element', this.errMsg(error));
      return { status: 'failure', message: 'element couldn’t be found within time frame' };
    }
  }

  async clickElement(selector: any, timeout: number = 30000): Promise<Result> {
    try {
      await this.waitForElement(selector, timeout);
      await this.page.click(selector);
      return { status: 'success', message: `successfully clicked the element: ${selector}` };
    } catch (error: unknown) {
      console.error('unable to click targeted element', this.errMsg(error));
      return { status: 'failure', message: `failed to click the element: ${selector}` };
    }
  }

  async clickElementByText(text: string, elementType: string = '*', timeout: number = 30_000): Promise<Result> {
    const selector = `//${elementType}[normalize-space(text())='${text}']`;
    return this.clickElement(selector, timeout);
  }

  async findDropdownOption(dropdownText: string, optionText: string, timeout: number = 30_000): Promise<Result> {
    try {
      await this.page.waitForSelector(`//*[contains(text(), '${dropdownText}')]`, { timeout });
      await this.page.click(`//*[contains(text(), '${dropdownText}')]`);
      await this.page.waitForTimeout(1_000);

      const optionSelector = `//*[contains(text(), '${optionText}')]`;
      await this.page.waitForSelector(optionSelector, { timeout });
      await this.page.click(optionSelector);

      return {
        status: 'success',
        message: `Successfully selected '${optionText}' from '${dropdownText}' dropdown`,
      };
    } catch (error: unknown) {
      console.error('Error selecting dropdown option:', this.errMsg(error));
      return {
        status: 'failure',
        message: `Failed to select '${optionText}' from '${dropdownText}' dropdown`,
      };
    }
  }

  async fillInput(selector: string, value:any): Promise<Result> {
    try {
      await this.waitForElement(selector);
      await this.page.fill(selector, value);
      return { status: 'success', message: 'field is inserted correctly' };
    } catch (error: unknown) {
      console.error('error while FILLING INPUT to fields', this.errMsg(error));
      return { status: 'failure', message: 'field input insertion unsuccessful' };
    }
  }

  async fileUpload(selector: string, filename: string): Promise<Result> {
    try {
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser'),
        this.page.click(selector),
      ]);

      await fileChooser.setFiles(filename);
      return { status: 'success', message: `successfully uploaded file: ${filename}` };
    } catch (error: unknown) {
      console.error('error while uploading logo', this.errMsg(error));
      return { status: 'failure', message: `failed to upload file: ${filename}` };
    }
  }

  async getFileSizeInKB(filePath: string): Promise<number> {
    try {
      const fs = require('fs');
      const stats = fs.statSync(filePath);
      return Math.ceil(stats.size / 1024);
    } catch (error: unknown) {
      console.error(`Error getting file size for ${filePath}:`, this.errMsg(error));
      return 0;
    }
  }

  async fileUploadWithValidation(selector: string, filename: string, maxSizeKB: number = 500): Promise<Result> {
    try {
      const fileSizeKB = await this.getFileSizeInKB(filename);
      console.log(`📁 File size: ${fileSizeKB} KB (limit: ${maxSizeKB} KB)`);

      if (fileSizeKB > maxSizeKB) {
        return {
          status: 'size_exceeded',
          message: `File size ${fileSizeKB} KB exceeds limit of ${maxSizeKB} KB`,
          fileSizeKB,
          maxSizeKB,
        };
      }

      const uploadResult = await this.fileUpload(selector, filename);
      return { ...uploadResult, fileSizeKB, maxSizeKB };
    } catch (error: unknown) {
      console.error('Error in file upload with validation:', this.errMsg(error));
      return {
        status: 'failure',
        message: `Failed to upload file with validation: ${filename}`,
        fileSizeKB: 0,
        maxSizeKB,
      };
    }
  }

  async assertLink(expectedLink: string): Promise<Result> {
    try {
      await this.page.waitForTimeout(1000);
      const actualLink: string = this.page.url(); // Playwright's page.url() is synchronous

      console.log(`[INFO] Actual URL: ${actualLink}`);
      console.log(`[INFO] Expected URL: ${expectedLink}`);

      // Example: focus on shared path from '/fit' onward (strip query)
      const anchor = '/fit';
      const actualIdx = actualLink.indexOf(anchor);
      const expectedIdx = expectedLink.indexOf(anchor);

      const actualPath = actualIdx === -1 ? '' : actualLink.substring(actualIdx).split('?')[0];
      const expectedPath = expectedIdx === -1 ? '' : expectedLink.substring(expectedIdx).split('?')[0];

      console.log(`[INFO] Actual path after ${anchor}: ${actualPath}`);
      console.log(`[INFO] Expected path after ${anchor}: ${expectedPath}`);

      if (!actualPath.includes(expectedPath)) {
        throw new Error(`Actual URL path "${actualPath}" does not include expected path "${expectedPath}"`);
      }

      console.log('[INFO] URL path verification passed.');
      return { status: 'success', message: `Actual URL path includes expected path: ${expectedPath}` };
    } catch (error: unknown) {
      const msg = this.errMsg(error);
      console.error('[ERROR] URL assertion failed:', msg);
      return { status: 'failure', message: msg };
    }
  }

  async clickIfVisible(selector: string, timeout: number = 3000): Promise<Result> {
    try {
      const locator = this.page.locator(selector);
      try {
        await locator.waitFor({ state: 'visible', timeout });
      } catch {
        // element not visible within timeout — we still attempt click; Playwright will throw if not actionable
      }
      await locator.click();
      return { status: 'success', message: `Clicked visible element: ${selector}` };
    } catch (error: unknown) {
      console.error('error while conditionally clicking element', this.errMsg(error));
      return { status: 'failure', message: `Error clicking element: ${selector}` };
    }
  }

  // async assertText(locator: string, expectedText:any): Promise<Result> {
  //   try {
  //     const el = this.page.locator(locator);
  //     await el.waitFor({ state: 'attached', timeout: 5_000 });
  //     const actualText = (await el.innerText()).trim();

  //     assert.strictEqual(
  //       actualText,
  //       expectedText,
  //       `Expected text "${expectedText}" but got "${actualText}"`
  //     );

  //     return {
  //       status: 'success',
  //       message: `✅ Text matched: actual "${actualText}" === expected "${expectedText}"`,
  //       actualText,
  //     };
  //   } catch (error: unknown) {
  //     const msg = this.errMsg(error);
  //     console.error('❌ Text assertion failed:', msg);
  //     return {
  //       status: 'failure',
  //       message: `Failed: Expected "${expectedText}"`,
  //       error: msg,
  //     };
  //   }
  // }

  async clickElementv2(selector: string, timeout: number = 30_000): Promise<Result> {
    try {
      await this.waitForElement(selector, timeout);
      await this.page.locator(selector).click();
      return { status: 'success', message: `successfully clicked the element: ${selector}` };
    } catch (error: unknown) {
      console.error('unable to click targeted element', this.errMsg(error));
      return { status: 'failure', message: `failed to click the element: ${selector}` };
    }
  }

  // BasePage.ts
async assertText(xpath: any, expected: any) {
  try {
    const el = this.page.locator(`xpath=${xpath}`);
    await el.waitFor({ state: "visible", timeout: 7000 });

    const raw = (await el.textContent()) ?? "";

    // Normalize whitespace (collapse + trim)
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

    const actualText = normalize(raw);
    const expectedText = normalize(expected);

    if (actualText !== expectedText) {
      throw new Error(
        `Expected text "${expectedText}" but got "${actualText}"`
      );
    }
     console.log("[INFO] Text assertion passed:", `Got '${actualText}' which was expected`);
    return {
      status: "success" ,
      message: `✅ Text matched: actual "${actualText}" === expected "${expectedText}"`,
      actualText,
      expectedText,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : JSON.stringify(error);

    console.error("[INFO] Text assertion failed:", msg);

    return {
      status: "failure" ,
      message: `❌ Failed: Expected "${expected}"`,
      error: msg,
    };
  }
}


}
