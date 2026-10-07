import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Bakery, type Order } from './domain.ts';
import { CakeInventory } from './inventory.ts';
import { compare } from './fractions.ts';

function half(stock: CakeInventory, flavor: 'chocolate' | 'lemon' = 'chocolate') {
  stock.cut(flavor, 12);
  const cakeId = stock.active[flavor].id;
  for (let i = 0; i < 6; i++) stock.take(flavor, i);
  return cakeId;
}
test('chosen divisors support repeated exact simplification and reversible original identities', () => {
  const stock = new CakeInventory(), cakeId = half(stock), cake = stock.cake('chocolate', cakeId)!;
  assert.equal(stock.simplify('chocolate', cakeId, 2), true);
  assert.deepEqual(stock.fraction(cake), { numerator: 3, denominator: 6 });
  assert.deepEqual(stock.portions('chocolate').map(({ ids }) => ids), [[0, 1], [2, 3], [4, 5]]);
  assert.equal(stock.canSimplify('chocolate'), true);
  assert.equal(stock.simplify('chocolate', cakeId, 3), true);
  assert.deepEqual(stock.fraction(cake), { numerator: 1, denominator: 2 });
  assert.equal(stock.canSimplify('chocolate'), false);
  const portion = stock.portions('chocolate')[0];
  assert.deepEqual(portion.ids, [0, 1, 2, 3, 4, 5]);
  assert.equal(stock.returnPiece('chocolate', portion.ids, cakeId), true);
  assert.equal(cake.groupSize, 1);
  assert.equal(stock.occupied, 0);
  assert.equal(cake.division, 12);
});
test('invalid divisors and cake identities never change quantities or partitions', () => {
  const stock = new CakeInventory(), cakeId = half(stock);
  for (const divisor of [0, 1, -2, 2.5, 4, 5, 7, 13, NaN, Infinity]) {
    assert.equal(stock.simplify('chocolate', cakeId, divisor), false);
    assert.equal(stock.cake('chocolate', cakeId)!.groupSize, 1);
  }
  assert.equal(stock.simplify('lemon', cakeId, 2), false);
  assert.equal(stock.simplify('chocolate', -1, 2), false);
  assert.equal(stock.simplify('chocolate', stock.active.lemon.id, 2), false);
  assert.equal(compare(stock.amount('chocolate'), { numerator: 1, denominator: 2 }), 0);
});
test('simplification affects only chosen plate and adding or returning pieces restores original partition', () => {
  const stock = new CakeInventory(), first = half(stock), lemon = half(stock, 'lemon');
  for (let i = 6; i < 12; i++) stock.take('chocolate', i);
  const second = half(stock);
  stock.simplify('chocolate', second, 2);
  assert.equal(stock.cake('chocolate', first)!.groupSize, 1);
  assert.equal(stock.cake('lemon', lemon)!.groupSize, 1);
  stock.returnPiece('chocolate', [0, 1], second);
  assert.equal(stock.cake('chocolate', second)!.groupSize, 1);
  assert.deepEqual(stock.fraction(stock.cake('chocolate', second)!), { numerator: 4, denominator: 12 });
  stock.simplify('chocolate', second, 2); stock.take('chocolate', 0);
  assert.deepEqual(stock.fraction(stock.cake('chocolate', second)!), { numerator: 5, denominator: 12 });
});
test('stars reward successful merges only, persist through guests and clearing, reset on replay', () => {
  const orders: Order[] = ['Mia', 'Leo'].map((guest) => ({ guest, items: [{ flavor: 'chocolate', numerator: 1, denominator: 2 }] }));
  const game = new Bakery({ orders }), first = half(game.inventory);
  assert.equal(game.simplify('chocolate', first, 4), false);
  assert.equal(game.stars, 0);
  assert.equal(game.simplify('chocolate', first, 2), true);
  assert.equal(game.stars, 1);
  assert.equal(game.simplify('chocolate', first, 2), false);
  assert.equal(game.stars, 1);
  assert.equal(game.simplify('chocolate', first, 3), true);
  assert.equal(game.stars, 2);
  game.serve(); assert.equal(game.stars, 2);
  const second = half(game.inventory);
  game.simplify('chocolate', second, 6); assert.equal(game.stars, 3);
  game.clear(); assert.equal(game.stars, 3);
  const final = half(game.inventory); game.serve();
  assert.equal(game.complete, true);
  assert.equal(game.simplify('chocolate', final, 6), false);
  assert.equal(game.stars, 3);
  game.replay(); assert.equal(game.stars, 0);
});
