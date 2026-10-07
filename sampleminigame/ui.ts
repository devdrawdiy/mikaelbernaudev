import { Bakery, flavors, flavorInfo, type Flavor } from './domain';
import { fraction, icon, quantity } from './quantity-ui';
import { renderTray } from './tray-ui';
import { cakeName, t } from './i18n';
import { renderLocale } from './locale-ui';
const previews = import.meta.glob('./CoffeeShopStarterPack/Test/ScreenShots/PW_cheesecake*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export class BakeryUI {
  root = document.querySelector<HTMLElement>('#bakery')!;
  input = document.querySelector<HTMLInputElement>('#piece-count')!;
  message = document.querySelector<HTMLElement>('#message')!;
  feedback = () => '';
  pending: Record<Flavor, number> = { chocolate: 4, lemon: 4, cheesecake: 4 };
  render(state: Bakery, spread: boolean, locked: boolean, muted = true) {
    const focused = document.activeElement as HTMLElement | null;
    const identity = focused?.dataset.action ? { ...focused.dataset } : null;
    renderLocale(this.root); this.message.textContent = this.feedback();
    this.root.dataset.complete = String(state.complete); this.root.setAttribute('aria-busy', String(locked));
    const active = flavorInfo(state.active), cake = state.cakes[state.active];
    document.querySelector('#guest-counter')!.textContent = t('guestProgress', { served: state.index, total: state.orders.length });
    const stars = document.querySelector<HTMLElement>('#star-counter')!;
    stars.querySelector('span')!.textContent = String(state.stars); stars.setAttribute('aria-label', t('stars', { count: state.stars }));
    document.querySelector('#ending-stars')!.innerHTML = `${icon('star')}<span>${t('stars', { count: state.stars })}</span>`;
    document.querySelector('#progress')!.innerHTML = state.orders.map((_, i) => `<span class="${i < state.index ? 'done' : ''}">${i < state.index ? icon('check') : i + 1}</span>`).join('');
    document.querySelector('#ticket')!.innerHTML = `<div class="ticket-heading"><span class="avatar">${state.order.guest[0]}</span><div><span class="eyebrow">${state.complete ? t('allServed') : t('guestNumber', { number: state.index + 1 })}</span><h2>${t('orderTitle', { guest: state.order.guest })}</h2></div>${icon('receipt')}</div><div class="request-list">${state.order.items.map((request) => `<div class="request" data-flavor="${request.flavor}" data-numerator="${request.numerator}" data-denominator="${request.denominator}"><span class="flavor-dot" style="--flavor:${flavorInfo(request.flavor).color}"></span>${quantity(request)}<span>${cakeName(request.flavor)}</span></div>`).join('')}</div>`;
    document.querySelector('#cake-menu')!.innerHTML = flavors.map(({ id, color, preview }) => `<button class="cake-choice ${id === state.active ? 'active' : ''}" data-action="flavor" data-flavor="${id}" aria-pressed="${id === state.active}" ${locked || state.complete ? 'disabled' : ''} style="--flavor:${color}"><img src="${previews[`./CoffeeShopStarterPack/Test/ScreenShots/${preview}`]}" alt=""/><span>${cakeName(id)}</span></button>`).join('');
    document.querySelector('#focus-name')!.textContent = cakeName(active.id);
    document.querySelector('#cake-batches')!.innerHTML = state.stock[state.active].length > 1 ? state.stock[state.active].map((batch, index) => `<button class="batch-button ${batch.id === cake.id ? 'active' : ''}" data-action="batch" data-cake="${batch.id}" aria-pressed="${batch.id === cake.id}" title="${t('batch', { cake: cakeName(active.id), number: index + 1 })}${batch.plate !== null ? t('batchPlate', { number: batch.plate + 1 }) : ''}" ${locked || state.complete ? 'disabled' : ''}>${icon('cake-candles')}<span>${index + 1}</span></button>`).join('') : '';
    document.querySelector('#focus-fraction')!.innerHTML = cake.division ? `${fraction(1, cake.division)}<span>${t('perPiece')}</span>` : `<span>${t('wholeCake')}</span>`;
    this.input.disabled = locked || state.complete;
    if (this.input.validity.customError) this.input.setCustomValidity(t('invalidPieces'));
    (document.querySelector('[data-action="whole"]') as HTMLButtonElement).disabled = locked || state.complete || cake.selected.some(Boolean) || state.trayFull;
    for (const name of ['cut', 'minus', 'plus']) (document.querySelector(`[data-action="${name}"]`) as HTMLButtonElement).disabled = locked || state.complete;
    const unfold = document.querySelector<HTMLButtonElement>('[data-action="spread"]')!;
    unfold.disabled = !cake.division || locked || state.complete; unfold.innerHTML = icon(spread ? 'compress' : 'expand');
    unfold.title = t(spread ? 'fold' : 'spread');
    unfold.setAttribute('aria-label', unfold.title); unfold.setAttribute('aria-pressed', String(spread));
    const sound = document.querySelector<HTMLButtonElement>('[data-action="sound"]')!;
    sound.title = t(muted ? 'soundOn' : 'soundOff'); sound.setAttribute('aria-label', sound.title);
    document.querySelector('#available-pieces')!.innerHTML = cake.division ? cake.selected.map((selected, i) => `<button class="piece-button" data-action="take" data-id="${i}" title="${selected ? t('onTray') : t('movePiece', { number: i + 1, denominator: cake.division })}" aria-label="${t('movePieceLabel', { number: i + 1, denominator: cake.division, cake: cakeName(active.id).toLocaleLowerCase() })}" ${selected || locked || state.complete ? 'disabled' : ''}>${i + 1}</button>`).join('') : '';
    renderTray(state, locked);
    const ending = document.querySelector<HTMLDialogElement>('#ending')!;
    if (state.complete && !ending.open) ending.showModal();
    if (!state.complete && ending.open) ending.close();
    if (identity && focused && !focused.isConnected) {
      const selector = Object.entries(identity).map(([key, value]) => `[data-${key}="${CSS.escape(value!)}"]`).join('');
      const replacement = this.root.querySelector<HTMLButtonElement>(selector);
      const next = replacement && !replacement.disabled ? replacement : this.root.querySelector<HTMLButtonElement>('[data-action="take"]:not(:disabled)');
      next?.focus({ preventScroll: true });
    }
  }
  select(flavor: Flavor, division = 0) { this.input.value = String(division > 1 ? division : this.pending[flavor]); }
  say(text: string | (() => string) = '', kind = '') { this.feedback = typeof text === 'function' ? text : () => text; this.message.textContent = this.feedback(); this.message.dataset.kind = kind; }
  reset() { this.pending = { chocolate: 4, lemon: 4, cheesecake: 4 }; this.select('chocolate'); this.say(''); }
}
