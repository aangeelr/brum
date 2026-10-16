async page => {
  for (const [w, h, name] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); }); await page.reload(); await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1500);
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < alto; y += Math.round(h * 0.6)) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(260); }
    await page.waitForTimeout(1200);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return 'ok';
}
