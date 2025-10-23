import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class TargetAudiencePage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    /**
     
     * Verifies that a specific department is visible in the user target audience table
     * @param departmentName - The department name to search for
     * @param expectedUrl - Optional URL pattern to verify we're on the correct page (defaults to challenge-privacy)
     * @returns Promise<{status: string, message: string}> - Status object indicating success/failure
     */
    
    // async verifyDepartmentInUserList(
      
    //     departmentName: string, 
    //     expectedUrl: RegExp = /\/fit\/create-challenge\/custom-challenge\/challenge-privacy/
    // ): Promise<{status: string, message: string}> {
    //     try {
    //         console.log(`🔍 Verifying department '${departmentName}' visibility in user list...`);

    //         // 1) Ensure we're on the correct page
    //         try {
    //             await expect(this.page).toHaveURL(expectedUrl);
    //         } catch (error) {
    //             return {
    //                 status: "failure",
    //                 message: `Not on expected page. Current URL: ${this.page.url()}`
    //             };
    //         }

    //         // 2) Wait for the table to render rows with some content
    //         const rows = this.page.locator('tbody tr');
    //         const rowCount = await rows.count();
            
    //         if (rowCount === 0) {
    //             return {
    //                 status: "failure",
    //                 message: "No rows found in the user table"
    //             };
    //         }

    //         console.log(`📊 Found ${rowCount} rows in table`);

    //         // 3) Helper: wait until at least one cell in the table has non-empty text
    //         try {
    //             await this.page.waitForFunction(() => {
    //                 const cells = Array.from(document.querySelectorAll('tbody tr td')) as HTMLElement[];
    //                 return cells.some(c => (c.innerText || '').trim().length > 0);
    //             }, null, { timeout: 10000 });
    //         } catch (error) {
    //             return {
    //                 status: "failure",
    //                 message: "Table rows are present but no data loaded within 10 seconds"
    //             };
    //         }

    //         // 4) Try to resolve the Department column by header name; fallback to 4th column
    //         let deptColIndex = 3; // default to 4th column (0-based index)
    //         const headerCells = this.page.locator('thead tr th');
    //         const headerCount = await headerCells.count();
            
    //         if (headerCount > 0) {
    //             const headers = (await headerCells.allInnerTexts()).map(t => t.trim().toLowerCase());
    //             const idx = headers.findIndex(h => h === 'department' || h.includes('department'));
    //             if (idx >= 0) deptColIndex = idx;
    //             console.log(`ℹ️ Resolved Department column index: ${deptColIndex + 1} (headers: ${headers.join(' | ')})`);
    //         } else {
    //             console.log('ℹ️ No table header found; using default Department column index = 4');
    //         }

    //         // 5) Read text from the resolved Department column only
    //         const deptCells = this.page.locator(`tbody tr td:nth-child(${deptColIndex + 1})`);
    //         const textsRaw = await deptCells.allInnerTexts();
    //         const texts = textsRaw.map(t => t.trim()).filter(t => t.length > 0);

    //         if (texts.length === 0) {
    //             return {
    //                 status: "failure",
    //                 message: `Department column (index ${deptColIndex + 1}) contains no data`
    //             };
    //         }

    //         // 6) Assert presence (case-insensitive)
    //         const deptLower = departmentName.toLowerCase();
    //         const hasDept = texts.some(t => t.toLowerCase() === deptLower);
            
    //         if (!hasDept) {
    //             return {
    //                 status: "failure",
    //                 message: `Expected to find department "${departmentName}" in the Department column, got: [${texts.join(' | ')}]`
    //             };
    //         }

    //         const successMessage = `Department '${departmentName}' visible in Department column (scanned ${textsRaw.length} cells, ${texts.length} non-empty)`;
    //         console.log(`✅ ${successMessage}`);
            
    //         return {
    //             status: "success",
    //             message: successMessage
    //         };

    //     } catch (error:any) {
    //         console.error(`❌ Error verifying department visibility:`, error.message);
    //         return {
    //             status: "failure",
    //             message: `Unexpected error during department verification: ${error.message}`
    //         };
    //     }
    // }

   async verifyDepartmentInUserList(
  departmentName: string
): Promise<{ status: string; message: string }> {
  try {
    console.log(`🔍 Verifying department '${departmentName}' visibility in user list...`);

    // 1️⃣ Wait for the table rows to appear
    const rows = this.page.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) {
      return {
        status: "failure",
        message: "No rows found in the user table",
      };
    }

    console.log(`📊 Found ${rowCount} rows in table`);

    // 2️⃣ Wait for non-empty cells (table data loaded)
    try {
      await this.page.waitForFunction(() => {
        const cells = Array.from(document.querySelectorAll("tbody tr td")) as HTMLElement[];
        return cells.some((c) => (c.innerText || "").trim().length > 0);
      }, null, { timeout: 10000 });
    } catch {
      return {
        status: "failure",
        message: "Table rows are present but no data loaded within 10 seconds",
      };
    }

    // 3️⃣ Dynamically detect Department column index (fallback = 4th)
    let deptColIndex = 3; // 0-based (4th column)
    const headerCells = this.page.locator("thead tr th");
    const headerCount = await headerCells.count();

    if (headerCount > 0) {
      const headers = (await headerCells.allInnerTexts()).map((t) => t.trim().toLowerCase());
      const idx = headers.findIndex((h) => h === "department" || h.includes("department"));
      if (idx >= 0) deptColIndex = idx;
      console.log(
        `ℹ️ Resolved Department column index: ${deptColIndex + 1} (headers: ${headers.join(" | ")})`
      );
    } else {
      console.log("ℹ️ No table header found; using default Department column index = 4");
    }

    // 4️⃣ Extract Department column data
    const deptCells = this.page.locator(`tbody tr td:nth-child(${deptColIndex + 1})`);
    const textsRaw = await deptCells.allInnerTexts();
    const texts = textsRaw.map((t) => t.trim()).filter((t) => t.length > 0);

    if (texts.length === 0) {
      return {
        status: "failure",
        message: `Department column (index ${deptColIndex + 1}) contains no data`,
      };
    }

    // 5️⃣ Case-insensitive match for department name
    const deptLower = departmentName.toLowerCase();
    const hasDept = texts.some((t) => t.toLowerCase() === deptLower);

    if (!hasDept) {
      return {
        status: "failure",
        message: `Expected to find department "${departmentName}" in the Department column, got: [${texts.join(
          " | "
        )}]`,
      };
    }

    const successMessage = `✅ Department '${departmentName}' visible in Department column (scanned ${textsRaw.length} cells, ${texts.length} non-empty)`;
    console.log(successMessage);

    return {
      status: "success",
      message: successMessage,
    };
  } catch (error: any) {
    console.error(`❌ Error verifying department visibility:`, error.message);
    return {
      status: "failure",
      message: `Unexpected error during department verification: ${error.message}`,
    };
  }
}


    async selectDepartmentIsIn(departmentName: string): Promise<{status: string, message: string}> {
        try {
            console.log(`🎯 Selecting department '${departmentName}' in IS IN condition...`);
            
            // Click the IS IN dropdown
            const result1 = await this.clickElement(`//span[normalize-space(.)='is in']/ancestor::div[contains(@class,'justify-center')]//following-sibling::div[@class='flex flex-1 justify-center']//span[normalize-space(.)='Vantage Circle']`);
            if (result1.status === "failure") return result1;
            
            await this.page.waitForTimeout(250);
            
            // Click the checkbox if present
            await this.clickElement("//div//vc-checkbox//input[1]");
            await this.page.waitForTimeout(250);
            
            // Select the specific department
            const result2 = await this.clickElement(`//li[@title='${departmentName}']`);
            if (result2.status === "failure") return result2;
            
            await this.page.waitForTimeout(500);
            
            return {
                status: "success",
                message: `Successfully selected department '${departmentName}' in IS IN condition`
            };
            
        } catch (error:any) {
            return {
                status: "failure",
                message: `Failed to select department '${departmentName}': ${error.message}`
            };
        }
    }

    /**
     * Switches from "IS IN" to "IS NOT IN" condition
     * @returns Promise<{status: string, message: string}>
     */
    async switchToIsNotIn(): Promise<{status: string, message: string}> {
        try {
            console.log("🔄 Switching from IS IN to IS NOT IN...");
            
            await this.clickElement(`//span[normalize-space(.)='is in']`);
            await this.page.waitForTimeout(500);
            
            const result = await this.clickElement(`//span[normalize-space(.)='is not in']`);
            await this.page.waitForTimeout(500);
            
            return result.status === "success" ? 
                { status: "success", message: "Successfully switched to IS NOT IN" } : 
                result;
                
        } catch (error:any) {
            return {
                status: "failure",
                message: `Failed to switch to IS NOT IN: ${error.message}`
            };
        }
    }

    /**
     * Verifies that a specific country is visible in the user target audience table
     * @param countryName - The country name to search for
     * @param expectedUrl - Optional URL pattern to verify we're on the correct page (defaults to challenge-privacy)
     * @returns Promise<{status: string, message: string}> - Status object indicating success/failure
     */
    // async verifyCountryInUserList(
    //     countryName: string, 
    //     expectedUrl: RegExp = /\/fit\/create-challenge\/custom-challenge\/challenge-privacy/
    // ): Promise<{status: string, message: string}> {
    //     try {
    //         console.log(`🌍 Verifying country '${countryName}' visibility in user list...`);

    //         // 1) Ensure we're on the correct page
    //         try {
    //             await expect(this.page).toHaveURL(expectedUrl);
    //         } catch (error) {
    //             return {
    //                 status: "failure",
    //                 message: `Not on expected page. Current URL: ${this.page.url()}`
    //             };
    //         }

    //         // 2) Wait for the table to render rows with some content
    //         const rows = this.page.locator('tbody tr');
    //         const rowCount = await rows.count();
            
    //         if (rowCount === 0) {
    //             return {
    //                 status: "failure",
    //                 message: "No rows found in the user table"
    //             };
    //         }

    //         console.log(`📊 Found ${rowCount} rows in table`);

    //         // 3) Helper: wait until at least one cell in the table has non-empty text
    //         try {
    //             await this.page.waitForFunction(() => {
    //                 const cells = Array.from(document.querySelectorAll('tbody tr td')) as HTMLElement[];
    //                 return cells.some(c => (c.innerText || '').trim().length > 0);
    //             }, null, { timeout: 5000 });
    //         } catch (error) {
    //             return {
    //                 status: "failure",
    //                 message: "Table rows are present but no data loaded within 10 seconds"
    //             };
    //         }

    //         // 4) Try to resolve the Country column by header name; fallback to 5th column
    //         let countryColIndex = 4; // default to 5th column (0-based index)
    //         const headerCells = this.page.locator('thead tr th');
    //         const headerCount = await headerCells.count();
            
    //         if (headerCount > 0) {
    //             const headers = (await headerCells.allInnerTexts()).map(t => t.trim().toLowerCase());
    //             const idx = headers.findIndex(h => h === 'country' || h.includes('country'));
    //             if (idx >= 0) countryColIndex = idx;
    //             console.log(`ℹ️ Resolved Country column index: ${countryColIndex + 1} (headers: ${headers.join(' | ')})`);
    //         } else {
    //             console.log('ℹ️ No table header found; using default Country column index = 5');
    //         }

    //         // 5) Read text from the resolved Country column only
    //         const countryCells = this.page.locator(`tbody tr td:nth-child(${countryColIndex + 1})`);
    //         const textsRaw = await countryCells.allInnerTexts();
    //         const texts = textsRaw.map(t => t.trim()).filter(t => t.length > 0);

    //         if (texts.length === 0) {
    //             return {
    //                 status: "failure",
    //                 message: `Country column (index ${countryColIndex + 1}) contains no data`
    //             };
    //         }

    //         // 6) Assert presence (case-insensitive)
    //         const countryLower = countryName.toLowerCase();
    //         const hasCountry = texts.some(t => t.toLowerCase() === countryLower);
            
    //         if (!hasCountry) {
    //             return {
    //                 status: "failure",
    //                 message: `Expected to find country "${countryName}" in the Country column, got: [${texts.join(' | ')}]`
    //             };
    //         }

    //         const successMessage = `Country '${countryName}' visible in Country column (scanned ${textsRaw.length} cells, ${texts.length} non-empty)`;
    //         console.log(`✅ ${successMessage}`);
            
    //         return {
    //             status: "success",
    //             message: successMessage
    //         };

    //     } catch (error:any) {
    //         console.error(`❌ Error verifying country visibility:`, error.message);
    //         return {
    //             status: "failure",
    //             message: `Unexpected error during country verification: ${error.message}`
    //         };
    //     }
    // }



async verifyCountryInUserList(
    countryName: string
    ): Promise<{ status: string; message: string }> {
  
    try {
         console.log(`🌍 Verifying country '${countryName}' visibility in user list...`);

    // 1) Wait for the table to render rows with some content
    const rows = this.page.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      return {
        status: "failure",
        message: "No rows found in the user table",
      };
    }

    console.log(`📊 Found ${rowCount} rows in table`);

    // 2) Wait until at least one cell in the table has non-empty text
    try {
      await this.page.waitForFunction(() => {
        const cells = Array.from(document.querySelectorAll('tbody tr td')) as HTMLElement[];
        return cells.some((c) => (c.innerText || "").trim().length > 0);
      }, null, { timeout: 5000 });
    } catch {
      return {
        status: "failure",
        message: "Table rows are present but no data loaded within 5 seconds",
      };
    }

    // 3) Resolve the "Country" column dynamically
    let countryColIndex = 4; // default (5th column)
    const headerCells = this.page.locator('thead tr th');
    const headerCount = await headerCells.count();

    if (headerCount > 0) {
      const headers = (await headerCells.allInnerTexts()).map((t) => t.trim().toLowerCase());
      const idx = headers.findIndex((h) => h === "country" || h.includes("country"));
      if (idx >= 0) countryColIndex = idx;
      console.log(
        `ℹ️ Resolved Country column index: ${countryColIndex + 1} (headers: ${headers.join(" | ")})`
      );
    } else {
      console.log("ℹ️ No table header found; using default Country column index = 5");
    }

    // 4) Read text from the resolved Country column only
    const countryCells = this.page.locator(`tbody tr td:nth-child(${countryColIndex + 1})`);
    const textsRaw = await countryCells.allInnerTexts();
    const texts = textsRaw.map((t) => t.trim()).filter((t) => t.length > 0);

    if (texts.length === 0) {
      return {
        status: "failure",
        message: `Country column (index ${countryColIndex + 1}) contains no data`,
      };
    }

    // 5) Assert presence (case-insensitive)
    const countryLower = countryName.toLowerCase();
    const hasCountry = texts.some((t) => t.toLowerCase() === countryLower);

    if (!hasCountry) {
      return {
        status: "failure",
        message: `Expected to find country "${countryName}" in the Country column, got: [${texts.join(
          " | "
        )}]`,
      };
    }

    const successMessage = `✅ Country '${countryName}' visible in Country column (scanned ${textsRaw.length} cells, ${texts.length} non-empty)`;
    console.log(successMessage);

    return {
      status: "success",
      message: successMessage,
    };
  } catch (error: any) {
    console.error(`❌ Error verifying country visibility:`, error.message);
    return {
      status: "failure",
      message: `Unexpected error during country verification: ${error.message}`,
    };
  }
}

    /**
     * Alternative method to verify country using the specific XPath locator you provided
     * @param countryName - The country name to search for
     * @param expectedUrl - Optional URL pattern to verify we're on the correct page
     * @returns Promise<{status: string, message: string}>
     */
    async verifyCountryInUserListByXPath(
        countryName: string, 
        expectedUrl: RegExp = /\/fit\/create-challenge\/custom-challenge\/challenge-privacy/
    ): Promise<{status: string, message: string}> {
        try {
            console.log(`🌍 Verifying country '${countryName}' visibility using XPath locator...`);

            // 1) Ensure we're on the correct page
            try {
                await expect(this.page).toHaveURL(expectedUrl);
            } catch (error) {
                return {
                    status: "failure",
                    message: `Not on expected page. Current URL: ${this.page.url()}`
                };
            }

            // 2) Wait for table to load
            const rows = this.page.locator('tbody tr');
            const rowCount = await rows.count();
            
            if (rowCount === 0) {
                return {
                    status: "failure",
                    message: "No rows found in the user table"
                };
            }

            console.log(`📊 Found ${rowCount} rows in table`);

            // 3) Use the specific XPath locator to find the country
            const countryLocator = this.page.locator(`//tbody//td[normalize-space(.)='${countryName}']`);
            
            try {
                // Wait for the element to be visible
                await countryLocator.waitFor({ state: 'visible', timeout: 10000 });
                
                // Verify it exists
                const count = await countryLocator.count();
                if (count > 0) {
                    const successMessage = `Country '${countryName}' found in table (${count} occurrence(s))`;
                    console.log(`✅ ${successMessage}`);
                    return {
                        status: "success",
                        message: successMessage
                    };
                } else {
                    return {
                        status: "failure",
                        message: `Country '${countryName}' not found in table using XPath locator`
                    };
                }
                
            } catch (error:any) {
                return {
                    status: "failure",
                    message: `Country '${countryName}' not visible in table within timeout period`
                };
            }

        } catch (error:any) {
            console.error(`❌ Error verifying country visibility with XPath:`, error.message);
            return {
                status: "failure",
                message: `Unexpected error during country verification: ${error.message}`
            };
        }
    }
}
