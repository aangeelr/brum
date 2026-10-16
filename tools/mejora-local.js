async page => {
  await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8642/?r=' + Date.now());
  const m = page.locator('.mejora-in');
  await m.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await m.screenshot({ path: '.impeccable/review/local-mejora.png' });
  const txt = await page.locator('.mejora .frase').innerText();
  await page.unroute('**/*');
  return txt;
}
