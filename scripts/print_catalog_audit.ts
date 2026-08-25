import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';

// Group by brand
const byBrand: Record<string, typeof INITIAL_PRODUCTS> = {};
for (const p of INITIAL_PRODUCTS) {
  if (!byBrand[p.brand]) byBrand[p.brand] = [];
  byBrand[p.brand].push(p);
}

console.log(`Total brands: ${Object.keys(byBrand).length}`);
for (const [brand, prods] of Object.entries(byBrand)) {
  console.log(`\n=== Brand: ${brand} (${prods.length} products) ===`);
  for (const p of prods) {
    console.log(`  - [${p.id}] ${p.name} | ${p.category} | ${p.image}`);
  }
}
