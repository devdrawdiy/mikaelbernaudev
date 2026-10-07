import { test } from 'node:test';
import assert from 'node:assert/strict';
import { en } from './locales/en.ts';
import { sv } from './locales/sv.ts';
import { cakeName, describeQuantity, language, setLanguage, t, tText } from './i18n.ts';
import { Bakery } from './domain.ts';

test('Swedish defaults, complete translation keys, requested cake and control names', async () => {
  assert.equal(language(), 'sv');
  assert.deepEqual(Object.keys(sv).sort(), Object.keys(en).sort());
  assert.equal(t('brand'), 'Kafé Tårtbiten');
  assert.equal(t('subtitle'), 'Bakverk och bråk');
  assert.equal(cakeName('cheesecake'), 'Hallontårta');
  assert.equal(cakeName('lemon'), 'Citrontårta');
  assert.equal(cakeName('chocolate'), 'Chokladtårta');
  assert.equal(t('cut'), 'Dela'); assert.equal(t('serve'), 'Servera'); assert.equal(t('tray'), 'Din bricka');
  for (const value of ['sv', 'en']) {
    await setLanguage(value);
    assert.equal(t('stars', { count: 1 }), value === 'sv' ? '1 stjärna' : '1 star');
    assert.equal(t('stars', { count: 2 }), value === 'sv' ? '2 stjärnor' : '2 stars');
    assert.equal(t('stars', { count: 0 }), value === 'sv' ? '0 stjärnor' : '0 stars');
    assert.ok(t('orderTitle', { guest: 'Oleksandr' }).includes('Oleksandr'));
    assert.ok(tText('tooLittle', { cake: cakeName('chocolate'), amount: '3/12', requested: '1/2' }).includes('3/12'));
    assert.ok(t('orderTitle', { guest: '<script>' }).includes('&lt;script&gt;'));
  }
  await setLanguage('sv');
  assert.equal(describeQuantity({ numerator: 39, denominator: 12 }), '3 och 3/12');
  await setLanguage('en');
  assert.equal(describeQuantity({ numerator: 39, denominator: 12 }), '3 and 3/12');
  await setLanguage('sv');
});
test('changing language preserves mathematical state, guests, cuts, plates and stars', async () => {
  const game = new Bakery(); game.cut('chocolate', 12);
  for (let i = 0; i < 3; i++) game.take('chocolate', i);
  game.simplify('chocolate', game.cakes.chocolate.id, 3);
  const before = JSON.stringify(game);
  await setLanguage('en'); assert.equal(JSON.stringify(game), before);
  assert.equal(cakeName('cheesecake'), 'Raspberry cake');
  assert.equal(await setLanguage('de'), false); assert.equal(language(), 'en');
  await setLanguage('sv'); assert.equal(JSON.stringify(game), before);
});
