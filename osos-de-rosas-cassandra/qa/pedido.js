// Prueba del pedido: config de prueba inyectado, se captura la URL de wa.me sin salir a internet.
const { chromium } = require("playwright");
const BASE = "http://127.0.0.1:" + (process.env.PORT || 8787);
(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const page = await browser.newPage({ viewport: { width: 360, height: 780 } });
  let waUrl = null;
  await page.route("**/config.js", async r => {
    const res = await r.fetch(); let body = await res.text();
    body = body.replace("WHATSAPP_NUMBER: null", 'WHATSAPP_NUMBER: "34600000000"');
    await r.fulfill({ response: res, body });
  });
  await page.route(u => u.hostname === "wa.me", r => { waUrl = r.request().url(); r.fulfill({ status: 200, body: "capturado" }); });
  await page.goto(BASE + "/?src=estado", { waitUntil: "networkidle" });
  // 1) Enviar vacío: tres errores, sin navegación
  await page.click("#pedir");
  const errs = await page.$$eval(".error:not([hidden])", e => e.map(x => x.id + "=" + x.textContent));
  console.log("Envío vacío ->", JSON.stringify(errs), "| navegó:", waUrl !== null);
  // 2) Fecha anterior al mínimo
  const today = new Date(); const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const ayer = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  await page.click("label.muestra:has(#color-0)");
  await page.fill("#nombre", "Lucía");
  await page.fill("#fecha", iso(ayer));
  await page.click("#pedir");
  console.log("Fecha pasada (" + iso(ayer) + ") ->", JSON.stringify(await page.$$eval(".error:not([hidden])", e => e.map(x => x.id + "=" + x.textContent))), "| navegó:", waUrl !== null);
  // 3) Pedido válido: Rosa, Lucía, hoy + 7 (LEAD_DAYS es null), src=estado
  const f = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  await page.fill("#fecha", iso(f));
  await Promise.all([page.waitForURL(u => u.hostname === "wa.me"), page.click("#pedir")]);
  console.log("URL generada:", waUrl);
  console.log("Texto decodificado:\n" + decodeURIComponent(new URL(waUrl).searchParams.get("text") === null ? "" : waUrl.split("?text=")[1]));
  await browser.close();
})();
