import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';

const targets = [
  "Rose 31",
  "California Dream",
  "Emblem",
  "Selena Gomez",
  "Stella",
  "God Of Fire",
  "Donna Born in Roma Green Stravaganza",
  "Swiss Army"
];

const found = INITIAL_PRODUCTS.filter(p => targets.some(t => p.name.toLowerCase().includes(t.toLowerCase()) || p.brand.toLowerCase().includes(t.toLowerCase())));

console.log("Found targeted products:", found.map(p => ({
  id: p.id,
  brand: p.brand,
  name: p.name,
  image: p.image
})));
