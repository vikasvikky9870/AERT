import { chromium } from 'playwright';
import path from 'path';

async function testLaunch() {
  console.log('Testing Playwright launch with channel: chrome...');
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true
    });
    console.log('SUCCESS: Launched with channel: chrome!');
  } catch (err) {
    console.warn('Channel chrome failed:', err.message);
    console.log('Testing explicit executablePath...');
    browser = await chromium.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true
    });
    console.log('SUCCESS: Launched with explicit executablePath!');
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleLogs.push(msg.text());
  });

  page.on('pageerror', err => {
    console.error('Page error:', err);
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  // Wait for map or canvas to render
  await page.waitForTimeout(3000);

  // Check WebGL availability
  const webglSupport = await page.evaluate(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return Boolean(gl);
    } catch {
      return false;
    }
  });

  console.log('WebGL available on page:', webglSupport);

  const screenshotPath = path.resolve('test_launch_chrome.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to:', screenshotPath);

  await browser.close();
  console.log('Browser test complete! Console errors:', consoleLogs.length);
}

testLaunch().catch(e => {
  console.error('TEST FAILED:', e);
  process.exit(1);
});
