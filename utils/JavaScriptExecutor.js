/**
 * JavaScript Executor utility for Playwright (similar to Selenium's JavaScriptExecutor)
 * Contains methods to force click elements using JavaScript execution
 */

class JavaScriptExecutor {
    constructor(page) {
        this.page = page;
    }

   
    async forceClickByXPath(xpath) {
        try {
            const clicked = await this.page.evaluate((xpath) => {
                const element = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                
                if (element) {
                    // Scroll element into view
                    element.scrollIntoView({ behavior: 'auto', block: 'center' });
                    
                    // Force click using JavaScript
                    element.click();
                    return true;
                }
                return false;
            }, xpath);
            
            return clicked;
        } catch (error) {
            console.error(`Error in forceClickByXPath: ${error.message}`);
            return false;
        }
    }

 

    async forceClickBySelector(selector) {
        try {
            const clicked = await this.page.evaluate((selector) => {
                const element = document.querySelector(selector);
                
                if (element) {
                    // Scroll element into view
                    element.scrollIntoView({ behavior: 'auto', block: 'center' });
                    
                    // Force click using JavaScript
                    element.click();
                    return true;
                }
                return false;
            }, selector);
            
            return clicked;
        } catch (error) {
            console.error(`Error in forceClickBySelector: ${error.message}`);
            return false;
        }
    }


    async forceClickWithRetry(locator, locatorType = 'xpath', maxRetries = 3, retryDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            console.log(`🔄 Force click attempt ${attempt}/${maxRetries}`);
            
            let clicked = false;
            
            if (locatorType === 'xpath') {
                clicked = await this.forceClickByXPath(locator);
            } else if (locatorType === 'css') {
                clicked = await this.forceClickBySelector(locator);
            }
            
            if (clicked) {
                console.log(`✅ Force click successful on attempt ${attempt}`);
                 return{ status:"success", message:"Successfully clicked element" }
            }
            
            if (attempt < maxRetries) {
                console.log(`⚠️  Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
                await this.page.waitForTimeout(retryDelay);
            }

        }
        
        console.log(`❌ All ${maxRetries} force click attempts failed`);
        return{status:"failure", message:"Failed to click element"}
    }

   
    async executeCustomScript(customScript) {
        try {
            const result = await this.page.evaluate(customScript);
            return result;
        } catch (error) {
            console.error(`Error in executeCustomScript: ${error.message}`);
            return null;
        }
    }

  
    async forceClickByText(text, tagName = '*') {
        try {
            const clicked = await this.page.evaluate(({ text, tagName }) => {
                // Use XPath to find element by text content
                const xpath = `//${tagName}[contains(normalize-space(text()), '${text}')]`;
                const element = document.evaluate(
                    xpath,
                    document,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                
                if (element) {
                    element.scrollIntoView({ behavior: 'auto', block: 'center' });
                    element.click();
                    return true;
                }
                return false;
            }, { text, tagName });
            
            return clicked;
        } catch (error) {
            console.error(`Error in forceClickByText: ${error.message}`);
            return false;
        }
    }

    
    async elementExists(locator, locatorType = 'xpath') {
        try {
            const exists = await this.page.evaluate(({ locator, locatorType }) => {
                let element = null;
                
                if (locatorType === 'xpath') {
                    element = document.evaluate(
                        locator,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    ).singleNodeValue;
                } else if (locatorType === 'css') {
                    element = document.querySelector(locator);
                }
                
                return element !== null;
            }, { locator, locatorType });
            
            return exists;
        } catch (error) {
            console.error(`Error in elementExists: ${error.message}`);
            return false;
        }
    }


    
    async getElementAttribute(locator, attributeName, locatorType = 'xpath') {
        try {
            const attributeValue = await this.page.evaluate(({ locator, locatorType, attributeName }) => {
                let element = null;
                
                if (locatorType === 'xpath') {
                    element = document.evaluate(
                        locator,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    ).singleNodeValue;
                } else if (locatorType === 'css') {
                    element = document.querySelector(locator);
                }
                
                return element ? element.getAttribute(attributeName) : null;
            }, { locator, locatorType, attributeName });
            
            return attributeValue;
        } catch (error) {
            console.error(`Error in getElementAttribute: ${error.message}`);
            return null;
        }
    }

    
    async highlightElement(locator, locatorType = 'xpath') {
        try {
            const highlighted = await this.page.evaluate(({ locator, locatorType }) => {
                let element = null;
                
                if (locatorType === 'xpath') {
                    element = document.evaluate(
                        locator,
                        document,
                        null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE,
                        null
                    ).singleNodeValue;
                } else if (locatorType === 'css') {
                    element = document.querySelector(locator);
                }
                
                if (element) {
                    element.style.border = '3px solid red';
                    element.style.backgroundColor = 'yellow';
                    return true;
                }
                return false;
            }, { locator, locatorType });
            
            return highlighted;
        } catch (error) {
            console.error(`Error in highlightElement: ${error.message}`);
            return false;
        }
    }


    async scroll(direction = 'down', locator = null, locatorType = 'xpath') {
    try {
        const result = await this.page.evaluate(({ direction, locator, locatorType }) => {
            // Helper to find element
            const findElement = () => {
                if (!locator) return null;
                return locatorType === 'xpath'
                    ? document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
                    : document.querySelector(locator);
            };

            // If locator is provided, scroll to the element
            if (locator) {
                const el = findElement();
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return 'scrolled-to-element';
                }
                return 'element-not-found';
            }

            // Default page scrolling
            switch ((direction || '').toLowerCase()) {
                case 'up':
                    window.scrollBy(0, -window.innerHeight);
                    return 'scrolled-up';
                case 'down':
                    window.scrollBy(0, window.innerHeight);
                    return 'scrolled-down';
                case 'top':
                    window.scrollTo(0, 0);
                    return 'scrolled-top';
                case 'bottom':
                    window.scrollTo(0, Math.max(
                        document.body.scrollHeight,
                        document.documentElement.scrollHeight
                    ));
                    return 'scrolled-bottom';
                default:
                    return 'invalid-direction';
            }
        }, { direction, locator, locatorType });

        // Return result summary
        const success = !['element-not-found', 'invalid-direction'].includes(result);
        return {
            status: success ? "success" : "failure",
            message: result
        };
    } catch (error) {
        console.error(`Error in scroll: ${error.message}`);
        return { status: "failure", message: error.message };
    }
}

    



}

module.exports = JavaScriptExecutor;