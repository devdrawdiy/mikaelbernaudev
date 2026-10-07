import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeGuest } from './guest.ts';
import { GuestGreeting } from './guest-greeting.ts';

test('arrival greeting waves only the customer left arm and then rests', () => {
  const guest = makeGuest(), greeting = new GuestGreeting(guest);
  const right = guest.getObjectByName('right-arm')!, left = guest.getObjectByName('left-arm')!;
  greeting.start(); greeting.tick(0.35);
  const first = left.rotation.z;
  assert.ok(first > 1.8);
  greeting.tick(0.14);
  assert.notEqual(left.rotation.z, first);
  assert.equal(right.rotation.z, -0.4);
  greeting.tick(2);
  assert.equal(left.rotation.z, 0.4);
  greeting.start(); greeting.tick(0.3); greeting.stop();
  assert.equal(left.rotation.z, 0.4);
});
test('reduced motion skips waving', () => {
  const guest = makeGuest(), greeting = new GuestGreeting(guest);
  greeting.start(true); greeting.tick(0.5);
  assert.equal(guest.getObjectByName('left-arm')!.rotation.z, 0.4);
});
