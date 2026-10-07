import { flavors, guestCount, plateCapacity, type Order, type Request } from './catalog.ts';

type Random = () => number;
const guests = ['Mia', 'Leo', 'Ivy', 'Sam', 'Noor', 'Alex'];
function weighted<T>(choices: [T, number][], random: Random): T {
  let value = random() * choices.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [choice, weight] of choices) { value -= weight; if (value < 0) return choice; }
  return choices.at(-1)![0];
}
function shuffled<T>(items: readonly T[], random: Random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(random() * (i + 1)));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function quantity(flavor: Request['flavor'], budget: number, random: Random): Request {
  const denominator = weighted<number>([[2, 2], [3, 3], [4, 5], [5, 4], [6, 6], [7, 3], [8, 7], [9, 3], [10, 5], [11, 2], [12, 8]], random);
  const numerator = random() < 0.65 ? 1 : 1 + Math.min(denominator - 2, Math.floor(random() * (denominator - 1)));
  const choices: [number, number][] = [[0, 16], [1, 5], [2, 2], [3, 1]];
  const whole = weighted(choices.filter(([n]) => n < budget), random);
  return { flavor, numerator: whole * denominator + numerator, denominator };
}
export function generateOrders(random: Random = Math.random): Order[] {
  return shuffled(guests, random).slice(0, guestCount).map((guest) => {
    const count = weighted<number>([[1, 6], [2, 3], [3, 1]], random);
    const selected = shuffled(flavors, random).slice(0, count);
    let remaining = plateCapacity;
    const items = selected.map(({ id }, index) => {
      const item = quantity(id, remaining - (selected.length - index - 1), random);
      remaining -= Math.ceil(item.numerator / item.denominator);
      return item;
    });
    return { guest, items };
  });
}
