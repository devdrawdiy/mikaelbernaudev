import { Bakery, flavors, type Flavor } from './domain';
export type Selection = { flavor: Flavor; cakeId: number; ids: number[]; tray: boolean; shelf: boolean; whole?: boolean };
export type Plan = Selection & { key: string; denominator: number; index: number; plate: number };

export function buildPlans(state: Bakery): Plan[] {
  return flavors.flatMap(({ id }) => {
    const cake = state.cakes[id], denominator = cake.division || 1;
    const source = Array.from({ length: denominator }, (_, index) => ({
      key: `${id}:${cake.id}:${index}:${denominator}`, flavor: id, cakeId: cake.id, ids: [index], denominator,
      index, plate: -1, tray: false, shelf: id !== state.active,
    })).filter(({ index }) => !cake.selected[index]);
    const tray = state.portions(id).map(({ cakeId, ids, denominator: parts, sourceDivision, plate, index }) => ({
      key: ids.length === 1 ? `${id}:${cakeId}:${ids[0]}:${sourceDivision}` : `${id}:${cakeId}:merged:${ids.join('-')}:${parts}`,
      flavor: id, cakeId, ids, denominator: parts, index, plate, tray: true, shelf: false,
    }));
    return [...source, ...tray];
  });
}
