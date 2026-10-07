import { Bakery, flavors, flavorInfo, type Flavor } from './domain';
import { fraction, icon, quantity } from './quantity-ui';
import { renderTray } from './tray-ui';
const previews = import.meta.glob('./CoffeeShopStarterPack/Test/ScreenShots/PW_cheesecake*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
export class BakeryUI {
  root = document.querySelector<HTMLElement>('#bakery')!;
  input = document.querySelector<HTMLInputElement>('#piece-count')!;
  message = document.querySelector<HTMLElement>('#message')!;
  pending: Record<Flavor, number> = { chocolate: 4, lemon: 4, cheesecake: 4 };
  render(state: Bakery, spread: boolean, locked: boolean) {
    const focused = document.activeElement as HTMLElement | null;
    const identity = focused?.dataset.action ? { ...focused.dataset } : null;
    this.root.dataset.complete = String(state.complete); this.root.setAttribute('aria-busy', String(locked));
    const active = flavorInfo(state.active), cake = state.cakes[state.active];
    document.querySelector('#guest-counter')!.textContent = `${state.index} / ${state.orders.length} guests`;
    const stars = document.querySelector<HTMLElement>('#star-counter')!;
    stars.querySelector('span')!.textContent = String(state.stars); stars.setAttribute('aria-label', `${state.stars} stars`);
    document.querySelector('#ending-stars')!.innerHTML = `${icon('star')}<span>${state.stars} ${state.stars === 1 ? 'star' : 'stars'}</span>`;
    document.querySelector('#progress')!.innerHTML = state.orders.map((_, i) => `<span class="${i < state.index ? 'done' : ''}">${i < state.index ? icon('check') : i + 1}</span>`).join('');
    document.querySelector('#ticket')!.innerHTML = `<div class="ticket-heading"><span class="avatar">${state.order.guest[0]}</span><div><span class="eyebrow">${state.complete ? 'All served' : `Guest ${state.index + 1}`}</span><h2>${state.order.guest}'s order</h2></div>${icon('receipt')}</div><div class="request-list">${state.order.items.map((request) => `<div class="request" data-flavor="${request.flavor}" data-numerator="${request.numerator}" data-denominator="${request.denominator}"><span class="flavor-dot" style="--flavor:${flavorInfo(request.flavor).color}"></span>${quantity(request)}<span>${flavorInfo(request.flavor).name}</span></div>`).join('')}</div>`;
    document.querySelector('#cake-menu')!.innerHTML = flavors.map(({ id, name, color, preview }) => `<button class="cake-choice ${id === state.active ? 'active' : ''}" data-action="flavor" data-flavor="${id}" aria-pressed="${id === state.active}" ${locked || state.complete ? 'disabled' : ''} style="--flavor:${color}"><img src="${previews[`./CoffeeShopStarterPack/Test/ScreenShots/${preview}`]}" alt=""/><span>${name}</span></button>`).join('');
    document.querySelector('#focus-name')!.textContent = `${active.name} cake`;
    document.querySelector('#cake-batches')!.innerHTML = state.stock[state.active].length > 1 ? state.stock[state.active].map((batch, index) => `<button class="batch-button ${batch.id === cake.id ? 'active' : ''}" data-action="batch" data-cake="${batch.id}" aria-pressed="${batch.id === cake.id}" title="${active.name} cake ${index + 1}${batch.plate !== null ? `, plate ${batch.plate + 1}` : ''}" ${locked || state.complete ? 'disabled' : ''}>${icon('cake-candles')}<span>${index + 1}</span></button>`).join('') : '';
    document.querySelector('#focus-fraction')!.innerHTML = cake.division ? `${fraction(1, cake.division)}<span>per piece</span>` : '<span>One whole cake</span>';
    this.input.disabled = locked || state.complete;
    (document.querySelector('[data-action="whole"]') as HTMLButtonElement).disabled = locked || state.complete || cake.selected.some(Boolean) || state.trayFull;
    for (const name of ['cut', 'minus', 'plus']) (document.querySelector(`[data-action="${name}"]`) as HTMLButtonElement).disabled = locked || state.complete;
    const unfold = document.querySelector<HTMLButtonElement>('[data-action="spread"]')!;
    unfold.disabled = !cake.division || locked || state.complete; unfold.innerHTML = icon(spread ? 'compress' : 'expand');
    unfold.title = spread ? 'Bring pieces together' : 'Spread pieces';
    unfold.setAttribute('aria-label', unfold.title); unfold.setAttribute('aria-pressed', String(spread));
    document.querySelector('#available-pieces')!.innerHTML = cake.division ? cake.selected.map((selected, i) => `<button class="piece-button" data-action="take" data-id="${i}" title="${selected ? 'On tray' : `Move piece ${i + 1}: 1/${cake.division}`}" aria-label="Move piece ${i + 1}, 1/${cake.division} of ${active.name.toLowerCase()} cake to tray" ${selected || locked || state.complete ? 'disabled' : ''}>${i + 1}</button>`).join('') : '';
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
  say(text: string, kind = '') { this.message.textContent = text; this.message.dataset.kind = kind; }
  reset() { this.pending = { chocolate: 4, lemon: 4, cheesecake: 4 }; this.select('chocolate'); this.say(''); }
}
