import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateOrders } from './orders.ts';
import { Bakery } from './domain.ts';

const seeded = (value: number) => () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
test('random orders always contain fractions and fit seven plates', () => {
  const random = seeded(1961);
  let fractions = 0, units = 0, smallPieces = 0, mixed = 0, maxWhole = 0;
  for (let i = 0; i < 10000; i++) {
    const orders = generateOrders(random);
    assert.equal(orders.length, 6);
    assert.equal(new Set(orders.map(({ guest }) => guest)).size, 6);
    for (const order of orders) {
      assert.ok(order.items.length >= 1 && order.items.length <= 3);
      assert.equal(new Set(order.items.map(({ flavor }) => flavor)).size, order.items.length);
      assert.ok(order.items.reduce((total, item) => total + Math.ceil(item.numerator / item.denominator), 0) <= 7);
      for (const { numerator, denominator } of order.items) {
        assert.ok(denominator >= 2 && denominator <= 12);
        assert.ok(numerator > 0 && numerator < 4 * denominator);
        assert.notEqual(numerator % denominator, 0, 'Whole-number-only request');
        fractions++; units += Number(numerator % denominator === 1);
        smallPieces += Number(denominator >= 6);
        mixed += Number(numerator > denominator);
        maxWhole = Math.max(maxWhole, Math.floor(numerator / denominator));
      }
    }
  }
  assert.ok(units / fractions > 0.6 && units / fractions < 0.85);
  assert.ok(smallPieces / fractions > 0.6 && smallPieces / fractions < 0.8);
  assert.ok(mixed / fractions > 0.2 && mixed / fractions < 0.4);
  assert.equal(maxWhole, 3);
});
test('extreme random values still create legal fractional requests', () => {
  for (const random of [() => 0, () => 0.999999, () => 1]) for (const order of generateOrders(random)) {
    assert.ok(order.items.reduce((sum, item) => sum + Math.ceil(item.numerator / item.denominator), 0) <= 7);
    assert.ok(order.items.every(({ numerator, denominator }) => numerator % denominator !== 0));
  }
});
test('replay generates another set and resets inventory', () => {
  const game = new Bakery({ random: seeded(42) }), first = JSON.stringify(game.orders);
  game.take(game.active, 0); game.replay();
  assert.notEqual(JSON.stringify(game.orders), first);
  assert.equal(game.occupied, 0);
  assert.equal(game.index, 0);
  assert.equal(game.active, game.order.items[0].flavor);
});
