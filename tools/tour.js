async page => {
  const shots = [['#delta',0,'delta'],['#como',0,'como'],['#mejora',0,'mejora'],['#academia',0,'academia1'],['#academia',1100,'academia2'],['#academia',2300,'academia3'],['#herramientas',300,'herr1'],['#herramientas',1500,'herr2'],['#simuladores',-80,'sims'],['.pianos',0,'pianos'],['#preguntas',0,'faq'],['#descargar',0,'final'],['.pie',-200,'pie']];
  const dir = '.impeccable/review';
  const pre = 'v2';
  for (const [sel, off, name] of shots) {
    await page.evaluate(([s, o]) => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY + o - 72); }, [sel, off]);
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `${dir}/${pre}-${name}.png` });
  }
  return 'ok';
}
