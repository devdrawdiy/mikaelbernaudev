import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dependency } from './runtime.mjs';
const { chromium } = dependency('playwright'), sharp = dependency('sharp');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage();
const errors = [], output = new URL('../.checks/', import.meta.url);
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => { if (response.status() >= 400) errors.push(response.url()); });
await mkdir(output, { recursive: true });
try {
  await page.goto('http://localhost:5173/sampleminigame/');
  await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  const intersections = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { loadProps } = await import('/sampleminigame/props.ts');
    const { makeGuest } = await import('/sampleminigame/guest.ts');
    const scene = new THREE.Scene();
    await loadProps(scene);
    const stove = scene.children[2], guest = makeGuest(() => 0);
    const bounds = new THREE.Box3().setFromObject(stove), hits = [];
    guest.updateMatrixWorld(true);
    guest.traverse((part) => {
      if (part.isMesh && bounds.intersectsBox(new THREE.Box3().setFromObject(part))) hits.push(part.name || part.type);
    });
    return hits;
  });
  assert.deepEqual(intersections, [], 'Stove intersects customer geometry');
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(800);
    assert.equal(await page.locator('[data-i18n="subtitle"]').textContent(), 'Bak och Bråk');
    assert.equal(await page.title(), 'Kafé Tårtbiten - Bak och Bråk');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    const bytes = Buffer.from(await page.locator('canvas').evaluate((canvas) => canvas.toDataURL().split(',')[1]), 'base64');
    const { data, info } = await sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const colors = new Set();
    for (let i = 0; i < data.length; i += info.channels * 37) colors.add([data[i] >> 3, data[i + 1] >> 3, data[i + 2] >> 3].join(':'));
    assert.ok(colors.size > 100, 'Blank canvas');
    await page.screenshot({ path: fileURLToPath(new URL('scene-polish-' + width + '.png', output)), fullPage: true });
  }
  await page.locator('[data-language-picker]').selectOption('en');
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(await page.locator('[data-i18n="subtitle"]').textContent(), 'Baking and Fractions');
  assert.deepEqual(errors, []);
  console.log('Stove/customer clearance, subtitle/title, desktop/mobile layout and nonblank canvas: PASS');
} finally { await browser.close(); }
