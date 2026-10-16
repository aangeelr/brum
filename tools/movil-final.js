async page => {
  // Móvil, web publicada, sin caché: el vídeo del delta en marcha y En vivo con la marcha tras el arreglo
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
  const out = [];
  const raf = page.locator('.rafaga-video');
  await raf.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  for (const n of [1, 2]) {
    await raf.screenshot({ path: `.impeccable/review/movil-rafaga-${n}.png` });
    out.push(`vídeo delta ${n}: t=${await page.evaluate(() => document.querySelector('[data-rafaga]').currentTime.toFixed(1))} s, en marcha ${await page.evaluate(() => !document.querySelector('[data-rafaga]').paused)}`);
    await page.waitForTimeout(4000);
  }
  const hud = page.locator('[data-hud]');
  await hud.scrollIntoViewIfNeeded();
  // Toda una vuelta de En vivo (25 s a triple velocidad): ¿sale alguna vez N yendo rápido?
  let nRapido = 0, muestras = 0;
  for (let i = 0; i < 60; i++) {
    const [m, k] = await page.evaluate(() => [document.querySelector('[data-hud-marcha]').textContent, Number(document.querySelector('[data-hud-kmh]').textContent)]);
    if (m === 'N' && k > 20) nRapido++;
    muestras++;
    await page.waitForTimeout(400);
  }
  await hud.screenshot({ path: '.impeccable/review/movil-envivo.png' });
  out.push(`En vivo: ${nRapido} de ${muestras} lecturas con N por encima de 20 km/h`);
  await page.unroute('**/*');
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join('\n');
}
