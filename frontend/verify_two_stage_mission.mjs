import { chromium } from 'playwright';

async function verifyTwoStageMission() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('1. Loading Google Maps EOC with Enhanced Navigation...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Capture Main Canvas showing Weather Pill, Traffic, and Pins
  const shot1 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/25_e2e_weather_traffic_canvas.png';
  await page.screenshot({ path: shot1 });
  console.log('Captured 25_e2e_weather_traffic_canvas.png');

  // 2. Click [🚑 5 108 Units] to inspect the Crew Dossier & 5-Metric Route Matrix
  const ambChip = page.locator('button:has-text("108 Units")');
  if (await ambChip.count() > 0) {
    console.log('Opening Ambulance Dossier & Route Matrix...');
    await ambChip.first().click();
    await page.waitForTimeout(1200);

    const shot2 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/26_e2e_crew_dossier_route_matrix.png';
    await page.screenshot({ path: shot2 });
    console.log('Captured 26_e2e_crew_dossier_route_matrix.png');

    // 3. Launch 2-Stage Mission: Pickup ➔ Hospital Handover
    const launchBtn = page.locator('button:has-text("Launch 2-Stage Mission")');
    if (await launchBtn.count() > 0) {
      console.log('Launching 2-Stage Mission (Leg 1: En Route to Scene)...');
      await launchBtn.first().click();

      // Wait 3 seconds to capture Leg 1 in flight
      await page.waitForTimeout(3000);
      const shot3 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/27_e2e_leg1_in_flight.png';
      await page.screenshot({ path: shot3 });
      console.log('Captured 27_e2e_leg1_in_flight.png');

      // Wait for pickup arrival and hospital vacancy scan modal
      console.log('Waiting for pickup point arrival & hospital vacancy triage scan...');
      await page.waitForTimeout(3500);
      const shot4 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/28_e2e_hospital_vacancy_scan_modal.png';
      await page.screenshot({ path: shot4 });
      console.log('Captured 28_e2e_hospital_vacancy_scan_modal.png');

      // Wait for Leg 2 transition towards RIMS Hospital
      console.log('Waiting for Leg 2 transition towards RIMS Trauma Bay...');
      await page.waitForTimeout(5000);
      const shot5 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/29_e2e_leg2_hospital_approach.png';
      await page.screenshot({ path: shot5 });
      console.log('Captured 29_e2e_leg2_hospital_approach.png');
    }
  }

  // 4. Test Citizen SOS Modal with Quick SOS Trigger
  const sosBtn = page.locator('button:has-text("CITIZEN SOS")');
  if (await sosBtn.count() > 0) {
    console.log('Testing Citizen SOS Modal...');
    await sosBtn.first().click();
    await page.waitForTimeout(1000);

    const shot6 = 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/30_e2e_citizen_sos_trigger_modal.png';
    await page.screenshot({ path: shot6 });
    console.log('Captured 30_e2e_citizen_sos_trigger_modal.png');
  }

  await browser.close();
  console.log(`Two-stage mission verification completed. Console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }
}

verifyTwoStageMission().catch(console.error);
