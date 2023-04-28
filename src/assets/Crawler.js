import playwright, { Page } from 'playwright';
import { Cheerio } from 'cheerio';

export class Crawler {
    constructor() {
        (async () => {
          this.browser = await playwright.chromium.launch({ headless: false });
          this.page = await this.browser.newPage();
          await this.page.setViewportSize({ width: 800, height: 600 });
        })();
      }
    
    async goToPage(url) {
        await this.page.goto(url.includes("://") ? url : "http://" + url);
        this.client = await this.page.context().newCDPSession(this.page);
        this.pageElementBuffer = {};
    }
    
    async scroll(direction) {
        if (direction === "up") {
          await this.page.evaluate(
            `window.scrollBy(0, -window.innerHeight);`
          );
        } else if (direction === "down") {
          await this.page.evaluate(
            `window.scrollBy(0, window.innerHeight);`
          );
        }
    }
  
    async click(id) {
        // Inject javascript into the page which removes the target= attribute from all links
        await this.page.evaluate(() => {
            const links = document.getElementsByTagName("a");
            for (let i = 0; i < links.length; i++) {
                links[i].removeAttribute("target");
            }
        });

        const element = this.pageElementBuffer.get(parseInt(id));
        if (element) {
            const x = element.center_x;
            const y = element.center_y;
            await this.page.mouse.click(x, y);
        } else {
            console.log("Could not find element");
        }
    }

    async type(id, text) {
        await this.click(id);
        await this.page.keyboard.type(text);
    }

    async enter() {
        await this.page.keyboard.press("Enter");
    }

    async searchGoogle(query) {
        await this.page.goto("https://www.google.com");
        const searchBox = this.page.locator('textarea[name="q"]');
        await searchBox.fill(query);
        await searchBox.press("Enter");
        // Wait for search results to load
        await this.page.waitForLoadState("networkidle");
    }

    async summarizeResults() {
        const results = [];
        for (let i = 0; i < 3; i++) {
            try {
                // Get the search result URL
                const link = this.page.locator(".tF2Cxc a[href]").nth(i);
                const url = await link.getAttribute("href");

                // Navigate to the search result URL
                await this.page.goto(url, {timeout: 10000});
                await this.page.waitForLoadState("networkidle");

                // Extract the main content using Cheerio
                const htmlContent = await this.page.content();
                const $ = Cheerio.load(htmlContent);
                const mainContent = $("body");

                // Append the main content to the results array
                results.push(mainContent);
            } catch {
                console.log(`Error navigating to ${url}`);
            }
        }
        return results;
    }

    async snapshotAsFormattedText() {
        const blackListedElements = new Set([
          'html', 'head', 'title', 'meta', 'iframe', 'body', 'script', 'style', 'path', 'svg', 'br', '::marker'
        ]);
    
        const htmlContent = await this.page.content();
        const $ = cheerio.load(htmlContent);
        const elements = $('body *');
    
        let formattedText = 'CURRENT BROWSER CONTENT:\n------------------\n';
    
        elements.each((index, element) => {
          const tagName = element.tagName.toLowerCase();
    
          if (!blackListedElements.has(tagName)) {
            const id = index + 1;
            const elementText = $(element).text().trim();
    
            if (elementText) {
              formattedText += `<${tagName} id=${id}>${elementText}</${tagName}>\n`;
            }
          }
        });
    
        return formattedText;
    }
}