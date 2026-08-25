import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';

console.log(`Total products: ${INITIAL_PRODUCTS.length}`);

// Group by image domain
const domainGroups: Record<string, number> = {};
for (const p of INITIAL_PRODUCTS) {
  try {
    const u = new URL(p.image);
    domainGroups[u.hostname] = (domainGroups[u.hostname] || 0) + 1;
  } catch {
    domainGroups['invalid'] = (domainGroups['invalid'] || 0) + 1;
  }
}

console.log("Domain breakdown:", domainGroups);

// Let's list all Liverpool images and Chapur images to check
const liverpoolProds = INITIAL_PRODUCTS.filter(p => p.image.includes('liverpool.com.mx'));
console.log(`\nLiverpool products count: ${liverpoolProds.length}`);
console.log("Sample Liverpool products:", liverpoolProds.slice(0, 15).map(p => `${p.brand} - ${p.name}: ${p.image}`));
