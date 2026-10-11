import { chromium } from 'playwright';
import path from 'path';

async function captureClean() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2500);

  // Click minimize button
  const minBtn = page.locator('button[title*="Minimize"]').first();
  if (await minBtn.count() > 0) {
    await minBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: path.resolve('10_e2e_calm_clean_map.png') });
  await browser.close();
  console.log('Saved: 10_e2e_calm_clean_map.png');
}

captureClean().catch(console.error);
