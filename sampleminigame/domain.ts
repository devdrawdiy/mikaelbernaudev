export const flavors = [
  { id: 'chocolate', name: 'Chocolate', color: '#845047', sponge: '#774434', cream: '#f0c3a0', frosting: '#4c2926', accent: '#f9e5ce', preview: 'PW_cheesecake_chocolatte.png' },
  { id: 'lemon', name: 'Lemon', color: '#d2a828', sponge: '#e7b54e', cream: '#fff2c6', frosting: '#ffe178', accent: '#5e9170', preview: 'PW_cheesecake_lime.png' },
  { id: 'cheesecake', name: 'Cheesecake', color: '#c75c7a', sponge: '#c4986b', cream: '#fff1da', frosting: '#f2a4b8', accent: '#b9355b', preview: 'PW_cheesecake_strawberry.png' },
] as const;
export type Flavor = typeof flavors[number]['id'];
export type Request = { flavor: Flavor; numerator: number; denominator: number };
export type Cake = { division: number; selected: boolean[]; merged: boolean };
export type Portion = { ids: number[]; denominator: number };
export const orders: { guest: string; items: Request[] }[] = [
  { guest: 'Mia', items: [{ flavor: 'chocolate', numerator: 1, denominator: 2 }] },
  { guest: 'Leo', items: [{ flavor: 'lemon', numerator: 2, denominator: 3 }] },
  { guest: 'Ivy', items: [{ flavor: 'cheesecake', numerator: 1, denominator: 8 }] },
  { guest: 'Sam', items: [{ flavor: 'chocolate', numerator: 1, denominator: 4 }, { flavor: 'lemon', numerator: 1, denominator: 2 }] },
  { guest: 'Noor', items: [{ flavor: 'lemon', numerator: 3, denominator: 5 }] },
  { guest: 'Alex', items: [{ flavor: 'lemon', numerator: 2, denominator: 3 }, { flavor: 'chocolate', numerator: 1, denominator: 2 }, { flavor: 'cheesecake', numerator: 1, denominator: 8 }] },
];
export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}
export const flavorInfo = (id: Flavor) => flavors.find((flavor) => flavor.id === id)!;
export class Bakery {
  index = 0;
  active: Flavor = 'chocolate';
  cakes = this.freshCakes();
  get complete() { return this.index === orders.length; }
  get order() { return orders[Math.min(this.index, orders.length - 1)]; }
  freshCakes(): Record<Flavor, Cake> {
    return flavors.reduce((cakes, { id }) => {
      cakes[id] = { division: 0, selected: [], merged: false };
      return cakes;
    }, {} as Record<Flavor, Cake>);
  }
  count(id: Flavor) { return this.cakes[id].selected.filter(Boolean).length; }
  cut(id: Flavor, count: number) {
    if (this.complete || !Number.isInteger(count) || count < 2 || count > 12) return false;
    this.cakes[id] = { division: count, selected: Array(count).fill(false), merged: false };
    return true;
  }
  take(id: Flavor, slice: number) {
    const cake = this.cakes[id];
    if (this.complete || !Number.isInteger(slice) || slice < 0 || slice >= cake.division || cake.selected[slice]) return false;
    cake.selected[slice] = true;
    cake.merged = false;
    return true;
  }
  returnPiece(id: Flavor, ids: number[]) {
    const cake = this.cakes[id];
    if (this.complete || !ids.length || ids.some((slice) => !cake.selected[slice])) return false;
    ids.forEach((slice) => { cake.selected[slice] = false; });
    cake.merged = false;
    return true;
  }
  portions(id: Flavor): Portion[] {
    const cake = this.cakes[id];
    const ids = cake.selected.flatMap((selected, i) => selected ? [i] : []);
    const size = cake.merged && ids.length ? gcd(ids.length, cake.division) : 1;
    return Array.from({ length: ids.length / size }, (_, i) => ({ ids: ids.slice(i * size, (i + 1) * size), denominator: cake.division / size }));
  }
  canSimplify(id: Flavor) {
    const portions = this.portions(id);
    return portions.length > 0 && gcd(portions.length, portions[0].denominator) > 1;
  }
  simplify(id: Flavor) {
    if (this.complete || !this.canSimplify(id)) return false;
    this.cakes[id].merged = true;
    return true;
  }
  clear() {
    if (this.complete) return;
    Object.values(this.cakes).forEach((cake) => { cake.selected.fill(false); cake.merged = false; });
  }
  mismatch(): string | null {
    for (const { id, name } of flavors) {
      const request = this.order.items.find((item) => item.flavor === id);
      const count = this.count(id), division = this.cakes[id].division || 1;
      if (!request && count) return `${this.order.guest} didn't order ${name.toLowerCase()} cake.`;
      if (!request || count * request.denominator === request.numerator * division) continue;
      return `${name}: ${count}/${division} on the tray; ${request.numerator}/${request.denominator} requested. ${count * request.denominator < request.numerator * division ? 'A little more, please!' : 'A little less, please!'}`;
    }
    return null;
  }
  serve() {
    if (this.complete || this.mismatch()) return false;
    this.index++;
    this.cakes = this.freshCakes();
    if (!this.complete) this.active = this.order.items[0].flavor;
    return true;
  }
  replay() {
    this.index = 0;
    this.active = 'chocolate';
    this.cakes = this.freshCakes();
  }
}
