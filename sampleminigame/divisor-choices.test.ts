import { test } from 'node:test';
import assert from 'node:assert/strict';
import { divisorChoices } from './divisor-choices.ts';
import { validDivisor } from './fractions.ts';

const seeded = (seed: number) => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
test('multiple-choice sets are unique, bounded, and always include a valid divisor when reducible', () => {
  const random = seeded(879);
  for (let denominator = 2; denominator <= 12; denominator++) for (let numerator = 1; numerator <= denominator; numerator++) {
    const fraction = { numerator, denominator };
    const valid = Array.from({ length: denominator - 1 }, (_, i) => i + 2).filter((value) => validDivisor(fraction, value));
    for (let i = 0; i < 30; i++) {
      const choices = divisorChoices(fraction, random);
      if (!valid.length) { assert.deepEqual(choices, []); continue; }
      assert.equal(choices.length, Math.min(4, denominator - 1));
      assert.equal(new Set(choices).size, choices.length);
      assert.ok(choices.every((value) => Number.isInteger(value) && value >= 2 && value <= denominator));
      assert.ok(choices.some((value) => valid.includes(value)));
      if (valid.length <= 4) assert.ok(valid.every((value) => choices.includes(value)));
    }
  }
});
test('question-mark state and invalid divisors cannot simplify', () => {
  for (const divisor of [null, 0, 1, 2, 4, 2.5, NaN, Infinity]) {
    assert.equal(validDivisor({ numerator: 3, denominator: 12 }, divisor), false);
  }
  assert.equal(validDivisor({ numerator: 3, denominator: 12 }, 3), true);
});
test('choice order changes and two is not a fixed first choice', () => {
  const random = seeded(734), first = new Map<number, number>(), orders = new Set<string>();
  for (let i = 0; i < 1000; i++) {
    const choices = divisorChoices({ numerator: 6, denominator: 12 }, random);
    orders.add(choices.join(',')); first.set(choices[0], (first.get(choices[0]) ?? 0) + 1);
  }
  assert.ok(orders.size > 20);
  for (const divisor of [2, 3, 6]) assert.ok(first.get(divisor)! > 180 && first.get(divisor)! < 320);
});
test('random boundary values still generate valid, distinct choices', () => {
  for (const random of [() => 0, () => 0.999999, () => 1]) {
    const choices = divisorChoices({ numerator: 3, denominator: 12 }, random);
    assert.equal(choices.length, 4); assert.equal(new Set(choices).size, 4); assert.ok(choices.includes(3));
  }
});
