import { test } from 'node:test';
import assert from 'node:assert/strict';
import { femaleNames, maleNames, guestNames } from './guest-names.ts';
import { generateOrders } from './orders.ts';

test('forty unique names include twenty female and twenty male names and requested international pairs', () => {
  assert.equal(femaleNames.length, 20); assert.equal(maleNames.length, 20);
  assert.equal(guestNames.length, 40); assert.equal(new Set(guestNames).size, 40);
  for (const name of ['Olena', 'Emily', 'Rana']) assert.ok(femaleNames.includes(name as typeof femaleNames[number]));
  for (const name of ['Oleksandr', 'Jack', 'Omar']) assert.ok(maleNames.includes(name as typeof maleNames[number]));
});
test('each session draws six distinct guests from entire pool with approximately equal chances', () => {
  let seed = 428;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const counts = new Map<string, number>();
  for (let i = 0; i < 2000; i++) {
    const orders = generateOrders(random);
    assert.equal(orders.length, 6); assert.equal(new Set(orders.map(({ guest }) => guest)).size, 6);
    for (const { guest } of orders) {
      assert.ok(guestNames.includes(guest as typeof guestNames[number]));
      counts.set(guest, (counts.get(guest) ?? 0) + 1);
    }
  }
  assert.equal(counts.size, 40);
  for (const count of counts.values()) assert.ok(Math.abs(count / 12000 - 1 / 40) < 0.007);
});
