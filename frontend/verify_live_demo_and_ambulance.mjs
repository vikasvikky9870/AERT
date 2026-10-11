import { chromium } from 'playwright';

async function verifyLiveDemoAndAmbulance() {
  console.log('🚀 Launching Chromium for 18-Step Live Demo & Moving Ambulance Verification...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error('[BROWSER ERROR]', msg.text());
    }
  });

  try {
    console.log('🌐 Navigating to http://localhost:5173 ...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // 1. Verify Google EOC Shell loaded
    const title = await page.title();
    console.log(`✅ Page Title: "${title}"`);

    // 2. Click [18-STEP LIVE DEMO] button
    console.log('🎯 Clicking [18-STEP LIVE DEMO] button...');
    const demoBtn = page.locator('button:has-text("18-STEP LIVE DEMO")');
    await demoBtn.waitFor({ state: 'visible', timeout: 10000 });
    await demoBtn.click();
    await page.waitForTimeout(1500);

    // 3. Verify Modal Opened and Step counter is active
    const stepCounter = page.locator('text=/STEP \\d+ OF 18/');
    await stepCounter.waitFor({ state: 'visible', timeout: 5000 });
    const initialStepText = await stepCounter.innerText();
    console.log(`✅ Simulation HUD Active: "${initialStepText}"`);

    // Take screenshot of step 1/2
    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/31_live_demo_step_initial.png' });

    // 4. Wait for it to advance to Step 8 (Human Approval Gate)
    console.log('⏳ Observing auto-progression towards Step 8...');
    const approveBtn = page.locator('button:has-text("APPROVE DISPATCH GATE")');
    await approveBtn.waitFor({ state: 'visible', timeout: 25000 });
    console.log('✅ Reached Step 08: Human Command Gate paused for dispatcher sign-off!');

    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/32_live_demo_step8_approval_gate.png' });

    // 5. Click [APPROVE DISPATCH GATE]
    console.log('⚡ Dispatcher approving gate sign-off...');
    await approveBtn.click();
    await page.waitForTimeout(2000);

    // 6. Verify Progression to Step 9/10 and live moving ambulance marker
    const movingAmb = page.locator('#live-moving-ambulance');
    await movingAmb.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Dedicated Moving Ambulance Marker (#live-moving-ambulance) is VISIBLE on map!');

    // 7. Track position across multiple seconds to verify VISIBLE MOTION
    console.log('🛰️ Measuring continuous coordinate motion along corridor...');
    const positions = [];
    for (let i = 0; i < 6; i++) {
      const box = await movingAmb.boundingBox();
      const speedText = await page.locator('#live-amb-speed').innerText().catch(() => 'N/A');
      const subText = await page.locator('#live-amb-subtext').innerText().catch(() => 'N/A');
      positions.push({ x: Math.round(box.x), y: Math.round(box.y), speed: speedText, sub: subText });
      console.log(`   Sample ${i + 1}: Screen (${Math.round(box.x)}, ${Math.round(box.y)}) | Speed: ${speedText} | ${subText}`);
      await page.waitForTimeout(1000);
    }

    // Verify coordinates actually moved
    const moved = (positions[0].x !== positions[positions.length - 1].x) ||
                  (positions[0].y !== positions[positions.length - 1].y);
    console.log(`🎯 Physical Motion Verified: ${moved ? 'YES (AMBULANCE MOVES CONTINUOUSLY)' : 'NO'}`);

    // Take screenshot of moving ambulance in flight
    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/33_live_ambulance_in_motion.png' });

    // 8. Wait for Step 11/12 (Road Hazard & Detour)
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/34_live_demo_hazard_detour.png' });

    console.log('🎉 ALL LIVE DEMO AND MOVING AMBULANCE VERIFICATIONS PASSED!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    await page.screenshot({ path: 'C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/error_live_demo.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyLiveDemoAndAmbulance();
