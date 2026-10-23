const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../js/descargas.js'), 'utf8');

async function consultar(search, fetch, abrir = false) {
  const contador = { hidden: true, textContent: '' };
  let toggle;
  const panel = { open: false, addEventListener(evento, callback) { toggle = callback; }, scrollIntoView() {} };
  await runInNewContext(source, {
    window: { location: { search } }, URLSearchParams, AbortSignal,
    document: { querySelector: (s) => s === '[data-descargas]' ? contador : panel }, fetch
  });
  if (abrir) {
    panel.open = true;
    toggle();
    await new Promise(setImmediate);
  }
  return contador;
}

test('la visita normal no muestra cifras ni consulta GitHub', async () => {
  for (const search of ['', '?estadisticas=0']) {
    const contador = await consultar(search, () => { assert.fail('Consulta inesperada'); });
    assert.equal(contador.hidden, true);
    assert.equal(contador.textContent, '');
  }
});

test('el desplegable permite consultar sin enlace especial', async () => {
  const contador = await consultar('', async () => ({ ok: true, json: async () => [] }), true);
  assert.equal(contador.hidden, false);
  assert.match(contador.textContent, /Descargas del instalador: 0/);
});

test('suma todas las páginas, solo el instalador, sin borradores', async () => {
  const asset = (name, download_count) => ({ name, download_count });
  let llamadas = 0;
  const contador = await consultar('?estadisticas=1', async (url) => {
    llamadas++;
    assert.ok(url.endsWith(`page=${llamadas}`));
    return { ok: true, json: async () => llamadas === 1
      ? Array.from({ length: 100 }, () => ({ assets: [asset('Brum-instalador.exe', 2), asset('otro.zip', 99)] }))
      : [{ assets: [asset('Brum-instalador.exe', 7)] }, { draft: true, assets: [asset('Brum-instalador.exe', 10)] }] };
  });
  assert.equal(llamadas, 2);
  assert.equal(contador.hidden, false);
  assert.match(contador.textContent, /207/);
});

test('sin descargas muestra cero', async () => {
  const contador = await consultar('?estadisticas=1', async () => ({ ok: true, json: async () => [] }));
  assert.match(contador.textContent, /Descargas del instalador: 0/);
});

test('errores de GitHub o red muestran aviso, nunca un total parcial', async () => {
  for (const fetch of [async () => ({ ok: false, status: 403 }), async () => { throw new Error('Red'); }]) {
    const contador = await consultar('?estadisticas=1', fetch);
    assert.match(contador.textContent, /No se pudo consultar/);
    assert.equal(contador.hidden, false);
  }
});
