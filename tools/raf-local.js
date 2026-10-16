async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:8642/?r=' + Date.now());
  const raf = page.locator('.rafaga');
  await raf.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await raf.screenshot({ path: '.impeccable/review/movil-rafaga-local.png' });
  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.setViewportSize({ width: 1440, height: 900 });
  return 'ancho ' + w;
}
