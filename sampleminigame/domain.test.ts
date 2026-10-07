import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Bakery, flavors, type Order } from './domain.ts';
import { compare, gcd } from './fractions.ts';

const fixtures: Order[] = [
  { guest: 'Mia', items: [{ flavor: 'chocolate', numerator: 1, denominator: 2 }] },
  { guest: 'Leo', items: [{ flavor: 'lemon', numerator: 2, denominator: 3 }] },
  { guest: 'Ivy', items: [{ flavor: 'cheesecake', numerator: 1, denominator: 8 }] },
  { guest: 'Sam', items: [{ flavor: 'chocolate', numerator: 37, denominator: 12 }, { flavor: 'lemon', numerator: 13, denominator: 6 }] },
  { guest: 'Noor', items: [{ flavor: 'lemon', numerator: 8, denominator: 5 }] },
  { guest: 'Alex', items: [{ flavor: 'chocolate', numerator: 5, denominator: 2 }, { flavor: 'lemon', numerator: 9, denominator: 8 }, { flavor: 'cheesecake', numerator: 5, denominator: 4 }] },
];
test('fresh cakes stay whole, and transferring one replenishes the shelf', () => {
  const game = new Bakery({ orders: fixtures });
  for (const { id } of flavors) {
    const original = game.cakes[id].id;
    assert.equal(game.cakes[id].division, 0);
    assert.equal(game.take(id, 0), true);
    assert.notEqual(game.cakes[id].id, original);
    assert.equal(game.cakes[id].division, 0);
    assert.equal(compare(game.amount(id), { numerator: 1, denominator: 1 }), 0);
  }
});
test('cuts reject invalid input without changing the tray', () => {
  const game = new Bakery({ orders: fixtures });
  game.take('chocolate', 0);
  for (const value of [0, 1, 13, 2.5, NaN, Infinity]) assert.equal(game.cut('chocolate', value), false);
  assert.equal(game.amount('chocolate').numerator, 1);
  for (let value = 2; value <= 12; value++) {
    assert.equal(game.cut('chocolate', value), true);
    assert.equal(game.cakes.chocolate.selected.length, value);
  }
});
test('equivalent fractions and mixed amounts serve six guests', () => {
  const game = new Bakery({ orders: fixtures });
  assert.equal(game.serve(), false);
  for (const order of fixtures) {
    for (const { flavor, numerator, denominator } of order.items) {
      const whole = Math.floor(numerator / denominator), remainder = numerator % denominator;
      for (let i = 0; i < whole; i++) assert.equal(game.take(flavor, 0), true);
      if (remainder) {
        const multiplier = denominator * 2 <= 12 ? 2 : 1;
        game.cut(flavor, denominator * multiplier);
        for (let i = 0; i < remainder * multiplier; i++) assert.equal(game.take(flavor, i), true);
        game.simplify(flavor, game.cakes[flavor].id, gcd(remainder * multiplier, denominator * multiplier));
      }
    }
    assert.equal(game.mismatch(), null);
    assert.ok(game.occupied <= 7);
    const oldIds = new Set(Object.values(game.stock).flat().map(({ id }) => id));
    assert.equal(game.serve(), true);
    assert.ok(Object.values(game.stock).flat().every(({ id }) => !oldIds.has(id)));
    assert.ok(flavors.every(({ id }) => game.cakes[id].division === 0));
  }
  assert.equal(game.complete, true);
  assert.equal(game.serve(), false);
  assert.equal(game.cut('lemon', 3), false);
  game.replay();
  assert.equal(game.index, 0);
  assert.equal(game.active, 'chocolate');
  assert.equal(game.complete, false);
  assert.equal(game.occupied, 0);
});
test('wrong quantities remain editable, with exact comparison', () => {
  const game = new Bakery({ orders: fixtures });
  game.cut('chocolate', 4); game.take('chocolate', 0);
  assert.equal(game.mismatch()!.kind, 'tooLittle');
  game.take('chocolate', 1); game.take('chocolate', 2);
  assert.equal(game.mismatch()!.kind, 'tooMuch');
  const portion = game.portions('chocolate').at(-1)!;
  game.returnPiece('chocolate', portion.ids, portion.cakeId);
  game.take('lemon', 0);
  assert.equal(game.mismatch()!.kind, 'unrequested');
  const lemon = game.portions('lemon')[0];
  game.returnPiece('lemon', lemon.ids, lemon.cakeId);
  assert.equal(game.mismatch(), null);
});
