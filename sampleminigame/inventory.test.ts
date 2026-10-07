import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CakeInventory } from './inventory.ts';
import { compare, gcd } from './fractions.ts';

test('all simplifications through twelfths preserve amount and original identities', () => {
  for (let denominator = 2; denominator <= 12; denominator++) for (let count = 1; count <= denominator; count++) {
    const stock = new CakeInventory(), cakeId = stock.active.chocolate.id;
    stock.cut('chocolate', denominator);
    for (let i = 0; i < count; i++) stock.take('chocolate', i);
    const divisor = gcd(count, denominator);
    assert.equal(stock.simplify('chocolate', cakeId, divisor), divisor > 1);
    const portions = stock.portions('chocolate');
    assert.equal(compare(stock.amount('chocolate'), { numerator: count, denominator }), 0);
    assert.deepEqual(portions.flatMap(({ ids }) => ids), Array.from({ length: count }, (_, i) => i));
    assert.equal(stock.canSimplify('chocolate'), false);
    assert.equal(stock.returnPiece('chocolate', portions[0].ids, cakeId), true);
    assert.equal(stock.count(stock.cake('chocolate', cakeId)!), count - portions[0].ids.length);
    for (const id of portions[0].ids) assert.equal(stock.take('chocolate', id), true);
    assert.equal(compare(stock.amount('chocolate'), { numerator: count, denominator }), 0);
  }
});
test('three whole cakes and a fractional cake occupy four distinct plates', () => {
  const stock = new CakeInventory();
  for (let i = 0; i < 3; i++) stock.take('chocolate', 0);
  const fractional = stock.active.chocolate.id;
  stock.cut('chocolate', 12);
  for (let i = 0; i < 3; i++) stock.take('chocolate', i);
  assert.deepEqual(stock.amount('chocolate'), { numerator: 39, denominator: 12 });
  assert.equal(stock.occupied, 4);
  assert.equal(new Set(stock.portions('chocolate').map(({ plate }) => plate)).size, 4);
  stock.simplify('chocolate', fractional, 3);
  assert.deepEqual(stock.amount('chocolate'), { numerator: 13, denominator: 4 });
  const quarter = stock.portions('chocolate').find(({ cakeId }) => cakeId === fractional)!;
  stock.returnPiece('chocolate', quarter.ids, quarter.cakeId);
  assert.equal(stock.occupied, 3);
  assert.equal(stock.active.chocolate.id, fractional);
  stock.cut('chocolate', 8); stock.take('chocolate', 0);
  assert.deepEqual(stock.amount('chocolate'), { numerator: 25, denominator: 8 });
  assert.equal(stock.occupied, 4);
});
test('recutting one cake preserves other cakes of the same flavor', () => {
  const stock = new CakeInventory();
  stock.take('chocolate', 0); stock.take('chocolate', 0);
  stock.cut('chocolate', 3); stock.take('chocolate', 0);
  stock.cut('lemon', 4); stock.take('lemon', 0);
  stock.cut('chocolate', 12);
  assert.equal(compare(stock.amount('chocolate'), { numerator: 2, denominator: 1 }), 0);
  assert.equal(compare(stock.amount('lemon'), { numerator: 1, denominator: 4 }), 0);
  assert.equal(stock.returnPiece('chocolate', [0], -1), false);
});
test('a complete partition can transfer as a whole, but a partial cake cannot', () => {
  const stock = new CakeInventory();
  stock.cut('chocolate', 12);
  assert.equal(stock.takeWhole('chocolate'), true);
  assert.deepEqual(stock.amount('chocolate'), { numerator: 1, denominator: 1 });
  assert.equal(stock.active.chocolate.division, 0);
  stock.cut('chocolate', 4); stock.take('chocolate', 0);
  assert.equal(stock.takeWhole('chocolate'), false);
  assert.deepEqual(stock.amount('chocolate'), { numerator: 5, denominator: 4 });
});
test('returning slices from older cakes keeps partitions and flavors distinct', () => {
  const stock = new CakeInventory(), first = stock.active.chocolate.id;
  stock.cut('chocolate', 4);
  for (let i = 0; i < 4; i++) stock.take('chocolate', i);
  const second = stock.active.chocolate.id;
  stock.cut('chocolate', 6);
  for (let i = 0; i < 3; i++) stock.take('chocolate', i);
  stock.returnPiece('chocolate', [0], first);
  assert.equal(compare(stock.amount('chocolate'), { numerator: 5, denominator: 4 }), 0);
  stock.simplify('chocolate', second, 3);
  const half = stock.portions('chocolate').find(({ cakeId }) => cakeId === second)!;
  stock.returnPiece('chocolate', half.ids, second);
  assert.equal(compare(stock.amount('chocolate'), { numerator: 3, denominator: 4 }), 0);
  assert.equal(stock.active.chocolate.division, 6);
});
test('capacity blocks new plates but permits filling an existing one', () => {
  const stock = new CakeInventory();
  for (let i = 0; i < 6; i++) stock.take('chocolate', 0);
  stock.cut('chocolate', 4); stock.take('chocolate', 0);
  assert.equal(stock.full, true);
  for (let i = 1; i < 4; i++) assert.equal(stock.take('chocolate', i), true);
  const fresh = stock.active.chocolate;
  assert.equal(stock.take('chocolate', 0), false);
  assert.equal(fresh.division, 0);
  const old = stock.portions('chocolate')[0];
  stock.returnPiece('chocolate', old.ids, old.cakeId);
  assert.equal(stock.occupied, 6);
  assert.equal(stock.take('chocolate', 0), true);
  assert.equal(stock.portions('chocolate').find(({ cakeId }) => cakeId === old.cakeId)!.plate, old.plate);
  stock.clear();
  assert.equal(stock.occupied, 0);
  assert.equal(stock.amount('chocolate').numerator, 0);
});
