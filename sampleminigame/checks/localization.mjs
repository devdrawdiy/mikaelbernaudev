import { dependency } from './runtime.mjs';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { action, settle, ready, requests, amount, cut, take, fulfill, chooseLanguage } from './driver.mjs';
const { chromium } = dependency('playwright'), sharp = dependency('sharp');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [], failures = [], output = new URL('../.checks/', import.meta.url);
await mkdir(output, { recursive: true });
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => { if (response.status() >= 400) failures.push(response.url()); });
await page.addInitScript(() => {
  let seed = 547;
  Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
});
const snapshot = (name) => page.screenshot({ path: fileURLToPath(new URL(name + '.png', output)), fullPage: true });
async function visualCheck(name) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + ': page overflow');
  const bad = await page.locator('.cake-choice, .serving, .topbar, dialog[open]').evaluateAll((elements) => elements.filter((element) => element.scrollWidth > element.clientWidth + 1).map((element) => element.className || element.id));
  assert.deepEqual(bad, [], name + ': clipped controls');
  const header = await page.locator('.topbar').boundingBox(), brand = await page.locator('.brand').boundingBox(), progress = await page.locator('.progress-wrap').boundingBox(), tools = await page.locator('.header-tools').boundingBox();
  assert.ok(brand.x + brand.width <= progress.x && tools.y + tools.height <= header.y + header.height + 1, name + ': header overlap');
  const canvas = Buffer.from(await page.locator('canvas').evaluate((element) => element.toDataURL().split(',')[1]), 'base64');
  const { data, info } = await sharp(canvas).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Set();
  for (let i = 0; i < data.length; i += info.channels * 37) colors.add([data[i] >> 3, data[i + 1] >> 3, data[i + 2] >> 3].join(':'));
  assert.ok(colors.size > 100, name + ': blank canvas');
  await snapshot(name);
}
try {
  await page.goto('http://localhost:5173/sampleminigame/');
  await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  assert.equal(await page.locator('html').getAttribute('lang'), 'sv');
  assert.equal(await page.locator('[data-language-picker]').count(), 1);
  assert.equal(await page.locator('dialog [data-language-picker]').count(), 0);
  assert.equal(await page.locator('h1').textContent(), 'Kafé Tårtbiten');
  assert.equal(await page.locator('[data-i18n="subtitle"]').textContent(), 'Bak och Bråk');
  assert.equal(await page.title(), 'Kafé Tårtbiten - Bak och Bråk');
  assert.deepEqual(await page.locator('.cake-choice span').allTextContents(), ['Chokladtårta', 'Citrontårta', 'Hallontårta']);
  assert.equal(await action(page, 'cut').textContent(), 'Dela'); assert.equal(await action(page, 'serve').textContent(), 'Servera');
  assert.equal(await page.locator('.serving h2').textContent(), 'Din bricka');
  const ticket = JSON.stringify(await requests(page)), firstGuest = await page.locator('#ticket h2').textContent();
  const requested = await requests(page);
  const count = requested.length === 1 && requested[0].flavor === 'chocolate' && requested[0].numerator * 12 === 3 * requested[0].denominator ? 6 : 3;
  await cut(page, 'chocolate', 12); await take(page, count);
  for (const language of ['sv', 'en']) {
    await chooseLanguage(page, language);
    for (const width of [320, 390, 740, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 }); await settle(page); await visualCheck('locale-' + language + '-' + width);
      assert.deepEqual(await amount(page, 'chocolate'), [count, 12]);
      assert.equal(JSON.stringify(await requests(page)), ticket);
    }
  }
  await action(page, 'serve').click(); const englishFeedback = await page.locator('#message').textContent();
  assert.ok(englishFeedback.length > 0);
  assert.ok(englishFeedback.includes(count + '/12'));
  assert.ok(!englishFeedback.includes('&#'));
  await chooseLanguage(page, 'sv'); assert.notEqual(await page.locator('#message').textContent(), englishFeedback);
  assert.equal(await page.locator('#ticket h2').textContent(), firstGuest);
  await page.locator('#piece-count').fill('13'); await action(page, 'cut').click();
  assert.equal(await page.locator('#piece-count').evaluate((input) => input.validationMessage), 'Välj ett heltal mellan 2 och 12.');
  await chooseLanguage(page, 'en');
  assert.equal(await page.locator('#piece-count').evaluate((input) => input.validationMessage), 'Choose a whole number from 2 to 12.');
  await page.locator('#piece-count').fill('12'); await chooseLanguage(page, 'sv');
  await action(page, 'simplify', 'chocolate').click();
  const dialog = page.locator('#simplification');
  assert.equal(await dialog.locator('input:checked').count(), 0);
  assert.match(await page.locator('#simplification-equation').getAttribute('aria-label'), /dela båda talen med \?/);
  await page.keyboard.press('Escape'); await chooseLanguage(page, 'en');
  await action(page, 'simplify', 'chocolate').click();
  assert.equal(await dialog.locator('input:checked').count(), 0);
  assert.match(await page.locator('#simplification-equation').getAttribute('aria-label'), /divide both numbers by \?/);
  await dialog.getByRole('radio', { name: 'Divide by 3', exact: true }).check();
  await page.keyboard.press('Escape'); await chooseLanguage(page, 'sv');
  await action(page, 'simplify', 'chocolate').click();
  await dialog.getByRole('radio', { name: 'Dela med 3', exact: true }).check();
  assert.equal(await dialog.getByRole('radio', { name: 'Dela med 3', exact: true }).isChecked(), true);
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 }); await settle(page); await visualCheck('locale-modal-sv-' + width);
  }
  await dialog.locator('[type="submit"]').click();
  assert.equal(await page.locator('#star-counter').getAttribute('aria-label'), '1 stjärna');
  await dialog.locator('[type="submit"]').click(); await settle(page);
  await chooseLanguage(page, 'en');
  assert.equal(await page.locator('#star-counter').getAttribute('aria-label'), '1 star');
  assert.deepEqual(await amount(page, 'chocolate'), [count / 3, 4]);
  await action(page, 'clear').click(); await chooseLanguage(page, 'sv');
  for (let i = 0; i < 6; i++) {
    await fulfill(page); await action(page, 'serve').click(); await ready(page);
    assert.equal(await page.locator('#guest-counter').textContent(), (i + 1) + ' / 6 gäster');
  }
  assert.equal(await page.locator('#ending-title').textContent(), 'Alla har fått tårta!');
  assert.equal(await page.locator('#ending-stars').textContent(), '1 stjärna');
  await page.locator('#ending [data-action="replay"]').click(); await settle(page);
  await chooseLanguage(page, 'en');
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.equal(await page.locator('#star-counter span').textContent(), '0');
  assert.notEqual(JSON.stringify(await requests(page)), ticket);
  await page.reload(); await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  assert.equal(await page.locator('html').getAttribute('lang'), 'sv');
  assert.deepEqual(errors, []); assert.deepEqual(failures, []);
  console.log('Swedish default, requested labels, top-bar-only language choice, EN/SV switch, preserved game state, translated feedback/accessibility/plurals, six guests, replay, desktop/mobile: PASS');
} finally { await browser.close(); }
