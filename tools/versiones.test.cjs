const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/brum.js'), 'utf8');
const bloque = source.slice(source.indexOf('  const ver = $("[data-versiones]")'), source.indexOf('  // ---------- Temas HUD'));

test('el carrete acaba en la posición actual y respeta pausa y movimiento reducido', () => {
  for (const reducido of [false, true]) {
    let observar, animacion, cancelado = false;
    const animadas = [];
    const eventos = {};
    const ventana = { clientHeight: 300, addEventListener: (name, fn) => { eventos[name] = fn; } };
    const lista = { scrollHeight: 900, animate: (frames, options) => {
      animacion = { frames, options };
      animadas.push(animacion);
      return { cancel() { cancelado = true; } };
    } };
    vm.runInNewContext(bloque, {
      $: (selector) => selector === '.ver-ventana' ? ventana : ['ol', '.ver-hoy', '.ver-intrusa', '.ver-guante'].includes(selector) ? lista : { classList: { add() {}, remove() {} }, addEventListener() {} },
      menosMov: reducido, quieto: () => false,
      IntersectionObserver: class { constructor(fn) { observar = fn; } observe() {} },
      document: { addEventListener() {} }, matchMedia: () => ({ matches: reducido, addEventListener() {} })
    });
    observar([{ isIntersecting: true }], { disconnect() {} });
    if (reducido) assert.equal(animacion, undefined);
    else {
      assert.equal(animadas.length, 4);
      assert.equal(animadas[0].frames[0].transform, 'translateY(-600px)');
      assert.equal(animadas[0].frames.at(-1).transform, 'translateY(0)');
      assert.match(animadas[1].frames.at(-1).transform, /125%/);
      eventos.keydown();
      assert.equal(cancelado, true);
    }
  }
});
