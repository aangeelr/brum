const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/brum.js'), 'utf8');
const bloque = source.slice(source.indexOf('  const ver = $("[data-versiones]")'), source.indexOf('  // ---------- Temas HUD'));

test('el carrete acaba en la posición actual y respeta pausa y movimiento reducido', () => {
  for (const reducido of [false, true]) {
    let observar, animacion, cancelado = false;
    const eventos = {};
    const ventana = { clientHeight: 300, addEventListener: (name, fn) => { eventos[name] = fn; } };
    const lista = { scrollHeight: 900, animate: (frames, options) => {
      animacion = { frames, options };
      return { cancel() { cancelado = true; } };
    } };
    vm.runInNewContext(bloque, {
      $: (selector) => selector === '.ver-ventana' ? ventana : selector === 'ol' ? lista : {},
      menosMov: reducido, quieto: () => false,
      IntersectionObserver: class { constructor(fn) { observar = fn; } observe() {} },
      document: { addEventListener() {} }, matchMedia: () => ({ addEventListener() {} })
    });
    observar([{ isIntersecting: true }], { disconnect() {} });
    if (reducido) assert.equal(animacion, undefined);
    else {
      assert.equal(animacion.frames[0].transform, 'translateY(-600px)');
      assert.equal(animacion.frames.at(-1).transform, 'translateY(0)');
      eventos.keydown();
      assert.equal(cancelado, true);
    }
  }
});
