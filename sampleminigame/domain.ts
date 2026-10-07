import { flavors, type Flavor, type Fraction, type Order } from './catalog.ts';
import { compare } from './fractions.ts';
import { CakeInventory } from './inventory.ts';
import { generateOrders } from './orders.ts';
export { flavors, flavorInfo, plateCapacity, type Flavor, type Request, type Order } from './catalog.ts';
export { gcd } from './fractions.ts';
export type { Cake, Portion } from './inventory.ts';
export type Mismatch = { flavor: Flavor; kind: 'unrequested' | 'tooLittle' | 'tooMuch'; amount: Fraction; requested?: Fraction };

export class Bakery {
  index = 0;
  stars = 0;
  active: Flavor;
  inventory = new CakeInventory();
  orders: Order[];
  private options: { orders?: Order[]; random?: () => number };
  constructor(options: { orders?: Order[]; random?: () => number } = {}) {
    this.options = options;
    this.orders = options.orders ?? generateOrders(options.random);
    this.active = this.order.items[0].flavor;
  }
  get cakes() { return this.inventory.active; }
  get stock() { return this.inventory.stock; }
  get complete() { return this.index === this.orders.length; }
  get order() { return this.orders[Math.min(this.index, this.orders.length - 1)]; }
  get occupied() { return this.inventory.occupied; }
  get trayFull() { return this.inventory.full; }
  amount(id: Flavor) { return this.inventory.amount(id); }
  cut(id: Flavor, count: number) { return !this.complete && this.inventory.cut(id, count); }
  take(id: Flavor, slice: number, cakeId = this.cakes[id].id) { return !this.complete && this.inventory.take(id, slice, cakeId); }
  takeWhole(id: Flavor, cakeId = this.cakes[id].id) { return !this.complete && this.inventory.takeWhole(id, cakeId); }
  selectCake(id: Flavor, cakeId: number) {
    if (this.complete || !this.inventory.select(id, cakeId)) return false;
    this.active = id;
    return true;
  }
  returnPiece(id: Flavor, ids: number[], cakeId: number) {
    if (this.complete || !this.inventory.returnPiece(id, ids, cakeId)) return false;
    this.active = id;
    return true;
  }
  portions(id: Flavor) { return this.inventory.portions(id); }
  canSimplify(id: Flavor) { return this.inventory.canSimplify(id); }
  simplify(id: Flavor, cakeId: number, divisor: number) {
    if (this.complete || !this.inventory.simplify(id, cakeId, divisor)) return false;
    this.stars++;
    return true;
  }
  restoreCurrent() { if (!this.complete) this.inventory.restore(this.cakes[this.active]); }
  clear() { if (!this.complete) this.inventory.clear(); }
  mismatch(): Mismatch | null {
    for (const { id } of flavors) {
      const request = this.order.items.find((item) => item.flavor === id), amount = this.amount(id);
      if (!request && amount.numerator) return { flavor: id, kind: 'unrequested', amount };
      if (!request || !compare(amount, request)) continue;
      return { flavor: id, kind: compare(amount, request) < 0 ? 'tooLittle' : 'tooMuch', amount, requested: request };
    }
    return null;
  }
  serve() {
    if (this.complete || this.mismatch()) return false;
    this.index++; this.inventory = new CakeInventory(this.inventory.serial);
    if (!this.complete) this.active = this.order.items[0].flavor;
    return true;
  }
  replay() {
    this.index = 0; this.stars = 0; this.inventory = new CakeInventory(this.inventory.serial);
    this.orders = this.options.orders ?? generateOrders(this.options.random);
    this.active = this.order.items[0].flavor;
  }
}
