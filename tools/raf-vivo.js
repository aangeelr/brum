async page => {
  await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
  const raf = page.locator('.rafaga');
  await raf.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await raf.screenshot({ path: '.impeccable/review/movil-rafaga-publicada.png' });
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.setViewportSize({ width: 1440, height: 900 });
  return 'ancho ' + w;
}
