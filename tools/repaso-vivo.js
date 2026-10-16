async page => {
  const dir = '.impeccable/review';
  const out = [];
  for (const [w, h, pre] of [[1440, 900, "w"]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); });
    await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
    await page.evaluate(() => scrollTo(0, 0));
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    let n = 0;
    for (let y = 0; y < alto; y += h - 100) {
      await page.evaluate((yy) => scrollTo(0, yy), y);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${dir}/${pre}${String(++n).padStart(2, '0')}.png` });
    }
    out.push(`${pre}: ${n} capturas, ancho ${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join(' | ');
}
