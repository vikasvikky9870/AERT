import asyncio
from playwright.async_api import async_playwright

async def verify_demo_and_tracking():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("1. Loading Google Maps EOC...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await asyncio.sleep(2.5)

        # 1. Capture Main EOC view showing Map with Hospital and Ambulance Pins
        shot_1 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/21_e2e_hospital_and_ambulance_pins.png"
        await page.screenshot(path=shot_1)
        print("Captured 21_e2e_hospital_and_ambulance_pins.png")

        # Check hospital pins count
        hos_pins = await page.locator(".gmap-hospital-pin").count()
        amb_pins = await page.locator(".gmap-ambulance-pin").count()
        print(f"Hospital pins found: {hos_pins}, Ambulance pins found: {amb_pins}")

        # 2. Click Filter Chip [🏥 Hospitals]
        hos_chip = page.locator("button:has-text('Hospitals')")
        if await hos_chip.count() > 0:
            print("Clicking [🏥 Hospitals] chip...")
            await hos_chip.first.click()
            await asyncio.sleep(1)
            shot_2 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/22_e2e_hospital_sheet_selected.png"
            await page.screenshot(path=shot_2)
            print("Captured 22_e2e_hospital_sheet_selected.png")

        # 3. Test Live Ambulance Tracking: Click [Track Vehicle Route Corridor] or [Dispatch 108]
        amb_chip = page.locator("button:has-text('108 Units')")
        if await amb_chip.count() > 0:
            print("Clicking [🚑 108 Units] chip...")
            await amb_chip.first.click()
            await asyncio.sleep(1)

            track_btn = page.locator("button:has-text('Track Vehicle Route Corridor')")
            if await track_btn.count() > 0:
                print("Clicking [Track Vehicle Route Corridor]...")
                await track_btn.first.click()
                await asyncio.sleep(2)
                shot_3 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/23_e2e_live_tracking_corridor.png"
                await page.screenshot(path=shot_3)
                print("Captured 23_e2e_live_tracking_corridor.png")

        # 4. Click [18-STEP LIVE DEMO]
        demo_btn = page.locator("button:has-text('18-STEP LIVE DEMO')")
        if await demo_btn.count() > 0:
            print("Clicking [18-STEP LIVE DEMO]...")
            await demo_btn.first.click()
            await asyncio.sleep(1.5)
            shot_4 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/24_e2e_18_step_demo_active.png"
            await page.screenshot(path=shot_4)
            print("Captured 24_e2e_18_step_demo_active.png")

        await browser.close()
        print(f"E2E verification completed. Console errors count: {len(console_errors)}")
        if console_errors:
            print("Console Errors:", console_errors)

if __name__ == "__main__":
    asyncio.run(verify_demo_and_tracking())
