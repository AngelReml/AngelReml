// Capturas de la página de venta y comprobaciones básicas.
const { chromium } = require("playwright");
const path = require("path");
const BASE = "http://127.0.0.1:" + (process.env.PORT || 8787);
(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  for (const [w, h] of [[360, 780], [1280, 800]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, locale: "es-ES" });
    const reqs = [], errs = [];
    page.on("request", r => reqs.push(r.url()));
    page.on("pageerror", e => errs.push(e.message));
    page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3200);
    await page.screenshot({ path: path.join(__dirname, `tienda-portada-${w}.png`) });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    // recorrer la página para que se monten todos los osos
    for (let y = 0; y < 8000; y += 500) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
    await page.waitForTimeout(2600);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, `tienda-completa-${w}.png`), fullPage: true });
    await page.locator("#disena").scrollIntoViewIfNeeded();
    await page.click("label.muestra:has(#color-1)");
    await page.fill("#nombre", "Lucía");
    await page.waitForTimeout(1500);
    await page.locator("#disena").screenshot({ path: path.join(__dirname, `tienda-disena-${w}.png`) });
    const ext = reqs.filter(u => !u.startsWith(BASE));
    console.log(`${w}px scrollWidth=${sw} externas=${JSON.stringify(ext)} errores=${JSON.stringify(errs)}`);
    await page.close();
  }
  await browser.close();
})();
