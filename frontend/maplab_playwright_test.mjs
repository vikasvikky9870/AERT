import { chromium } from 'playwright';
import path from 'path';

async function runMapLabTest() {
  console.log('--- STARTING AERT MAP LAB PLAYWRIGHT VERIFICATION ---');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('Navigating to http://localhost:5173/map-lab ...');
  await page.goto('http://localhost:5173/map-lab', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  // 1. Capture CALM state
  console.log('Capturing: maplab_calm.png');
  const calmBtn = page.locator('#maplab-btn-calm');
  if (await calmBtn.count() > 0) await calmBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('maplab_calm.png') });

  // 2. Capture INCIDENT state
  console.log('Capturing: maplab_incident.png');
  const incBtn = page.locator('#maplab-btn-incident');
  if (await incBtn.count() > 0) await incBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('maplab_incident.png') });

  // 3. Capture AI state
  console.log('Capturing: maplab_ai.png');
  const aiBtn = page.locator('#maplab-btn-ai');
  if (await aiBtn.count() > 0) await aiBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('maplab_ai.png') });

  // 4. Capture DISPATCH state
  console.log('Capturing: maplab_dispatch.png');
  const dispatchBtn = page.locator('#maplab-btn-dispatch');
  if (await dispatchBtn.count() > 0) await dispatchBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('maplab_dispatch.png') });

  // 5. Capture HOSPITAL state
  console.log('Capturing: maplab_hospital.png');
  const hosBtn = page.locator('#maplab-btn-hospital');
  if (await hosBtn.count() > 0) await hosBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('maplab_hospital.png') });

  console.log('Total Console Errors captured:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', JSON.stringify(consoleErrors, null, 2));
  }

  await browser.close();
  console.log('--- AERT MAP LAB PLAYWRIGHT VERIFICATION COMPLETE ---');
}

runMapLabTest().catch(err => {
  console.error('Map Lab Playwright execution failed:', err);
  process.exit(1);
});
