import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Bakery, flavors, orders } from './domain.ts';

test('each guest starts with three whole cakes', () => {
  const game = new Bakery();
  for (const { id } of flavors) {
    assert.equal(game.cakes[id].division, 0);
    assert.equal(game.take(id, 0), false);
    assert.deepEqual(game.portions(id), []);
  }
});

test('only whole-number cuts from two to twelve are accepted', () => {
  const game = new Bakery();
  for (const value of [0, 1, 13, 2.5, NaN, Infinity]) assert.equal(game.cut('lemon', value), false);
  for (let value = 2; value <= 12; value++) {
    assert.equal(game.cut('lemon', value), true);
    assert.equal(game.cakes.lemon.selected.length, value);
  }
});

test('every possible simplification preserves amount and supports undo', () => {
  for (let denominator = 2; denominator <= 12; denominator++) {
    for (let count = 1; count <= denominator; count++) {
      const game = new Bakery();
      game.cut('chocolate', denominator);
      for (let i = 0; i < count; i++) game.take('chocolate', i);
      const simplifiable = game.canSimplify('chocolate');
      assert.equal(game.simplify('chocolate'), simplifiable);
      const portions = game.portions('chocolate');
      assert.equal(portions.length * denominator, count * portions[0].denominator);
      assert.deepEqual(portions.flatMap(({ ids }) => ids), Array.from({ length: count }, (_, i) => i));
      assert.equal(game.canSimplify('chocolate'), false);
      const removed = portions[0].ids;
      assert.equal(game.returnPiece('chocolate', removed), true);
      assert.equal(game.count('chocolate'), count - removed.length);
      for (const id of removed) assert.equal(game.take('chocolate', id), true);
      assert.equal(game.count('chocolate'), count);
    }
  }
});

test('recutting restores only the chosen flavor', () => {
  const game = new Bakery();
  game.cut('chocolate', 4); game.take('chocolate', 0);
  game.cut('lemon', 3); game.take('lemon', 0);
  game.cut('chocolate', 12);
  assert.equal(game.count('chocolate'), 0);
  assert.equal(game.count('lemon'), 1);
  assert.equal(game.take('lemon', 0), false);
  assert.equal(game.returnPiece('lemon', [2]), false);
});

test('equivalent fractions serve all six guests and replay resets the session', () => {
  const game = new Bakery();
  assert.equal(game.serve(), false);
  for (const order of orders) {
    for (const { flavor, numerator, denominator } of order.items) {
      const multiplier = denominator * 2 <= 12 ? 2 : 1;
      game.cut(flavor, denominator * multiplier);
      for (let i = 0; i < numerator * multiplier; i++) game.take(flavor, i);
      game.simplify(flavor);
    }
    assert.equal(game.mismatch(), null);
    assert.equal(game.serve(), true);
    assert.ok(flavors.every(({ id }) => game.cakes[id].division === 0));
  }
  assert.equal(game.complete, true);
  assert.equal(game.serve(), false);
  assert.equal(game.cut('lemon', 3), false);
  game.replay();
  assert.equal(game.index, 0);
  assert.equal(game.active, 'chocolate');
  assert.equal(game.complete, false);
});

test('too much, too little, and unrequested flavors give recoverable feedback', () => {
  const game = new Bakery();
  game.cut('chocolate', 4); game.take('chocolate', 0);
  assert.match(game.mismatch()!, /more/);
  game.take('chocolate', 1); game.take('chocolate', 2);
  assert.match(game.mismatch()!, /less/);
  game.returnPiece('chocolate', [2]);
  game.cut('lemon', 2); game.take('lemon', 0);
  assert.match(game.mismatch()!, /didn't order/);
  game.returnPiece('lemon', [0]);
  assert.equal(game.mismatch(), null);
});
