
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
    await page.goto('https://bartholomew.info', {waitUntil: 'networkidle2'});
    const title = await page.title();
    console.log('Title:', title);
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body text length:', bodyText.length);
    console.log('Body text sample:', bodyText.substring(0, 300));
    await browser.close();
})();
