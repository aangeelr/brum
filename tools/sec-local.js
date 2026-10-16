async page => {
  const out = [];
  for (const [w, h, pre] of [[1440, 900, 'd'], [390, 844, 'm']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('URL?r=' + Date.now());
    const r = page.locator('.rafaga');
    await r.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await r.screenshot({ path: `.impeccable/review/sec-PRE-${pre}-1.png` });
    await page.waitForTimeout(500);
    await r.screenshot({ path: `.impeccable/review/sec-PRE-${pre}-2.png` });
    await page.waitForTimeout(1500);
    await r.screenshot({ path: `.impeccable/review/sec-PRE-${pre}-3.png` });
    out.push(`${pre} ancho ${await page.evaluate(() => document.documentElement.scrollWidth)} · opacidades S1-S4 ahora: ${await page.evaluate(() => [...document.querySelectorAll('.rs')].map((e) => Number(getComputedStyle(e).opacity).toFixed(2)).join(' '))}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join('\n');
}
