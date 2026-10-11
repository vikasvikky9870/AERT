import { chromium } from 'playwright';
import path from 'path';

async function runDetailedMapLabQA() {
  console.log('=== STARTING AERT MAP LAB COMPREHENSIVE QA ===');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const consoleErrors = [];
  const failedRequests = [];

  // Helper function to test viewport
  async function testViewport(width, height, filename) {
    console.log(`Testing viewport ${width}x${height} -> ${filename}`);
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(`[Console Error] ${msg.text()}`); });
    page.on('requestfailed', req => { failedRequests.push(`[Request Failed] ${req.url()} (${req.failure()?.errorText})`); });

    await page.goto('http://localhost:5173/map-lab', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.resolve(filename) });
    await context.close();
  }

  // 1. Capture Required Responsive Viewports
  await testViewport(1920, 1080, 'map-lab-1920.png');
  await testViewport(1440, 900, 'map-lab-1440.png');
  await testViewport(1024, 768, 'map-lab-1024.png');

  // 2. Capture Required Workflow States at 1440x900
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(`[Console Error] ${msg.text()}`); });
  page.on('requestfailed', req => { failedRequests.push(`[Request Failed] ${req.url()} (${req.failure()?.errorText})`); });

  await page.goto('http://localhost:5173/map-lab', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  // State 01: Initial Map / Calm
  console.log('Capturing: 01-initial-map.png');
  const calmBtn = page.locator('#maplab-btn-calm');
  if (await calmBtn.count() > 0) await calmBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('01-initial-map.png') });

  // State 02: Incident Selected
  console.log('Capturing: 02-incident-selected.png');
  const incBtn = page.locator('#maplab-btn-incident');
  if (await incBtn.count() > 0) await incBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('02-incident-selected.png') });

  // State 03: AI Recommendation
  console.log('Capturing: 03-ai-recommendation.png');
  const aiBtn = page.locator('#maplab-btn-ai');
  if (await aiBtn.count() > 0) await aiBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('03-ai-recommendation.png') });

  // State 04: Dispatch
  console.log('Capturing: 04-dispatch.png');
  const dispatchBtn = page.locator('#maplab-btn-dispatch');
  if (await dispatchBtn.count() > 0) await dispatchBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('04-dispatch.png') });

  // State 05: Ambulance Moving
  console.log('Capturing: 05-ambulance-moving.png');
  const movingBtn = page.locator('#maplab-btn-moving');
  if (await movingBtn.count() > 0) await movingBtn.click();
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.resolve('05-ambulance-moving.png') });

  // State 06: Hospital Pre-Alert
  console.log('Capturing: 06-hospital-prealert.png');
  const hosBtn = page.locator('#maplab-btn-hospital');
  if (await hosBtn.count() > 0) await hosBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.resolve('06-hospital-prealert.png') });

  console.log('====================================');
  console.log('Total Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors Sample:', consoleErrors.slice(0, 5));
  }
  console.log('Total Failed Requests:', failedRequests.length);
  if (failedRequests.length > 0) {
    console.log('Failed Requests Sample:', failedRequests.slice(0, 5));
  }
  console.log('====================================');

  await browser.close();
  console.log('=== AERT MAP LAB COMPREHENSIVE QA COMPLETE ===');
}

runDetailedMapLabQA().catch(err => {
  console.error('QA Script Error:', err);
  process.exit(1);
});
