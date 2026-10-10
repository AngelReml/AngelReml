// Pruebas en Chromium headless. Uso: node qa/test.js [config-de-prueba.js]
const { chromium } = require("playwright");
const path = require("path");
const BASE = "http://127.0.0.1:" + (process.env.PORT || 8787);
const out = (n) => path.join(__dirname, n);
(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
  const results = [];
  const check = (name, ok, ev) => { results.push({ name, ok, ev }); console.log((ok ? "OK    " : "FALLO ") + name + " :: " + ev); };

  for (const [w, h] of [[360, 780], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: "es-ES" });
    const page = await ctx.newPage();
    const reqs = [], cspErr = [];
    page.on("request", r => reqs.push(r.url()));
    page.on("console", m => { if (/Content Security Policy|Refused/.test(m.text())) cspErr.push(m.text()); });
    page.on("pageerror", e => cspErr.push("JS: " + e.message));
    await page.goto(BASE + "/?src=estado", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    check(`sin scroll horizontal a ${w}px`, sw <= w, `scrollWidth=${sw}`);
    await page.screenshot({ path: out(`index-${w}x${h}.png`), fullPage: true });
    const ext = reqs.filter(u => !u.startsWith(BASE));
    check(`peticiones externas a ${w}px`, ext.length === 0, `${reqs.length} peticiones, externas=${JSON.stringify(ext)}`);
    check(`sin errores CSP/JS a ${w}px`, cspErr.length === 0, JSON.stringify(cspErr));
    const fontReqs = reqs.filter(u => u.endsWith(".woff2")).map(u => u.replace(BASE, ""));
    const loaded = await page.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family));
    check(`fuentes desde /fonts a ${w}px`, fontReqs.every(u => u.startsWith("/fonts/")) && fontReqs.length >= 2, `pedidas=${JSON.stringify(fontReqs)} cargadas=${JSON.stringify(loaded)}`);
    const cookies = await ctx.cookies();
    const docCookie = await page.evaluate(() => document.cookie);
    check(`cookies a ${w}px`, cookies.length === 0 && docCookie === "", `context.cookies()=${JSON.stringify(cookies)} document.cookie=${JSON.stringify(docCookie)}`);
    const ls = await page.evaluate(() => localStorage.length + sessionStorage.length);
    check(`almacenamiento local a ${w}px`, ls === 0, `localStorage+sessionStorage=${ls}`);
    if (w === 360) {
      // Validación de entradas
      await page.click("#pedir").catch(() => {});
      const disabled = await page.$eval("#pedir", b => b.disabled + " | " + b.textContent);
      console.log("INFO  botón sin número:", disabled);
      await page.fill("#nombre", "");
      await page.type("#nombre", "<script>alert(1)</script>");
      const v1 = await page.$eval("#nombre", i => i.value);
      check("rechaza <script>", !/[<>]/.test(v1), `tecleado "<script>alert(1)</script>" -> valor ${JSON.stringify(v1)}`);
      await page.fill("#nombre", "");
      await page.type("#nombre", "ABCDEFGHIJKLMNOPQRSTU");
      const v2 = await page.$eval("#nombre", i => i.value);
      const cnt = await page.$eval("#contador", e => e.textContent);
      check("bloquea el carácter 21", v2.length === 20, `tecleado 21 -> ${JSON.stringify(v2)} (${v2.length}), contador ${cnt}`);
      await page.fill("#nombre", "Ana\u0007\u0000 María");
      const v3 = await page.$eval("#nombre", i => i.value);
      check("quita caracteres de control", v3 === "Ana María", JSON.stringify(v3));
      await page.check("#color-0", { force: true });
      await page.fill("#nombre", "Lucía");
      const ribbon = await page.$eval("#lazo-texto", t => t.textContent);
      check("lazo se actualiza", ribbon === "Lucía", JSON.stringify(ribbon));
      await page.screenshot({ path: out("lazo-lucia-360.png"), fullPage: false, clip: await page.$eval(".vista", e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height }; }) }).catch(async () => { await page.locator(".vista").screenshot({ path: out("lazo-lucia-360.png") }); });
      const falta = await page.$$eval(".falta", els => els.map(e => e.textContent.trim()));
      console.log("INFO  [FALTA DATO] visibles en index:", JSON.stringify([...new Set(falta)]));
    }
    await ctx.close();
  }
  for (const p of ["aviso-legal.html", "privacidad.html", "condiciones.html"]) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 } });
    const page = await ctx.newPage();
    const reqs = [];
    page.on("request", r => reqs.push(r.url()));
    await page.goto(BASE + "/" + p, { waitUntil: "networkidle" });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const falta = await page.$$eval(".falta", els => els.map(e => e.textContent.trim()));
    check(`${p} 360px sin externas`, sw <= 360 && reqs.every(u => u.startsWith(BASE)), `scrollWidth=${sw}, falta=${JSON.stringify([...new Set(falta)])}`);
    await page.screenshot({ path: out(p.replace(".html", "-360.png")), fullPage: true });
    await ctx.close();
  }
  await browser.close();
  process.exitCode = results.every(r => r.ok) ? 0 : 1;
})();
