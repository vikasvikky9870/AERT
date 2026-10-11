import { chromium } from 'playwright';
import path from 'path';

async function runVisualQALoop() {
  console.log('--- STARTING 9-STATE AERT MAP-FIRST VISUAL QA LOOP ---');
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

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2500);

  const states = [
    { label: '01 CALM', file: '01_map_calm.png', waitMs: 1500 },
    { label: '02 INCIDENT', file: '02_map_incident.png', waitMs: 1500 },
    { label: '03 AI SYNTHESIS', file: '03_map_ai.png', waitMs: 1500 },
    { label: '04 AI ROUTES', file: '04_map_routes.png', waitMs: 1800 },
    { label: '05 DISPATCH', file: '05_map_dispatch.png', waitMs: 2000 },
    { label: '06 PRE-ALERT', file: '06_map_hospital.png', waitMs: 2000 },
    { label: '07 HAZARDS', file: '07_map_hazard.png', waitMs: 1800 },
    { label: '08 FLEET', file: '08_map_fleet.png', waitMs: 1800 },
    { label: '09 SIMULATION', file: '09_map_simulation.png', waitMs: 2200 }
  ];

  for (const st of states) {
    console.log(`Triggering state: ${st.label}...`);
    const btn = page.locator('button', { hasText: st.label });
    await btn.click();
    await page.waitForTimeout(st.waitMs);
    const savePath = path.resolve(st.file);
    await page.screenshot({ path: savePath });
    console.log(`Captured: ${st.file}`);
  }

  console.log('Total Console Errors across all 9 states:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Error details:', JSON.stringify(consoleErrors, null, 2));
  }
  await browser.close();
  console.log('--- 9-STATE AERT MAP-FIRST VISUAL QA LOOP COMPLETE ---');
}

runVisualQALoop().catch(err => {
  console.error('Visual QA Loop Failed:', err);
  process.exit(1);
});
