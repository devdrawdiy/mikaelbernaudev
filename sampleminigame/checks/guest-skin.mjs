import { dependency } from './runtime.mjs';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { action, settle, ready, cut, take, fulfill } from './driver.mjs';

const { chromium } = dependency('playwright'), sharp = dependency('sharp');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [], output = new URL('../.checks/', import.meta.url);
await mkdir(output, { recursive: true });
page.on('pageerror', (error) => errors.push(error.message));
await page.addInitScript(() => {
  const original = Math.random;
  window.skinRolls = 0;
  Math.random = () => {
    if (!new Error().stack.includes('randomizeGuestSkin')) return original();
    return [0, 0.5, 0.99][window.skinRolls++ % 3];
  };
});
const rolls = () => page.evaluate(() => window.skinRolls);
const snapshot = (name) => page.screenshot({ path: fileURLToPath(new URL(name + '.png', output)), fullPage: true });
async function canvasCheck() {
  const { data, info } = await sharp(await page.locator('canvas').screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Set();
  for (let i = 0; i < data.length; i += info.channels * 37) colors.add([data[i] >> 3, data[i + 1] >> 3, data[i + 2] >> 3].join(':'));
  assert.ok(colors.size > 100, 'Blank 3D canvas');
}
try {
  await page.goto('http://localhost:5173/sampleminigame/');
  await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  await page.waitForTimeout(1800);
  assert.equal(await rolls(), 1); await canvasCheck(); await snapshot('guest-light');
  await cut(page, 'chocolate', 6); await action(page, 'spread').click();
  await action(page, 'flavor', 'lemon').click(); await cut(page, 'lemon', 4);
  await take(page, 1); await action(page, 'clear').click();
  assert.equal(await rolls(), 1, 'Editing cakes rerolled skin');
  await fulfill(page); await action(page, 'serve').click(); await ready(page); await page.waitForTimeout(1800);
  assert.equal(await rolls(), 2); await canvasCheck(); await snapshot('guest-medium');
  await page.locator('.header-tools [data-action="replay"]').click(); await page.waitForTimeout(1800);
  assert.equal(await rolls(), 3); await canvasCheck(); await snapshot('guest-dark');
  await page.setViewportSize({ width: 390, height: 844 }); await settle(page);
  assert.equal(await rolls(), 3, 'Resizing rerolled skin');
  await canvasCheck(); await snapshot('guest-dark-mobile');
  assert.deepEqual(errors, []);
  console.log('Initial customer, stable appearance during edits, new arrival, replay, desktop/mobile canvas: PASS');
} finally { await browser.close(); }
