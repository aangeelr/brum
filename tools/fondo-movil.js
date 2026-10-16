async page => {
  // Sin caché: el CSS nuevo, no el que guardó el navegador de la comprobación anterior
  await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache', pragma: 'no-cache' } }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ['.inicio .hud-fondo', '.intento .ej-fondo'].map((s) => {
    const e = document.querySelector(s); const c = getComputedStyle(e);
    return `${s}: display ${c.display}, ancho ${Math.round(e.getBoundingClientRect().width)}px`;
  }).join(' | '));
  await page.evaluate(() => document.querySelector('.intento').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.impeccable/review/vm-vivo-intento-fondo.png' });
  await page.unroute('**/*');
  await page.setViewportSize({ width: 1440, height: 900 });
  return r;
}
