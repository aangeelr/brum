async page => {
  // Como el PC del autor: Windows con los efectos de animación apagados
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const dir = '.impeccable/review';
  const out = [];
  for (const [w, h, pre] of [[1440, 900, 'b'], [390, 844, 'bm']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8642/');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${dir}/${pre}-inicio.png` });
    const chips1 = await page.evaluate(() => [...document.querySelectorAll('[data-ej-chips] li')].map((l) => l.className).join(','));
    await page.waitForTimeout(1500);
    const chips2 = await page.evaluate(() => [...document.querySelectorAll('[data-ej-chips] li')].map((l) => l.className).join(','));
    out.push(`${pre} ejercicio se mueve: ${chips1 !== chips2}`);
    for (const [sel, nombre] of [['[data-hud]', 'hud'], ['[data-banco]', 'banco'], ['.pestanas', 'pestanas'], ['.obras', 'obras']]) {
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
      await page.waitForTimeout(1600);
      const a = await page.evaluate(() => (document.querySelector('[data-bc-t]') || {}).textContent + '|' + (document.querySelector('[data-hud-tiempo]') || {}).textContent);
      await page.screenshot({ path: `${dir}/${pre}-${nombre}.png` });
      await page.waitForTimeout(700);
      const b = await page.evaluate(() => (document.querySelector('[data-bc-t]') || {}).textContent + '|' + (document.querySelector('[data-hud-tiempo]') || {}).textContent);
      out.push(`${pre} ${nombre}: ${a} -> ${b}`);
    }
    out.push(`${pre} ancho ${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join('\n');
}
