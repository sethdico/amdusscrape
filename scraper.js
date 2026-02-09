const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserAgent = require('user-agents');

puppeteer.use(StealthPlugin());

class AmduScrape {
    constructor() {
        this.config = { min: 2000, max: 4500 };
    }

    async wait() {
        const ms = Math.floor(Math.random() * (this.config.max - this.config.min + 1) + this.config.min);
        return new Promise(res => setTimeout(res, ms));
    }

    async execute(prompt, sessionCookies) {
        const ua = new UserAgent({ deviceCategory: 'desktop' }).toString();
        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        });

        try {
            const page = await browser.newPage();
            await page.setUserAgent(ua);

            if (sessionCookies) {
                const cookies = JSON.parse(sessionCookies);
                await page.setCookie(...cookies);
            }

            await page.goto('https://gemini.google.com/app', { waitUntil: 'networkidle2' });
            await this.wait();

            const selector = 'div[role="textbox"]';
            await page.waitForSelector(selector);
            await page.click(selector);
            await page.keyboard.type(prompt, { delay: 80 });
            await page.keyboard.press('Enter');

            await page.waitForSelector('.model-response-text', { timeout: 90000 });
            await this.wait();

            const data = await page.evaluate(() => {
                const nodes = document.querySelectorAll('.model-response-text');
                return nodes[nodes.length - 1].innerText;
            });

            await browser.close();
            return data;

        } catch (e) {
            if (browser) await browser.close();
            throw e;
        }
    }
}

module.exports = new AmduScrape();
