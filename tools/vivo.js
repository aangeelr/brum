async page => {
  // Comprobación sobre la web publicada, con las animaciones de Windows apagadas como en el PC del autor
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const URL = 'https://aangeelr.github.io/brum/?r=' + Date.now();
  const dir = '.impeccable/review';
  const out = [];
  const lee = () => page.evaluate(() => ({
    hud: document.querySelector('[data-hud-tiempo]').textContent,
    banco: document.querySelector('[data-bc-t]').textContent,
    chips: [...document.querySelectorAll('[data-ej-chips] li')].map((l) => l.className).join(','),
    mq: getComputedStyle(document.querySelector('.mq-pista')).transform,
  }));
  for (const [w, h, pre] of [[1440, 900, 'v'], [390, 844, 'vm']]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(URL);
    await page.waitForTimeout(1500);
    const a = await lee();
    await page.waitForTimeout(1200);
    const b = await lee();
    out.push(`${pre} portada: titular="${await page.evaluate(() => document.querySelector('h1').innerText.replace(/\n/g, ' / '))}" · En vivo se mueve ${a.hud !== b.hud} (${a.hud} → ${b.hud})`);
    const pasos = [['.rafaga', 'rafaga'], ['.marquesina', 'marquesina'], ['.intento', 'intento'], ['#como', 'como'], ['[data-banco]', 'banco'], ['.pestanas', 'pestanas'], ['#obras', 'obras']];
    for (const [sel, n] of pasos) {
      await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
      await page.waitForTimeout(1800);
      const x = await lee();
      await page.screenshot({ path: `${dir}/${pre}-vivo-${n}.png` });
      await page.waitForTimeout(900);
      const y = await lee();
      const extra = await page.evaluate((n) => {
        const v = (s) => { const e = document.querySelector(s); return e ? `${!e.paused} t=${e.currentTime.toFixed(1)}` : 'no hay'; };
        if (n === 'rafaga') return `vídeo delta reproduciéndose ${v('[data-rafaga]')}`;
        if (n === 'como') return `paso=${document.querySelector('[data-etapas]').dataset.etapa} vídeo En vivo ${v('[data-video]')}`;
        if (n === 'banco') { const g = document.querySelector('[data-bc-gg]'); return `GG ${g.width}x${g.height} · fase ${document.querySelector('[data-bc-fase]').textContent} · rueda DI ${document.querySelector('[data-rueda="0"] [data-tt]').textContent}° ${document.querySelector('[data-rueda="0"] [data-tp]').textContent} psi`; }
        if (n === 'pestanas') return [...document.querySelectorAll('.pest img')].map((i) => `${i.alt.split(':')[0]} ${i.naturalWidth}px`).join(' | ');
        if (n === 'intento') { const r = document.querySelector('.intento-fig').getBoundingClientRect(); const f = document.querySelector('.intento .ej-fondo'); return `tarjeta ${Math.round(r.width)}px ancho, captura de fondo ${f && getComputedStyle(f).display !== 'none' ? 'visible' : 'oculta'}`; }
        if (n === 'obras') return `coach: ${document.querySelector('.tr-ia span').textContent.slice(0, 40)}…`;
        return '';
      }, n);
      const mueve = n === 'banco' ? x.banco !== y.banco : n === 'intento' ? x.chips !== y.chips : n === 'marquesina' ? x.mq !== y.mq : null;
      out.push(`${pre} ${n}: ${mueve === null ? '' : 'se mueve ' + mueve + ' · '}${extra}`);
    }
    out.push(`${pre} ancho de página ${await page.evaluate(() => document.documentElement.scrollWidth)}`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  return out.join('\n');
}
