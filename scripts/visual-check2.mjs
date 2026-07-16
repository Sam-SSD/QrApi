import { chromium } from "playwright";

const OUT =
  "C:/Users/Sam/AppData/Local/Temp/claude/C--Users-Sam-WebstormProjects-QrGenerator/44c1db9c-d421-4483-a058-eb7699df8ae5/scratchpad";

const browser = await chromium.launch();

const page = await browser.newPage({ viewport: { width: 1440, height: 2200 } });
await page.goto("http://localhost:3000/es", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/landing-full.png`, fullPage: true });

const docs = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await docs.goto("http://localhost:3000/es/docs/api", { waitUntil: "networkidle" });
await docs.screenshot({ path: `${OUT}/docs-top.png` });
await docs.evaluate(() => document.getElementById("errors")?.scrollIntoView());
await docs.waitForTimeout(400);
await docs.screenshot({ path: `${OUT}/docs-errors.png` });

await browser.close();
console.log("OK");
