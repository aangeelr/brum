async page => {
  // Web publicada: el vídeo del delta en tres momentos (tramo verde y tramo rojo) y el texto de Conduce
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
  const v = page.locator('[data-rafaga]');
  await v.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const out = [];
  const dur = await page.evaluate(() => document.querySelector('[data-rafaga]').duration);
  out.push(`duración del vídeo ${dur.toFixed(1)} s`);
  for (const t of [2, 6, 13]) {
    await page.evaluate((t) => { const e = document.querySelector('[data-rafaga]'); e.pause(); e.currentTime = t; }, t);
    await page.waitForTimeout(700);
    await v.screenshot({ path: `.impeccable/review/sect-${t}.png` });
    out.push(`captura en ${t} s`);
  }
  await page.evaluate(() => document.querySelector('[data-rafaga]').play());
  const c = page.locator('.etapa-t[data-et="1"]');
  await c.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.locator('#como').screenshot({ path: '.impeccable/review/conduce-vivo.png' });
  out.push(`Conduce: ${await c.innerText()}`);
  return out.join('\n');
}
