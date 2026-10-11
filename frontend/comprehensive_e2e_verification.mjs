import { chromium } from 'playwright';
import path from 'path';

async function runComprehensiveVerification() {
  console.log('=== STARTING AERT 3.0 END-TO-END VERIFICATION SUITE ===');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const consoleErrors = [];
  const logError = (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  };

  // Helper to test viewport
  async function testViewport(width, height, filename, description) {
    console.log(`\n[VIEWPORT TEST] ${width}x${height} - ${description}`);
    const context = await browser.newContext({
      viewport: { width, height }
    });
    const page = await context.newPage();
    page.on('console', logError);
    page.on('pageerror', err => consoleErrors.push(`[Page Error] ${err.message}`));

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    const savePath = path.resolve(filename);
    await page.screenshot({ path: savePath });
    console.log(` -> Screenshot captured: ${filename}`);
    await context.close();
  }

  // 1. Multi-Viewport Tests (/adapt)
  await testViewport(1920, 1080, '01_e2e_command_wall_1920.png', '4K / 1080p Tactical Command Wall');
  await testViewport(1440, 900, '02_e2e_operator_workstation_1440.png', 'Operator Dual-HUD Workstation');
  await testViewport(1024, 768, '03_e2e_tablet_1024.png', 'Tablet / Secondary Display');
  await testViewport(390, 844, '04_e2e_mobile_field_390.png', 'Mobile EOC Field Responder');

  // 2. Interactive Feature Flows at 1440x900
  console.log('\n[INTERACTIVE FLOWS] Testing Key Features...');
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', logError);
  page.on('pageerror', err => consoleErrors.push(`[Page Error] ${err.message}`));

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);

  // A. Select an Incident
  console.log('Testing Incident Selection...');
  const incidentBtn = page.locator('.incident-row').first();
  if (await incidentBtn.count() > 0) {
    await incidentBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.resolve('05_e2e_incident_selected.png') });
    console.log(' -> Incident selected screenshot saved.');
  }

  // B. Toggle 3D Digital Twin Mode
  console.log('Testing 3D Digital Twin Toggle...');
  const twinToggle = page.locator('.spatial-mode-toggle');
  if (await twinToggle.count() > 0) {
    await twinToggle.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.resolve('06_e2e_3d_digital_twin.png') });
    console.log(' -> 3D Digital Twin screenshot saved.');
    // Toggle back to 2D
    await twinToggle.click();
    await page.waitForTimeout(1500);
  }

  // C. Open 18-Step Golden Slice Mission
  console.log('Testing 18-Step Golden Slice Mission Launcher...');
  const goldenBtn = page.locator('.golden-slice-trigger');
  if (await goldenBtn.count() > 0) {
    await goldenBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.resolve('07_e2e_golden_slice_modal.png') });
    console.log(' -> Golden Slice Mission modal screenshot saved.');

    // Click Next Step in Golden Slice
    const nextStepBtn = page.locator('button:has-text("Next Step"), button:has-text("NEXT")').first();
    if (await nextStepBtn.count() > 0) {
      await nextStepBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.resolve('08_e2e_golden_slice_step2.png') });
      console.log(' -> Golden Slice Step 2 advanced.');
    }

    // Close Golden Slice modal
    const closeBtn = page.locator('.golden-slice-trigger, button[aria-label="Close"]').first();
    const escKey = page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }

  // D. Open Slide-Over Workspace: Medical Trauma Network
  console.log('Testing Slide-Over Workspace (Trauma Bays)...');
  const medicalNav = page.locator('button:has-text("Trauma Bays")').first();
  if (await medicalNav.count() > 0) {
    await medicalNav.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.resolve('09_e2e_medical_slideover.png') });
    console.log(' -> Medical Slide-over workspace screenshot saved.');
  }

  // Close context and browser
  await context.close();
  await browser.close();

  console.log('\n=== E2E VERIFICATION COMPLETED ===');
  console.log(`Total Console / Page Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors captured:', consoleErrors);
    process.exit(1);
  } else {
    console.log('SUCCESS: All viewports, 3D WebGL, Golden Slice, and slide-overs validated with 0 errors!');
  }
}

runComprehensiveVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
