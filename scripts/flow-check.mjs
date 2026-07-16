import { chromium } from "playwright";

const OUT =
  "C:/Users/Sam/AppData/Local/Temp/claude/C--Users-Sam-WebstormProjects-QrGenerator/44c1db9c-d421-4483-a058-eb7699df8ae5/scratchpad";
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

// 1. Login
await page.goto(`${BASE}/es/login`, { waitUntil: "networkidle" });
await page.fill("#email", "prueba@qrforge.local");
await page.fill("#password", "supersegura123");
await page.click("button[type=submit]");
await page.waitForURL("**/dashboard", { timeout: 15_000 });
console.log("LOGIN OK ->", page.url());

// 2. Guardar un QR desde el editor
await page.goto(`${BASE}/es/generator`, { waitUntil: "networkidle" });
await page.fill("#pf-url", "https://qrforge.dev/guardado");
await page.waitForSelector(".qr-preview svg");
await page.getByRole("button", { name: "Guardar", exact: true }).click();
await page.fill("#save-qr-name", "Mi primer QR");
await page.getByRole("button", { name: "Guardar QR" }).click();
await page.waitForSelector("text=QR guardado", { timeout: 10_000 });
console.log("SAVE QR OK");

// 3. Dashboard con el QR guardado
await page.goto(`${BASE}/es/dashboard`, { waitUntil: "networkidle" });
await page.waitForSelector('input[value="Mi primer QR"]', { timeout: 10_000 });
await page.screenshot({ path: `${OUT}/dashboard-qrs.png` });
console.log("DASHBOARD QR OK");

// 4. API keys: crear y ver token una vez
await page.goto(`${BASE}/es/dashboard/api-keys`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Nueva clave" }).click();
await page.fill("#key-name", "Clave de prueba");
await page.getByRole("button", { name: "Generar clave" }).click();
await page.waitForSelector("text=qrf_", { timeout: 10_000 });
const token = await page.locator("code").first().textContent();
console.log("TOKEN CREADO:", token?.slice(0, 16) + "...");
await page.screenshot({ path: `${OUT}/apikey-token.png` });

// Guardar el token para probar la API pública en la Fase 4
import { writeFileSync } from "node:fs";
writeFileSync(`${OUT}/test-api-token.txt`, token ?? "");

// cerrar dialog (checkbox + listo)
await page.getByText("La he guardado").click();
await page.getByRole("button", { name: "Listo" }).click();
await page.waitForSelector("text=Clave de prueba");
console.log("KEY LISTADA OK");

await browser.close();
console.log("FLOW COMPLETO");
