async page => {
  const dir = '.impeccable/review';
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); }); await page.reload(); await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(3200);
  await page.screenshot({ path: `${dir}/r-hero-3s.png` });
  await page.waitForTimeout(6500);
  await page.screenshot({ path: `${dir}/r-hero-10s.png` });
  const ir = async (sel, off, name) => {
    await page.evaluate(([s, o]) => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY + o - 72); }, [sel, off]);
    await page.waitForTimeout(2400);
    await page.screenshot({ path: `${dir}/${name}.png` });
  };
  await ir('#academia', 0, 'r-academia1');
  await ir('#academia', 1000, 'r-academia2');
  await ir('#academia', 2000, 'r-academia3');
  await ir('#herramientas', 2400, 'r-herr-rojo');
  await ir('#simuladores', 0, 'r-sims');
  await ir('#descargar', 0, 'r-final');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); }); await page.reload(); await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${dir}/r-m-hero.png` });
  await ir('#mejora', 380, 'r-m-mejora');
  await ir('#academia', 0, 'r-m-academia');
  await ir('#herramientas', 0, 'r-m-herr');
  await ir('#descargar', 0, 'r-m-final');
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
  await page.setViewportSize({ width: 1440, height: 900 });
  return 'ancho movil ' + ancho;
}
