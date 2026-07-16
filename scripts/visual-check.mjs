import { chromium } from "playwright";

const OUT =
  "C:/Users/Sam/AppData/Local/Temp/claude/C--Users-Sam-WebstormProjects-QrGenerator/44c1db9c-d421-4483-a058-eb7699df8ae5/scratchpad";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

// Editor: escribir URL y esperar el QR
await page.goto("http://localhost:3000/es/generator", { waitUntil: "networkidle" });
await page.fill("#pf-url", "https://qrforge.dev");
await page.waitForSelector(".qr-preview svg", { timeout: 10_000 });
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/editor-desktop.png`, fullPage: false });

// Editor móvil
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto("http://localhost:3000/es/generator", { waitUntil: "networkidle" });
await mobile.fill("#pf-url", "https://qrforge.dev");
await mobile.waitForSelector(".qr-preview svg", { timeout: 10_000 });
await mobile.waitForTimeout(400);
await mobile.screenshot({ path: `${OUT}/editor-mobile.png` });

// Landing light theme
const light = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await light.goto("http://localhost:3000/es", { waitUntil: "networkidle" });
await light.evaluate(() => {
  localStorage.setItem("theme", "light");
});
await light.reload({ waitUntil: "networkidle" });
await light.screenshot({ path: `${OUT}/landing-light.png` });

console.log("OK screenshots");
await browser.close();
