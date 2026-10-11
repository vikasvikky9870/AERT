import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // 1. Capture EOC Canvas with Disruption Bar & Quantum Card
  await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/18_e2e_quantum_eoc_canvas.png' });
  console.log('Captured 18_e2e_quantum_eoc_canvas.png');

  // 2. Click Citizen SOS button
  const sosBtn = page.locator('button:has-text("CITIZEN SOS")');
  if (await sosBtn.count() > 0) {
    await sosBtn.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/19_e2e_citizen_sos_modal.png' });
    console.log('Captured 19_e2e_citizen_sos_modal.png');

    const closeBtn = page.locator('.phone-modal-close');
    if (await closeBtn.count() > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // 3. Click Disruption injection button
  const crashBtn = page.locator('button:has-text("NH-16 Crash")');
  if (await crashBtn.count() > 0) {
    await crashBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/20_e2e_disruption_injected.png' });
    console.log('Captured 20_e2e_disruption_injected.png');
  }

  await browser.close();
  console.log('Done! Errors:', errors.length);
  if (errors.length > 0) {
    console.log('Errors:', errors);
  }
}

run().catch(console.error);
