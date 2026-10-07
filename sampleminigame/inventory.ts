import { flavors, plateCapacity, type Flavor, type Fraction } from './catalog.ts';
import { add, gcd, validDivisor } from './fractions.ts';
export type Cake = { id: number; division: number; selected: boolean[]; groupSize: number; plate: number | null };
export type Portion = { cakeId: number; ids: number[]; denominator: number; sourceDivision: number; plate: number; index: number };

export class CakeInventory {
  serial = 0;
  stock = flavors.reduce((stock, { id }) => { stock[id] = []; return stock; }, {} as Record<Flavor, Cake[]>);
  active = {} as Record<Flavor, Cake>;
  constructor(startSerial = 0) { this.serial = startSerial; flavors.forEach(({ id }) => this.replenish(id)); }
  cake(id: Flavor, cakeId: number) { return this.stock[id].find((cake) => cake.id === cakeId); }
  count(cake: Cake) { return cake.selected.filter(Boolean).length; }
  get occupied() { return Object.values(this.stock).flat().filter((cake) => cake.plate !== null).length; }
  get full() { return this.occupied === plateCapacity; }
  replenish(id: Flavor) {
    let cake = this.stock[id].find((item) => this.count(item) === 0 && item !== this.active[id]);
    if (!cake) { cake = { id: this.serial++, division: 0, selected: [], groupSize: 1, plate: null }; this.stock[id].push(cake); }
    cake.division = 0; cake.selected = []; cake.groupSize = 1; cake.plate = null;
    this.active[id] = cake;
  }
  select(id: Flavor, cakeId: number) {
    const cake = this.cake(id, cakeId);
    if (!cake) return false;
    this.active[id] = cake;
    return true;
  }
  restore(cake: Cake) { cake.selected.fill(false); cake.groupSize = 1; cake.plate = null; }
  cut(id: Flavor, count: number) {
    if (!Number.isInteger(count) || count < 2 || count > 12) return false;
    const cake = this.active[id];
    this.restore(cake); cake.division = count; cake.selected = Array(count).fill(false);
    return true;
  }
  reserve(cake: Cake) {
    if (cake.plate !== null) return true;
    const used = new Set(Object.values(this.stock).flat().map((item) => item.plate));
    const free = Array.from({ length: plateCapacity }, (_, index) => index).find((index) => !used.has(index));
    if (free === undefined) return false;
    cake.plate = free;
    return true;
  }
  take(id: Flavor, slice: number, cakeId = this.active[id].id) {
    const cake = this.cake(id, cakeId);
    if (!cake || this.active[id] !== cake || !Number.isInteger(slice) || slice < 0 || slice >= (cake.division || 1) || cake.selected[slice]) return false;
    if (!this.reserve(cake)) return false;
    if (!cake.division) { cake.division = 1; cake.selected = [false]; }
    cake.selected[slice] = true; cake.groupSize = 1;
    if (this.count(cake) === cake.division) this.replenish(id);
    return true;
  }
  takeWhole(id: Flavor, cakeId = this.active[id].id) {
    const cake = this.cake(id, cakeId);
    if (!cake || cake !== this.active[id] || this.count(cake) || !this.reserve(cake)) return false;
    cake.division ||= 1; cake.selected = Array(cake.division).fill(true); cake.groupSize = cake.division;
    this.replenish(id);
    return true;
  }
  returnPiece(id: Flavor, ids: number[], cakeId: number) {
    const cake = this.cake(id, cakeId);
    if (!cake || !ids.length || ids.some((slice) => !Number.isInteger(slice) || !cake.selected[slice])) return false;
    ids.forEach((slice) => { cake.selected[slice] = false; }); cake.groupSize = 1;
    if (!this.count(cake)) {
      cake.plate = null;
      if (cake.division === 1) { cake.division = 0; cake.selected = []; }
    }
    this.active[id] = cake;
    return true;
  }
  portions(id: Flavor): Portion[] {
    return this.stock[id].flatMap((cake) => {
      if (cake.plate === null) return [];
      const ids = cake.selected.flatMap((selected, i) => selected ? [i] : []);
      const size = cake.groupSize;
      return Array.from({ length: ids.length / size }, (_, index) => ({ cakeId: cake.id, ids: ids.slice(index * size, (index + 1) * size), denominator: cake.division / size, sourceDivision: cake.division, plate: cake.plate!, index }));
    });
  }
  amount(id: Flavor): Fraction {
    return this.portions(id).reduce((total, portion) => add(total, { numerator: 1, denominator: portion.denominator }), { numerator: 0, denominator: 1 });
  }
  fraction(cake: Cake): Fraction { return { numerator: this.count(cake) / cake.groupSize, denominator: cake.division / cake.groupSize }; }
  reducible(cake: Cake) { const { numerator, denominator } = this.fraction(cake); return numerator > 0 && gcd(numerator, denominator) > 1; }
  simplifiable(id: Flavor) { return this.stock[id].filter((cake) => this.reducible(cake)); }
  canSimplify(id: Flavor) { return this.simplifiable(id).length > 0; }
  simplify(id: Flavor, cakeId: number, divisor: number) {
    const cake = this.cake(id, cakeId);
    if (!cake || !this.reducible(cake) || !validDivisor(this.fraction(cake), divisor)) return false;
    cake.groupSize *= divisor;
    return true;
  }
  clear() { Object.values(this.stock).flat().forEach((cake) => this.restore(cake)); }
}
