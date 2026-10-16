async page => {
  const dir = '.impeccable/review';
  const out = [];
  for (const [w, h, pre] of [[1440, 900, 'r'], [390, 844, 'rm']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('http://localhost:8642/?r=' + Date.now());
    await page.evaluate(() => { try { localStorage.removeItem('brum-tema'); } catch (e) {} });
    await page.goto('http://localhost:8642/?r=' + Date.now());
    await page.waitForTimeout(800);
    const foto = async (sel, n) => { await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.waitForTimeout(1600); await page.locator(sel).first().screenshot({ path: `${dir}/${pre}-${n}.png` }); };
    await foto('.prog-cab', 'prog-cab');
    await foto('[data-racha]', 'racha');
    await foto('.tienda', 'tienda');
    // Pulsar Bathurst en la Tienda: la web se pone sus colores
    await page.locator('.ti-tema[data-tema="theme_bathurst"]').click();
    await page.waitForTimeout(900);
    const acento = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--naranja').trim());
    await foto('.tienda', 'tienda-bathurst');
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${dir}/${pre}-inicio-bathurst.png` });
    out.push(`${pre} acento tras pulsar Bathurst: ${acento}`);
    await page.locator('[data-temas] [data-tema="brum"]').click();
    // Comparador: misma altura en verde y en rojo
    const delta = page.locator('[data-delta]');
    await delta.scrollIntoViewIfNeeded();
    const alturas = [];
    for (const salto of ['gana', 'pierde']) {
      await page.locator(`[data-salto="${salto}"]`).click();
      await page.waitForTimeout(2600);
      alturas.push(await page.evaluate(() => { const l = document.querySelector('.delta-lectura').getBoundingClientRect(); const g = document.querySelector('.delta-graf').getBoundingClientRect(); return `${document.querySelector('[data-delta]').dataset.estado} lectura ${Math.round(l.height)}px, gráfico en y=${Math.round(g.top)}`; }));
      await delta.screenshot({ path: `${dir}/${pre}-delta-${salto}.png` });
    }
    out.push(`${pre} comparador: ${alturas.join(' | ')}`);
    await foto('[data-vueltas]', 'vueltas');
    out.push(`${pre} ancho ${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join('\n');
}
