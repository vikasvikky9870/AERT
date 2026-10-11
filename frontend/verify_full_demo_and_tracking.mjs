import { chromium } from 'playwright';

async function verifyDemoAndTracking() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('1. Loading Google Maps EOC...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // 1. Capture Main EOC view showing Map with Hospital and Ambulance Pins
  const shot1 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/21_e2e_hospital_and_ambulance_pins.png';
  await page.screenshot({ path: shot1 });
  console.log('Captured 21_e2e_hospital_and_ambulance_pins.png');

  // Check hospital pins count
  const hosPins = await page.locator('.gmap-hospital-pin').count();
  const ambPins = await page.locator('.gmap-ambulance-pin').count();
  console.log(`Hospital pins found: ${hosPins}, Ambulance pins found: ${ambPins}`);

  // 2. Click Filter Chip [🏥 Hospitals]
  const hosChip = page.locator('button:has-text("Hospitals")');
  if (await hosChip.count() > 0) {
    console.log('Clicking [🏥 Hospitals] chip...');
    await hosChip.first().click();
    await page.waitForTimeout(1000);
    const shot2 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/22_e2e_hospital_sheet_selected.png';
    await page.screenshot({ path: shot2 });
    console.log('Captured 22_e2e_hospital_sheet_selected.png');
  }

  // 3. Test Live Ambulance Tracking: Click [Track Vehicle Route Corridor] or [Dispatch 108]
  const ambChip = page.locator('button:has-text("108 Units")');
  if (await ambChip.count() > 0) {
    console.log('Clicking [🚑 108 Units] chip...');
    await ambChip.first().click();
    await page.waitForTimeout(1000);

    const trackBtn = page.locator('button:has-text("Track Vehicle Route Corridor")');
    if (await trackBtn.count() > 0) {
      console.log('Clicking [Track Vehicle Route Corridor]...');
      await trackBtn.first().click();
      await page.waitForTimeout(2000);
      const shot3 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/23_e2e_live_tracking_corridor.png';
      await page.screenshot({ path: shot3 });
      console.log('Captured 23_e2e_live_tracking_corridor.png');
    }
  }

  // 4. Click [18-STEP LIVE DEMO]
  const demoBtn = page.locator('button:has-text("18-STEP LIVE DEMO")');
  if (await demoBtn.count() > 0) {
    console.log('Clicking [18-STEP LIVE DEMO]...');
    await demoBtn.first().click();
    await page.waitForTimeout(1500);
    const shot4 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/24_e2e_18_step_demo_active.png';
    await page.screenshot({ path: shot4 });
    console.log('Captured 24_e2e_18_step_demo_active.png');
  }

  await browser.close();
  console.log(`E2E verification completed. Console errors count: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }
}

verifyDemoAndTracking().catch(console.error);
