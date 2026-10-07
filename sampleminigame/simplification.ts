import { Bakery, type Flavor } from './domain';
import type { Fraction } from './catalog';
import { fraction, icon } from './quantity-ui';
import { validDivisor } from './fractions';
import { divisorChoices } from './divisor-choices';
import { cakeName, t } from './i18n';

export class Simplification {
  dialog = document.querySelector<HTMLDialogElement>('#simplification')!;
  choices = this.dialog.querySelector<HTMLFieldSetElement>('#simplification-choices')!;
  divisor: number | null = null;
  submit = this.dialog.querySelector<HTMLButtonElement>('[type="submit"]')!;
  flavor: Flavor = 'chocolate';
  cakeId = -1;
  before: Fraction = { numerator: 0, denominator: 1 };
  finished = false;
  constructor(private state: Bakery, private reward: () => void) {
    this.choices.addEventListener('change', (event) => {
      const input = event.target as HTMLInputElement;
      if (this.finished || !input.checked) return;
      this.divisor = Number(input.value); this.preview();
    });
    this.dialog.querySelector('form')!.addEventListener('submit', (event) => { event.preventDefault(); this.confirm(); });
    this.dialog.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-simplification]');
      if (!button || button.disabled) return;
      const action = button.dataset.simplification;
      if (action === 'close') this.close();
      if (action === 'plate') this.select(Number(button.dataset.cake));
    });
    this.dialog.addEventListener('close', () => {
      const opener = document.querySelector<HTMLButtonElement>(`[data-action="simplify"][data-flavor="${this.flavor}"]:not(:disabled)`);
      (opener ?? document.querySelector<HTMLButtonElement>(`[data-action="flavor"][data-flavor="${this.flavor}"]`))?.focus({ preventScroll: true });
    });
  }
  open(flavor: Flavor) {
    const cake = this.state.inventory.simplifiable(flavor)[0];
    if (!cake || this.state.complete) return;
    this.flavor = flavor; this.finished = false;
    this.dialog.classList.remove('is-complete');
    this.select(cake.id); this.dialog.showModal();
    this.dialog.querySelector<HTMLButtonElement>('[data-simplification="close"]')!.focus();
  }
  select(cakeId: number) {
    const cake = this.state.inventory.cake(this.flavor, cakeId);
    if (!cake || !this.state.inventory.reducible(cake)) return;
    this.cakeId = cakeId; this.before = this.state.inventory.fraction(cake);
    this.divisor = null; this.choices.disabled = false;
    this.choices.querySelector('.divisor-options')!.innerHTML = divisorChoices(this.before).map((value) => `<label class="divisor-choice"><input type="radio" name="simplify-divisor" value="${value}" aria-label="${t('divisorOption', { number: value })}" /><span>${value}</span></label>`).join('');
    this.localize();
  }
  localize() {
    const cake = this.state.inventory.cake(this.flavor, this.cakeId);
    if (!cake) return;
    this.dialog.querySelector('#simplification-title')!.textContent = t('simplifyTitle', { cake: cakeName(this.flavor), number: cake.plate! + 1 });
    const cakes = this.finished ? [] : this.state.inventory.simplifiable(this.flavor);
    this.dialog.querySelector('#simplification-plates')!.innerHTML = cakes.length > 1 ? cakes.map((item) => `<button type="button" class="batch-button ${item.id === this.cakeId ? 'active' : ''}" data-simplification="plate" data-cake="${item.id}" aria-pressed="${item.id === this.cakeId}" aria-label="${t('plate', { number: item.plate! + 1 })}">${icon('utensils')}<span>${item.plate! + 1}</span></button>`).join('') : '';
    for (const input of this.choices.querySelectorAll<HTMLInputElement>('input')) input.setAttribute('aria-label', t('divisorOption', { number: Number(input.value) }));
    this.preview();
  }
  preview() {
    const { numerator: n, denominator: d } = this.before, divisor = this.divisor, valid = validDivisor(this.before, divisor);
    const label = divisor === null ? '?' : String(divisor);
    const equation = this.dialog.querySelector<HTMLElement>('#simplification-equation')!;
    equation.innerHTML = `${fraction(n, d)}<span>=</span><span class="fraction divided"><span>${n} <small>&divide; ${label}</small></span><span>${d} <small>&divide; ${label}</small></span></span><span>=</span>${valid ? fraction(n / divisor, d / divisor) : '<span class="fraction unknown"><span>?</span><span>?</span></span>'}`;
    equation.setAttribute('aria-label', t(valid ? 'equationResult' : 'equationPending', { numerator: n, denominator: d, divisor: label, resultNumerator: valid ? n / divisor : '?', resultDenominator: valid ? d / divisor : '?' }));
    this.submit.disabled = !valid && !this.finished;
    this.submit.innerHTML = `${icon(this.finished ? 'check' : 'object-group')}<span>${t(this.finished ? 'done' : 'join')}</span>`;
    this.dialog.querySelector('#simplification-reward')!.innerHTML = this.finished ? `${icon('star')}<span>${t('starEarned')}</span>` : '';
    this.dialog.querySelector('#simplification-feedback')!.textContent = divisor === null ? '' : t(this.finished ? 'sameCake' : valid ? 'equalGroups' : 'unequalGroups');
  }
  confirm() {
    if (this.finished) { this.close(); return; }
    if (!validDivisor(this.before, this.divisor) || !this.state.simplify(this.flavor, this.cakeId, this.divisor)) return;
    this.finished = true; this.choices.disabled = true; this.dialog.classList.add('is-complete');
    this.dialog.querySelector('#simplification-plates')!.innerHTML = '';
    this.preview(); this.reward(); this.submit.focus();
  }
  close() { if (this.dialog.open) this.dialog.close(); }
}
