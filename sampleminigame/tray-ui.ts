import { Bakery, flavors, plateCapacity } from './domain';
import { compare } from './fractions';
import { icon, quantity } from './quantity-ui';

export function renderTray(state: Bakery, locked: boolean) {
  document.querySelector('#plate-counter')!.textContent = `${state.occupied} / ${plateCapacity} plates`;
  document.querySelector('#tray-portions')!.innerHTML = flavors.map(({ id, name, color }) => {
    const portions = state.portions(id), amount = state.amount(id);
    const request = state.order.items.find((item) => item.flavor === id);
    const matched = request && !compare(amount, request);
    const plates = [...new Set(portions.map(({ plate }) => plate))].sort((a, b) => a - b);
    return `<div class="tray-group ${matched ? 'matched' : ''}" data-flavor="${id}" style="--flavor:${color}">
      <div class="tray-title"><span class="flavor-dot"></span><span>${name}</span>${matched ? icon('check') : ''}<strong data-numerator="${amount.numerator}" data-denominator="${amount.denominator}">${quantity(amount)}</strong></div>
      <div class="portion-actions"><div class="return-pieces">${plates.map((plate) => `<div class="plate-portions"><span class="plate-number" title="Plate ${plate + 1}">${plate + 1}</span>${portions.filter((portion) => portion.plate === plate).map(({ cakeId, ids, denominator, index }) => `<button data-action="return" data-flavor="${id}" data-cake="${cakeId}" data-ids="${ids.join(',')}" title="Return plate ${plate + 1}, piece ${index + 1}" aria-label="Return 1/${denominator} of ${name.toLowerCase()} from plate ${plate + 1}" ${locked || state.complete ? 'disabled' : ''}>${icon('rotate-left')}<span>${index + 1}</span></button>`).join('')}</div>`).join('')}</div><button class="simplify" data-action="simplify" data-flavor="${id}" title="Merge equal pieces into larger pieces" ${!state.canSimplify(id) || locked || state.complete ? 'disabled' : ''}>${icon('object-group')}<span>Simplify</span></button></div></div>`;
  }).join('');
  for (const action of ['serve', 'clear']) (document.querySelector(`[data-action="${action}"]`) as HTMLButtonElement).disabled = !state.occupied || locked || state.complete;
}
