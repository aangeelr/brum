async page => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); }); await page.reload();
  await page.locator('#delta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2800);
  try { await page.getByRole('button', { name: 'Dónde más pierdo' }).click({ timeout: 4000 }); } catch (e) { return 'falla salto: ' + e.message.slice(0, 400); }
  await page.waitForTimeout(1300);
  const estado = await page.locator('#delta').getAttribute('data-estado');
  const palabra = await page.locator('[data-delta-palabra]').textContent();
  await page.screenshot({ path: '.impeccable/review/i-delta-pierde.png' });
  await page.locator('#como').scrollIntoViewIfNeeded();
  try { await page.getByRole('button', { name: 'Entrena' }).click({ timeout: 4000 }); } catch (e) { return 'falla Entrena: ' + e.message.slice(0, 400); }
  await page.waitForTimeout(600);
  const etapa = await page.locator('[data-etapas]').getAttribute('data-etapa');
  await page.locator('#preguntas').scrollIntoViewIfNeeded();
  try { await page.getByText('¿Mis datos salen de mi PC?').click({ timeout: 4000 }); } catch (e) { return 'falla faq: ' + e.message.slice(0, 400); }
  await page.waitForTimeout(500);
  const abiertas = await page.locator('details[open]').count();
  await page.locator('[data-dlg-sim]').selectOption('iRacing');
  await page.locator('[data-dlg-nombre]').fill('Tanda de prueba');
  await page.getByText('Usar vueltas que ya tengo').evaluate((el) => el.scrollIntoView({ block: 'center' })); try { await page.getByText('Usar vueltas que ya tengo').click({ timeout: 4000 }); } catch (e) { return 'falla modo: ' + e.message.slice(0, 400); }
  const paso = await page.locator('.pasos li').nth(2).textContent();
  const prev = await page.locator('[data-dlg-prev]').textContent();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => { history.scrollRestoration = 'manual'; scrollTo(0, 0); }); await page.reload();
  await page.waitForTimeout(1200);
  const hud = await page.locator('[data-hud-tiempo]').textContent();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return JSON.stringify({ estado, palabra, etapa, abiertas, paso, prev, hudReducido: hud });
}
