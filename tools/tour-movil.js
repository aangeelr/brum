async page => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '.impeccable/review/m-hero.png' });
  const shots = [['.inicio-hud',-80,'hud'],['#delta',0,'delta'],['#como',0,'como'],['#mejora',300,'mejora'],['#academia',600,'academia'],['#herramientas',500,'herr'],['#simuladores',0,'sims'],['#descargar',0,'final'],['#descargar',700,'final2'],['.pie',0,'pie']];
  for (const [sel, off, name] of shots) {
    await page.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + o - 60); }, [sel, off]);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `.impeccable/review/m-${name}.png` });
  }
  const ancho = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  return JSON.stringify(ancho);
}
