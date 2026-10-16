async page => {
  const dir = '.impeccable/review';
  for (const [w, h, pre] of [[1440, 900, 'a'], [390, 844, 'a-m']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); }); await page.reload(); await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(800);
    const top = await page.evaluate(() => document.querySelector('#academia').getBoundingClientRect().top + scrollY);
    const alto = await page.evaluate(() => document.querySelector('#academia').offsetHeight);
    let n = 0;
    for (let y = top - 60; y < top + alto; y += h - 140) {
      await page.evaluate((yy) => scrollTo(0, yy), y);
      await page.waitForTimeout(1900);
      await page.screenshot({ path: `${dir}/${pre}${++n}.png` });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return 'ok';
}
