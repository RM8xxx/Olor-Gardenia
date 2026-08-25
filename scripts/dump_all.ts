import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';

for (let i = 0; i < INITIAL_PRODUCTS.length; i++) {
  const p = INITIAL_PRODUCTS[i];
  console.log(`[${i}] ${p.id} | ${p.brand} - ${p.name} (${p.category}) -> ${p.image}`);
}
