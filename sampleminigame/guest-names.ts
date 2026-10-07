export const femaleNames = [
  'Alice', 'Maja', 'Elsa', 'Alma', 'Astrid', 'Vera', 'Ella',
  'Freja', 'Linnea', 'Agnes', 'Klara', 'Wilma', 'Ebba', 'Saga',
  'Olena', 'Emily', 'Rana', 'Amina', 'Leyla', 'Yasmin',
] as const;
export const maleNames = [
  'Noah', 'William', 'Liam', 'Hugo', 'Lucas', 'Nils', 'Oscar',
  'Elias', 'Ludvig', 'Axel', 'Arvid', 'Leo', 'Alfred', 'August',
  'Oleksandr', 'Jack', 'Omar', 'Ahmed', 'Emir', 'Amir',
] as const;
export const guestNames = [...femaleNames, ...maleNames];
