import { Bakery, flavors, flavorInfo, orders, type Flavor } from './domain';
const previews = import.meta.glob('./CoffeeShopStarterPack/Test/ScreenShots/PW_cheesecake*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const fraction = (n: number, d: number) => `<span class="fraction" role="img" aria-label="${n} out of ${d} equal pieces"><span aria-hidden="true">${n}</span><span aria-hidden="true">${d}</span></span>`;
const icon = (name: string) => `<i class="fa-solid fa-${name}" aria-hidden="true"></i>`;
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
    document.querySelector('#guest-counter')!.textContent = `${state.index} / ${orders.length} guests`;
    document.querySelector('#progress')!.innerHTML = orders.map((_, i) => `<span class="${i < state.index ? 'done' : ''}">${i < state.index ? icon('check') : i + 1}</span>`).join('');
    document.querySelector('#ticket')!.innerHTML = `<div class="ticket-heading"><span class="avatar">${state.order.guest[0]}</span><div><span class="eyebrow">${state.complete ? 'All served' : `Guest ${state.index + 1}`}</span><h2>${state.order.guest}'s order</h2></div>${icon('receipt')}</div><div class="request-list">${state.order.items.map(({ flavor, numerator, denominator }) => `<div class="request"><span class="flavor-dot" style="--flavor:${flavorInfo(flavor).color}"></span>${fraction(numerator, denominator)}<span>${flavorInfo(flavor).name}</span></div>`).join('')}</div>`;
    document.querySelector('#cake-menu')!.innerHTML = flavors.map(({ id, name, color, preview }) => `<button class="cake-choice ${id === state.active ? 'active' : ''}" data-action="flavor" data-flavor="${id}" aria-pressed="${id === state.active}" ${locked || state.complete ? 'disabled' : ''} style="--flavor:${color}"><img src="${previews[`./CoffeeShopStarterPack/Test/ScreenShots/${preview}`]}" alt=""/><span>${name}</span></button>`).join('');
    document.querySelector('#focus-name')!.textContent = `${active.name} cake`;
    document.querySelector('#focus-fraction')!.innerHTML = cake.division ? `${fraction(1, cake.division)}<span>per piece</span>` : '<span>One whole cake</span>';
    this.input.disabled = locked || state.complete;
    for (const name of ['cut', 'minus', 'plus']) (document.querySelector(`[data-action="${name}"]`) as HTMLButtonElement).disabled = locked || state.complete;
    const unfold = document.querySelector<HTMLButtonElement>('[data-action="spread"]')!;
    unfold.disabled = !cake.division || locked || state.complete; unfold.innerHTML = icon(spread ? 'compress' : 'expand');
    unfold.title = spread ? 'Bring pieces together' : 'Spread pieces';
    unfold.setAttribute('aria-label', unfold.title); unfold.setAttribute('aria-pressed', String(spread));
    document.querySelector('#available-pieces')!.innerHTML = cake.division ? cake.selected.map((selected, i) => `<button class="piece-button" data-action="take" data-id="${i}" title="${selected ? 'On tray' : `Move piece ${i + 1}: 1/${cake.division}`}" aria-label="Move piece ${i + 1}, 1/${cake.division} of ${active.name.toLowerCase()} cake to tray" ${selected || locked || state.complete ? 'disabled' : ''}>${i + 1}</button>`).join('') : '';
    document.querySelector('#tray-portions')!.innerHTML = flavors.map(({ id, name, color }) => {
      const portions = state.portions(id), d = portions[0]?.denominator || state.cakes[id].division || 1;
      const requested = state.order.items.find((item) => item.flavor === id);
      const matched = requested && state.count(id) * requested.denominator === requested.numerator * (state.cakes[id].division || 1);
      return `<div class="tray-group ${matched ? 'matched' : ''}" style="--flavor:${color}"><div class="tray-title"><span class="flavor-dot"></span><span>${name}</span>${matched ? icon('check') : ''}<strong>${fraction(portions.length, d)}</strong></div><div class="portion-actions"><div class="return-pieces">${portions.map(({ ids }, i) => `<button data-action="return" data-flavor="${id}" data-ids="${ids.join(',')}" title="Return piece ${i + 1}" aria-label="Return ${name.toLowerCase()} piece ${i + 1} to cake" ${locked || state.complete ? 'disabled' : ''}>${icon('rotate-left')}<span>${i + 1}</span></button>`).join('')}</div><button class="simplify" data-action="simplify" data-flavor="${id}" title="Merge equal pieces into larger pieces" ${!state.canSimplify(id) || locked || state.complete ? 'disabled' : ''}>${icon('object-group')}<span>Simplify</span></button></div></div>`;
    }).join('');
    const hasCake = flavors.some(({ id }) => state.count(id) > 0);
    for (const action of ['serve', 'clear']) (document.querySelector(`[data-action="${action}"]`) as HTMLButtonElement).disabled = !hasCake || locked || state.complete;
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
  select(flavor: Flavor) { this.input.value = String(this.pending[flavor]); }
  say(text: string, kind = '') { this.message.textContent = text; this.message.dataset.kind = kind; }
  reset() { this.pending = { chocolate: 4, lemon: 4, cheesecake: 4 }; this.select('chocolate'); this.say(''); }
}
