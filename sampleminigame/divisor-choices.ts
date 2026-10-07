import type { Fraction } from './catalog.ts';
import { validDivisor } from './fractions.ts';

function sample(values: number[], count: number, random: () => number) {
  const pool = [...values], result: number[] = [];
  while (pool.length && result.length < count) {
    const index = Math.min(pool.length - 1, Math.floor(random() * pool.length));
    result.push(pool.splice(index, 1)[0]);
  }
  return result;
}
export function divisorChoices(fraction: Fraction, random: () => number = Math.random) {
  const candidates = Array.from({ length: Math.max(0, fraction.denominator - 1) }, (_, i) => i + 2);
  const valid = candidates.filter((divisor) => validDivisor(fraction, divisor));
  if (!valid.length) return [];
  const choices = sample(valid, 4, random);
  choices.push(...sample(candidates.filter((divisor) => !valid.includes(divisor)), 4 - choices.length, random));
  return sample(choices, choices.length, random);
}
