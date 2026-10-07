import type { Fraction } from './catalog';
import { t } from './i18n';
export const icon = (name: string) => `<i class="fa-solid fa-${name}" aria-hidden="true"></i>`;
export const fraction = (n: number, d: number) => `<span class="fraction" role="img" aria-label="${t('fractionLabel', { numerator: n, denominator: d })}"><span aria-hidden="true">${n}</span><span aria-hidden="true">${d}</span></span>`;
export function quantity({ numerator, denominator }: Fraction) {
  const whole = Math.floor(numerator / denominator), remainder = numerator % denominator;
  return `<span class="quantity">${whole || !remainder ? `<span class="whole-number">${whole}</span>` : ''}${remainder ? fraction(remainder, denominator) : ''}</span>`;
}
