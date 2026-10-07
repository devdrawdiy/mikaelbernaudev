import type { Fraction } from './catalog.ts';

export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}
export function add(a: Fraction, b: Fraction): Fraction {
  const denominator = a.denominator / gcd(a.denominator, b.denominator) * b.denominator;
  return { numerator: a.numerator * (denominator / a.denominator) + b.numerator * (denominator / b.denominator), denominator };
}
export function compare(a: Fraction, b: Fraction) {
  return a.numerator * b.denominator - b.numerator * a.denominator;
}
export function validDivisor({ numerator, denominator }: Fraction, divisor: number | null): divisor is number {
  return divisor !== null && Number.isInteger(divisor) && divisor >= 2 && numerator > 0 && numerator % divisor === 0 && denominator % divisor === 0;
}
export function describe({ numerator, denominator }: Fraction) {
  const whole = Math.floor(numerator / denominator), remainder = numerator % denominator;
  return remainder ? `${whole ? `${whole} and ` : ''}${remainder}/${denominator}` : String(whole);
}
