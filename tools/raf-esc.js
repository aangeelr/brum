async page => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8642/?r=' + Date.now());
  const raf = page.locator('.rafaga');
  await raf.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await raf.screenshot({ path: '.impeccable/review/rafaga-esc.png' });
  return 'ok';
}
