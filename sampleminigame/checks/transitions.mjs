import { dependency } from './runtime.mjs';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { fulfill, ready } from './driver.mjs';
const { chromium } = dependency('playwright');
const sharp = dependency('sharp');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const output = new URL('../.checks/', import.meta.url);
await mkdir(output, { recursive: true });
const screenshot = (name) => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)), fullPage: true });
async function hairCenter() {
  const image = await page.locator('canvas').screenshot();
  const { data, info } = await sharp(image).extract({ left: 0, top: 150, width: 1440, height: 95 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let total = 0, sum = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (x < 140) continue;
    const i = (y * info.width + x) * info.channels, [r, g, b] = data.subarray(i, i + 3);
    if (r > 85 && r < 175 && g > 45 && g < 135 && b > 45 && b < 140 && r > g * 1.25 && Math.abs(g - b) < 20) { total++; sum += x; }
  }
  return total > 60 ? sum / total : null;
}
try {
  await page.goto('http://localhost:5173/sampleminigame/');
  await page.waitForFunction(() => document.querySelector('canvas').dataset.props === '6');
  await page.waitForTimeout(750);
  const layout = await page.evaluate(async () => {
    const { makeRoom } = await import('/sampleminigame/room.ts');
    const { trayPose } = await import('/sampleminigame/positions.ts');
    const { plateCapacity } = await import('/sampleminigame/catalog.ts');
    const room = makeRoom();
    const plates = room.children.filter((object) => object.type === 'Group').slice(0, plateCapacity).map((group) => {
      const geometry = group.children[0].geometry; geometry.computeBoundingBox();
      return { x: group.position.x, z: group.position.z, radius: geometry.boundingBox.max.x };
    });
    const targets = plates.map((_, index) => { const position = trayPose(index, 0, 1).position; return { x: position.x, z: position.z }; });
    room.traverse((object) => { if (object.isMesh) object.geometry.dispose(); });
    return { plates, targets };
  });
  layout.plates.forEach((plate, index) => {
    assert.equal(plate.x, layout.targets[index].x); assert.equal(plate.z, layout.targets[index].z);
    for (const other of layout.plates.slice(0, index)) assert.ok(Math.hypot(plate.x - other.x, plate.z - other.z) > plate.radius + other.radius, 'Preview plates overlap');
  });
  assert.equal(layout.plates.length, 7);
  await screenshot('plates-separated');
  await fulfill(page);
  const home = await hairCenter();
  assert.ok(home > 730 && home < 800, `Guest did not start at counter: ${home}`);
  await page.locator('[data-action="serve"]').click();
  await page.waitForTimeout(420);
  const departing = await hairCenter();
  await screenshot('guest-departing');
  assert.ok(departing > home + 150, `Guest did not follow to right: ${departing}`);
  await page.waitForFunction(() => document.querySelector('#guest-counter').textContent === '1 / 6 guests');
  await page.waitForTimeout(250);
  const arriving = await hairCenter();
  await screenshot('guest-arriving');
  assert.ok(arriving < home - 150, `Next guest did not enter from left: ${arriving}`);
  await ready(page);
  const settled = await hairCenter();
  assert.ok(Math.abs(settled - home) < 20, `Next guest did not reach counter: ${settled}`);
  await screenshot('next-guest');
  await page.waitForTimeout(350); await screenshot('guest-wave');
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(150);
  await screenshot('plates-mobile');
  assert.deepEqual(errors, []);
  console.log('Customer centers:', { home, departing, arriving, settled });
  console.log('Separated plates, aligned portions, rightward exit, leftward entrance, input lock, and loaded props: PASS');
} finally { await browser.close(); }
