async page => {
  const dir = '.impeccable/review';
  const out = [];
  for (const [w, h, pre] of [[1440, 900, 'z'], [390, 844, 'zm']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8642/');
    await page.waitForTimeout(800);
    for (const [sel, n] of [['#inicio', 'inicio'], ['.intento', 'intento'], ['#niveles', 'niveles'], ['#como', 'como']]) {
      await page.evaluate((s) => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, sel);
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `${dir}/${pre}-${n}.png` });
    }
    const v = await page.evaluate(() => { const v = document.querySelector('[data-video]'); return `video paused=${v.paused} t=${v.currentTime.toFixed(1)}`; });
    out.push(`${pre} ${v} ancho ${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join(' | ');
}
