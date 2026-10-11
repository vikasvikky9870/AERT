import asyncio
from playwright.async_api import async_playwright

async def verify_quantum_integration():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("Navigating to Google Maps EOC...")
        await page.goto("http://localhost:5173", wait_until="networkidle")
        await asyncio.sleep(2)

        # 1. Capture Main EOC view showing Google Maps, Disruption Bar & Quantum Card
        screenshot_path_1 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/18_e2e_quantum_eoc_canvas.png"
        await page.screenshot(path=screenshot_path_1)
        print("Captured 18_e2e_quantum_eoc_canvas.png")

        # 2. Click [📱 CITIZEN SOS]
        sos_btn = page.locator("button:has-text('CITIZEN SOS')")
        if await sos_btn.count() > 0:
            await sos_btn.first.click()
            await asyncio.sleep(1.5)
            screenshot_path_2 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/19_e2e_citizen_sos_modal.png"
            await page.screenshot(path=screenshot_path_2)
            print("Captured 19_e2e_citizen_sos_modal.png")

            # Close phone modal
            close_btn = page.locator(".phone-modal-close")
            if await close_btn.count() > 0:
                await close_btn.click()
                await asyncio.sleep(0.5)

        # 3. Click Disruption Button [💥 NH-16 Crash (+150%)]
        disrupt_btn = page.locator("button:has-text('NH-16 Crash')")
        if await disrupt_btn.count() > 0:
            await disrupt_btn.click()
            await asyncio.sleep(1)
            screenshot_path_3 = "C:/Users/vikas/.gemini/antigravity-ide/brain/a2b0b80f-175e-4234-a565-0f5169df8441/20_e2e_disruption_injected.png"
            await page.screenshot(path=screenshot_path_3)
            print("Captured 20_e2e_disruption_injected.png")

        await browser.close()
        print(f"Verification completed. Console errors count: {len(console_errors)}")
        if console_errors:
            print("Errors:", console_errors)

if __name__ == "__main__":
    asyncio.run(verify_quantum_integration())
