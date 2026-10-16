async page => {
  await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
  const m = page.locator('.mejora-in');
  await m.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await m.screenshot({ path: '.impeccable/review/vivo-mejora.png' });
  const txt = await page.locator('.mejora .frase').innerText();
  await page.unroute('**/*');
  return txt;
}
