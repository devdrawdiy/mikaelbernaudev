import { createInstance } from 'i18next';
import { en } from './locales/en.ts';
import { sv } from './locales/sv.ts';
import type { Flavor, Fraction } from './catalog.ts';

export type Language = 'sv' | 'en';
export type TranslationKey = keyof typeof en;
export const languages = [{ id: 'sv', name: 'Svenska' }, { id: 'en', name: 'English' }] as const;
const instance = createInstance();
void instance.init({ lng: 'sv', fallbackLng: 'en', initAsync: false, resources: { sv: { translation: sv }, en: { translation: en } }, returnNull: false });
export const language = () => instance.language as Language;
export const t = (key: TranslationKey, values: Record<string, string | number> = {}) => instance.t(key, values);
export const tText = (key: TranslationKey, values: Record<string, string | number> = {}) => instance.t(key, { ...values, interpolation: { escapeValue: false } });
export async function setLanguage(value: string) {
  if (value !== 'sv' && value !== 'en') return false;
  await instance.changeLanguage(value);
  return true;
}
export const cakeName = (flavor: Flavor) => t(`cake_${flavor}`);
export function describeQuantity({ numerator, denominator }: Fraction) {
  const whole = Math.floor(numerator / denominator), remainder = numerator % denominator;
  return remainder ? whole ? t('mixedQuantity', { whole, numerator: remainder, denominator }) : `${remainder}/${denominator}` : String(whole);
}
