export const flavors = [
  { id: 'chocolate', name: 'Chocolate', color: '#845047', sponge: '#774434', cream: '#f0c3a0', frosting: '#4c2926', accent: '#f9e5ce', preview: 'PW_cheesecake_chocolatte.png' },
  { id: 'lemon', name: 'Lemon', color: '#d2a828', sponge: '#e7b54e', cream: '#fff2c6', frosting: '#ffe178', accent: '#5e9170', preview: 'PW_cheesecake_lime.png' },
  { id: 'cheesecake', name: 'Cheesecake', color: '#c75c7a', sponge: '#c4986b', cream: '#fff1da', frosting: '#f2a4b8', accent: '#b9355b', preview: 'PW_cheesecake_strawberry.png' },
] as const;
export type Flavor = typeof flavors[number]['id'];
export type Fraction = { numerator: number; denominator: number };
export type Request = Fraction & { flavor: Flavor };
export type Order = { guest: string; items: Request[] };
export const plateCapacity = 7;
export const guestCount = 6;
export const flavorInfo = (id: Flavor) => flavors.find((flavor) => flavor.id === id)!;
