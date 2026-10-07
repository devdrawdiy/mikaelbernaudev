import { Bakery, flavorInfo, type Flavor } from './domain';
import type { Fraction } from './catalog';
import { fraction, icon } from './quantity-ui';

export class Simplification {
  dialog = document.querySelector<HTMLDialogElement>('#simplification')!;
  input = this.dialog.querySelector<HTMLInputElement>('#simplify-divisor')!;
  submit = this.dialog.querySelector<HTMLButtonElement>('[type="submit"]')!;
  flavor: Flavor = 'chocolate';
  cakeId = -1;
  before: Fraction = { numerator: 0, denominator: 1 };
  finished = false;
  constructor(private state: Bakery, private reward: () => void) {
    this.input.addEventListener('input', () => this.preview());
    this.dialog.querySelector('form')!.addEventListener('submit', (event) => { event.preventDefault(); this.confirm(); });
    this.dialog.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-simplification]');
      if (!button || button.disabled) return;
      const action = button.dataset.simplification;
      if (action === 'close') this.close();
      if (action === 'plate') this.select(Number(button.dataset.cake));
      if (action === 'minus' || action === 'plus') {
        this.input.value = String(Math.max(2, Math.min(this.before.denominator, (Number(this.input.value) || 2) + (action === 'plus' ? 1 : -1))));
        this.preview();
      }
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
    this.select(cake.id); this.dialog.showModal(); this.input.focus(); this.input.select();
  }
  select(cakeId: number) {
    const cake = this.state.inventory.cake(this.flavor, cakeId);
    if (!cake || !this.state.inventory.reducible(cake)) return;
    this.cakeId = cakeId; this.before = this.state.inventory.fraction(cake);
    this.input.value = '2'; this.input.max = String(this.before.denominator);
    this.input.disabled = false;
    this.dialog.querySelector('#simplification-title')!.textContent = `${flavorInfo(this.flavor).name} - Plate ${cake.plate! + 1}`;
    const cakes = this.state.inventory.simplifiable(this.flavor);
    this.dialog.querySelector('#simplification-plates')!.innerHTML = cakes.length > 1 ? cakes.map((item) => `<button type="button" class="batch-button ${item.id === cakeId ? 'active' : ''}" data-simplification="plate" data-cake="${item.id}" aria-pressed="${item.id === cakeId}" aria-label="Plate ${item.plate! + 1}">${icon('utensils')}<span>${item.plate! + 1}</span></button>`).join('') : '';
    this.preview();
  }
  valid() {
    const divisor = Number(this.input.value), { numerator, denominator } = this.before;
    return Number.isInteger(divisor) && divisor >= 2 && numerator % divisor === 0 && denominator % divisor === 0;
  }
  preview() {
    const { numerator: n, denominator: d } = this.before, divisor = Number(this.input.value), valid = this.valid();
    const label = Number.isInteger(divisor) && divisor >= 2 && divisor <= d ? String(divisor) : '?';
    const equation = this.dialog.querySelector<HTMLElement>('#simplification-equation')!;
    equation.innerHTML = `${fraction(n, d)}<span>=</span><span class="fraction divided"><span>${n} <small>&divide; ${label}</small></span><span>${d} <small>&divide; ${label}</small></span></span><span>=</span>${valid ? fraction(n / divisor, d / divisor) : '<span class="fraction unknown"><span>?</span><span>?</span></span>'}`;
    equation.setAttribute('aria-label', `${n}/${d}, divide both numbers by ${label}${valid ? `, equals ${n / divisor}/${d / divisor}` : ', result pending'}`);
    this.submit.disabled = !valid && !this.finished;
    this.submit.innerHTML = `${icon(this.finished ? 'check' : 'object-group')}<span>${this.finished ? 'Done' : 'Join pieces'}</span>`;
    this.dialog.querySelector('#simplification-reward')!.innerHTML = this.finished ? `${icon('star')}<span>+1 star</span>` : '';
    this.dialog.querySelector('#simplification-feedback')!.textContent = this.finished ? 'Same cake. Bigger pieces!' : valid ? 'Equal groups in both numbers.' : 'Choose equal groups for both numbers.';
    for (const action of ['minus', 'plus']) this.dialog.querySelector<HTMLButtonElement>(`[data-simplification="${action}"]`)!.disabled = this.finished || (action === 'minus' ? divisor <= 2 : divisor >= d);
  }
  confirm() {
    if (this.finished) { this.close(); return; }
    if (!this.valid() || !this.state.simplify(this.flavor, this.cakeId, Number(this.input.value))) return;
    this.finished = true; this.input.disabled = true; this.dialog.classList.add('is-complete');
    this.dialog.querySelector('#simplification-plates')!.innerHTML = '';
    this.preview(); this.reward(); this.submit.focus();
  }
  close() { if (this.dialog.open) this.dialog.close(); }
}
