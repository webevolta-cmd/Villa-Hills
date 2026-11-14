// Usage: node shoot.js <baseUrl> <outDir> <scale> [sceneIds...]
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

(async () => {
  const [base, outDir, scale = "1", ...only] = process.argv.slice(2);
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: +scale });
  page.on("pageerror", (e) => console.error("PAGE ERROR", e.message));
  await page.goto(base + "/index.html", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const ids = only.length ? only : await page.$$eval(".scene", (s) => s.map((x) => x.id));
  for (const id of ids) {
    await page.evaluate((id) => { const el = document.getElementById(id); window.scrollTo(0, el.offsetTop); }, id);
    await page.waitForTimeout(250);
    await page.evaluate((id) => window.setScene(id), id);
    await page.waitForTimeout(900);
    const file = path.join(outDir, `${id}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 88 });
    console.log("saved", file);
  }
  await browser.close();
})();
