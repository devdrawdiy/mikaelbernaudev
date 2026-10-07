import { language, languages, t, type TranslationKey } from './i18n';

export function renderLocale(root: HTMLElement) {
  document.documentElement.lang = language(); document.title = t('pageTitle');
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n]')) element.textContent = t(element.dataset.i18n as TranslationKey);
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n-label]')) element.setAttribute('aria-label', t(element.dataset.i18nLabel as TranslationKey));
  for (const element of root.querySelectorAll<HTMLElement>('[data-i18n-title]')) element.title = t(element.dataset.i18nTitle as TranslationKey);
  for (const picker of root.querySelectorAll<HTMLSelectElement>('[data-language-picker]')) {
    if (!picker.options.length) picker.innerHTML = languages.map(({ id, name }) => `<option value="${id}">${name}</option>`).join('');
    picker.value = language(); picker.setAttribute('aria-label', t('language')); picker.title = t('language');
  }
}
