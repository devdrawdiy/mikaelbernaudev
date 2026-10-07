import { dependency } from './runtime.mjs';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = dependency('playwright');
const sharp = dependency('sharp');
const output = new URL('../.checks/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], failures = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
const action = (name, flavor) => page.locator(`[data-action="${name}"]${flavor ? `[data-flavor="${flavor}"]` : ''}`);
const snapshot = async (name) => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
const settle = () => page.waitForTimeout(720);
async function cut(flavor, count) {
  await action('flavor', flavor).click();
  await page.locator('#piece-count').fill(String(count));
  await action('cut').click();
  await page.waitForFunction(() => document.querySelector('#bakery').getAttribute('aria-busy') === 'false');
  await settle();
}
async function take(count, start = 0) {
  for (let i = start; i < start + count; i++) await page.locator(`[data-action="take"][data-id="${i}"]`).click();
  await settle();
}
async function quantity(flavor) {
  return page.locator('.tray-group').filter({ has: action('simplify', flavor) }).locator('.tray-title .fraction > span').allTextContents();
}
async function checkCanvas(name) {
  const buffer = await page.locator('canvas').screenshot();
  const { data, info } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Set();
  for (let i = 0; i < data.length; i += info.channels * 37) colors.add(`${data[i] >> 3}:${data[i + 1] >> 3}:${data[i + 2] >> 3}`);
  assert.ok(colors.size > 100, `${name}: canvas is blank or assets absent (${colors.size} colors)`);
  console.log(`${name}: ${info.width}x${info.height}, ${colors.size} quantized colors`);
  return buffer;
}
try {
  await page.goto('http://localhost:5173/sampleminigame/');
  await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  await settle();
  const whole = await checkCanvas('Whole cake');
  await cut('chocolate', 12);
  const spread = await checkCanvas('Twelve pieces');
  assert.equal(whole.equals(spread), false);
  await page.mouse.click(285, 480);
  await settle();
  assert.deepEqual(await quantity('chocolate'), ['1', '12']);
  await take(2, 1);
  assert.deepEqual(await quantity('chocolate'), ['3', '12']);
  await action('simplify', 'chocolate').click(); await settle();
  assert.deepEqual(await quantity('chocolate'), ['1', '4']);
  await snapshot('merged');
  await action('serve').click();
  assert.match(await page.locator('#message').textContent(), /more/);
  assert.equal(await page.locator('#guest-counter').textContent(), '0 / 6 guests');
  await action('return', 'chocolate').click(); await settle();
  assert.deepEqual(await quantity('chocolate'), ['0', '12']);
  await cut('lemon', 3); await take(1);
  await cut('chocolate', 4); await take(1);
  await cut('chocolate', 2);
  assert.deepEqual(await quantity('chocolate'), ['0', '2']);
  assert.deepEqual(await quantity('lemon'), ['1', '3']);
  await action('clear').click(); await settle();
  const recipes = [[['chocolate', 4, 2]], [['lemon', 6, 4]], [['cheesecake', 8, 1]], [['chocolate', 12, 3], ['lemon', 4, 2]], [['lemon', 5, 3]], [['lemon', 3, 2], ['chocolate', 2, 1], ['cheesecake', 8, 1]]];
  for (let i = 0; i < recipes.length; i++) {
    for (const [flavor, denominator, numerator] of recipes[i]) { await cut(flavor, denominator); await take(numerator); }
    if (i === 5) await snapshot('final-order');
    await action('serve').click();
    await page.waitForFunction((index) => document.querySelector('#guest-counter').textContent === `${index} / 6 guests`, i + 1);
    await settle();
  }
  assert.equal(await page.locator('#ending').isVisible(), true);
  await snapshot('ending');
  await page.locator('#ending [data-action="replay"]').click(); await settle();
  assert.equal(await page.locator('#guest-counter').textContent(), '0 / 6 guests');
  assert.equal(await page.locator('[data-action="take"]').count(), 0);
  await page.locator('#piece-count').fill('13'); await action('cut').click();
  assert.equal(await page.locator('#piece-count').evaluate((input) => input.checkValidity()), false);
  assert.equal(await page.locator('[data-action="take"]').count(), 0);
  await page.locator('#piece-count').fill('4'); await page.locator('#piece-count').press('Enter'); await settle();
  await page.locator('[data-action="take"][data-id="0"]').focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-action="take"][data-id="1"]').evaluate((button) => button === document.activeElement), true);
  await page.keyboard.press('Enter'); await settle();
  assert.deepEqual(await quantity('chocolate'), ['2', '4']);
  await snapshot('desktop');
  for (const width of [320, 390, 740, 768, 1024]) {
    await page.setViewportSize({ width, height: 844 }); await settle();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}`);
    await checkCanvas(`Viewport ${width}`); await snapshot(`viewport-${width}`);
  }
  await page.setViewportSize({ width: 1024, height: 720 });
  for (const flavor of ['chocolate', 'lemon', 'cheesecake']) { await cut(flavor, 12); await take(12); }
  const tray = await page.locator('.serving').boundingBox(), delivery = await page.locator('.delivery').boundingBox();
  assert.ok(tray.y + tray.height < delivery.y, 'Full tray overlaps delivery controls');
  await snapshot('full-tray');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload();
  await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  await cut('chocolate', 4); await take(2); await action('serve').click();
  await page.waitForFunction(() => document.querySelector('#guest-counter').textContent === '1 / 6 guests');
  console.log('Six guests, equivalent fractions, merge/undo, recut, rapid taps, keyboard, replay, reduced motion: PASS');
  console.log('Runtime errors:', errors, 'Failed resources:', failures);
  assert.deepEqual(errors, []);
  assert.equal(failures.filter((url) => !url.includes('favicon.ico')).length, 0);
} finally { await browser.close(); }
