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
  
  async crawl() {
    const viewport = await this.page.viewportSize();
    const scrollPosition = await this.page.evaluate(() => {
      return {
        x: window.scrollX,
        y: window.scrollY,
      };
    });
    const devicePixelRatio = await this.page.evaluate(() => window.devicePixelRatio);

    // Capture a snapshot of the DOM
    const domSnapshot = await this.page.evaluateHandle(() =>
      document.documentElement.cloneNode(true)
    );

    // Initialize data structures
    const elements_of_interest = [];
    const blacklist = ["html", "head", "title", "meta", "iframe", "body", "script", "style", "path", "svg", "br", "::marker", "noscript"];

    // Process DOM nodes recursively
    async function processNode(node, parentId) {
      // Filter out unwanted nodes
      const nodeName = await this.page.evaluate((node) => node.nodeName, node);

      if (blacklist.includes(nodeName)) return;
    
      const rect = await this.page.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      }, node);

      if (
        rect.left + rect.width < scrollPosition.x ||
        rect.top + rect.height < scrollPosition.y ||
        rect.left > scrollPosition.x + viewport.width ||
        rect.top > scrollPosition.y + viewport.height
      ) {
        return;
      }

      // Extract attributes and text content
      const attributes = {
        type: node.getAttribute('type') || '',
        placeholder: node.getAttribute('placeholder') || '',
        ariaLabel: node.getAttribute('aria-label') || '',
        title: node.getAttribute('title') || '',
        alt: node.getAttribute('alt') || '',
      };

      const textContent = await this.page.evaluate((node) => node.textContent.trim(), node); // Use page.evaluate here

      // Build tree structure
      const element = {
        id: `${parentId}_${nodeName}`,
        nodeName,
        attributes,
        textContent,
        children: [],
      };

      // Merge text nodes with their parent anchor or button elements
      if (nodeName === 'A' || nodeName === 'BUTTON') {
        element.textContent = textContent.replace(/\s+/g, ' ');
      }

      // Filter elements and format them
      if (
        textContent ||
        node.onclick ||
        ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(nodeName)
      ) {
        const elementType =
          nodeName === 'A'
            ? 'LINK'
            : nodeName === 'TEXT'
            ? 'TEXT'
            : nodeName.toLowerCase();
        elements_of_interest.push({
          id: element.id,
          elementType,
          metadata: {
            nodeName: element.nodeName,
            attributes: element.attributes,
          },
          text: element.textContent,
        });
      }

      // Process child nodes
      const childNodeHandles = await this.page.evaluateHandle((node) => {
        const children = [];
        for (const child of node.children) {
          children.push(child);
        }
        return children;
      }, node);

      const childNodes = await childNodeHandles.getProperties();
      await childNodeHandles.dispose();

      for (const childNode of childNodes.values()) {
        await processNode.bind(this)(childNode, element.id);
        childNode.dispose();
      }
    }

    // Measure time taken for processing the elements
    console.time('processing_time');
    await processNode.bind(this)(domSnapshot, 'root'); // Use bind here
    console.timeEnd('processing_time');

    return elements_of_interest;
  }

  async formatElements(elements) {
    let formattedOutput = 'CURRENT BROWSER CONTENT:\n';
    formattedOutput += '------------------\n';

    for (const element of elements) {
      formattedOutput += `<${element.elementType} id=${element.id}>${element.text}</${element.elementType}>\n`;
    }

    formattedOutput += '------------------\n';
    return formattedOutput;
  }


}
export default Crawler;