import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeGuest, randomizeGuestSkin, skinTones } from './guest.ts';

const material = (guest: THREE.Group, name: string) => (guest.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>).material;
const color = (guest: THREE.Group, name: string) => `#${material(guest, name).color.getHexString()}`;

test('three equally sized random intervals select each skin tone including boundary values', () => {
  for (const [value, index] of [[0, 0], [1 / 3 - 0.000001, 0], [1 / 3, 1], [2 / 3 - 0.000001, 1], [2 / 3, 2], [0.999999, 2], [1, 2]]) {
    const guest = makeGuest(() => value);
    assert.equal(color(guest, 'head'), skinTones[index]);
    assert.equal(color(guest, 'left-hand'), skinTones[index]);
    assert.equal(color(guest, 'right-hand'), skinTones[index]);
  }
});
test('new customers reroll once, share skin material across face and hands, and keep hair unchanged', () => {
  let calls = 0;
  const random = () => { calls++; return 0; }, guest = makeGuest(random);
  assert.equal(calls, 1);
  assert.equal(material(guest, 'head'), material(guest, 'left-hand'));
  assert.equal(material(guest, 'head'), material(guest, 'right-hand'));
  const hair = color(guest, 'hair');
  for (const value of [0.5, 0.9, 0.1]) {
    randomizeGuestSkin(guest, () => { calls++; return value; });
    assert.equal(color(guest, 'hair'), hair);
    assert.equal(color(guest, 'left-hand'), color(guest, 'head'));
    assert.equal(color(guest, 'right-hand'), color(guest, 'head'));
  }
  assert.equal(calls, 4);
});
test('skin tones have equal probability over a seeded sample', () => {
  let seed = 734;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const guest = makeGuest(() => 0), counts = skinTones.map(() => 0), total = 12000;
  for (let i = 0; i < total; i++) {
    randomizeGuestSkin(guest, random);
    counts[skinTones.indexOf(color(guest, 'head') as typeof skinTones[number])]++;
  }
  counts.forEach((count) => assert.ok(Math.abs(count / total - 1 / 3) < 0.02));
});
