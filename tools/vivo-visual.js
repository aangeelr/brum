async page => {
  // Web publicada, sin caché y con las animaciones de Windows apagadas
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/*', (r) => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://aangeelr.github.io/brum/?r=' + Date.now());
  await page.waitForTimeout(1000);
  const out = [];
  const textos = ['Usar vueltas que ya tengo', 'a punto de llegar', 'Brum está en obras', 'díselo desde la app', 'Setups de AC y AC EVO', 'La progresión real se parece a esto', 'Diagrama GG', 'Neumáticos y frenos', 'En lo que estoy trabajando', 'Ya está en la app, en desarrollo', 'una IA que te ayude a entenderlos'];
  const cuerpo = await page.evaluate(() => document.body.innerText);
  for (const t of textos) out.push(`«${t}»: ${cuerpo.toLowerCase().includes(t.toLowerCase())}`);
  // Capturas en dos momentos de las piezas animadas: si son distintas, se mueve de verdad
  for (const [sel, n] of [['.rafaga-video', 'rafaga'], ['[data-hud]', 'envivo'], ['[data-banco]', 'banco'], ['.marquesina', 'marquesina'], ['.como-media', 'conduce']]) {
    const el = page.locator(sel).first();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const a = await el.screenshot({ path: `.impeccable/review/mov-${n}-1.png` });
    await page.waitForTimeout(1500);
    const b = await el.screenshot({ path: `.impeccable/review/mov-${n}-2.png` });
    let dif = 0;
    const L = Math.min(a.length, b.length);
    for (let i = 0; i < L; i++) if (a[i] !== b[i]) dif++;
    out.push(`${n}: capturas distintas ${a.length !== b.length || dif > 0} (${dif} bytes cambian)`);
  }
  await page.unroute('**/*');
  return out.join('\n');
}
