import playwright from 'playwright';
import Cheerio from 'cheerio';

class Crawler {
  async init() {
    this.browser = await playwright.chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 800, height: 600 });
  }
    
  async goToPage(url) {
    try {
      await this.page.goto("about:blank"); // Clear the current page's state
      await this.page.goto(url.includes("://") ? url : "http://" + url, { timeout: 60000 }); // Set timeout to 60 seconds
      this.client = this.page.context();
    } catch (error) {
      console.error(`Error navigating to ${url}: ${error.message}`);
    }
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
    const element = this.page.locator(id);
    if (element) {
      await element.click('left');
    } else {
      console.log(`Could not find element with selector "${selector}"`);
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
    await this.goToPage("https://www.google.com");
  
    const searchBox = this.page.locator('input[name="q"], textarea[name="q"]').first();
    if (searchBox) {
      await searchBox.fill(query);
      await searchBox.press("Enter");
      // Wait for search results to load
      await this.page.waitForLoadState("networkidle");
    } else {
      console.log("Could not find search box");
    }
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

  // This is a function that collects text and metadata from elements in the current viewport
  // and returns them as an array of formatted strings.
  // This method captures elements like links, buttons, inputs, images, and textareas,
  // as well as their attributes and text content.
  // The crawl method also filters out elements that don't hold any text or have click handlers,
  // and it merges text from leaf #text nodes with their parent.
  // This is written in Playwright using JavaScript.
  async snapshotAsFormattedText() {
    const filter = ["html", "head", "title", "meta", "iframe", "body", "script", "style", "path", "svg", "br", "::marker"];
    // Get only the elements that are input, textarea, a, button, img, or have text but are not in the header, footer, or meta tags
    const elements = await this.page.$$('input, textarea, a, button, img, :not(header), :not(footer)');
    // Initialize an empty string to store the result
    let result = 'CURRENT BROWSER CONTENT:\n------------------\n';
    // Loop through each element
    for (let element of elements) {
      // Get the tag name of the element
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      // Skip the element if it is in the filter list
      if (filter.includes(tagName)) continue;
      // Get the id of the element
      const id = await element.evaluate(el => el.id);
      // Get the alt text of the element if it has one
      const alt = await element.evaluate(el => el.alt || '');
      // Get the inner text of the element if it has one
      const text = await element.evaluate(el => el.innerText || '');
      // Create a line with the element information
      let line = `<${tagName} id=${id} ${alt ? 'alt="' + alt + '"' : ''}>${text}</${tagName}>\n`;
      // Check if the line already exists in the result string
      if (result.indexOf(line) === -1) {
        // Append the line to the result string if not
        result += line;
      }
    }
    // Append the closing line to the result string
    result += '------------------\n';
    // Return the result string
    console.log(result);
    return result;
  }

}
export default Crawler;