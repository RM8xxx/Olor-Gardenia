import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';
import fs from 'fs';

const list = INITIAL_PRODUCTS.map((p, idx) => ({
  idx,
  id: p.id,
  brand: p.brand,
  name: p.name,
  category: p.category,
  currentImage: p.image
}));

fs.writeFileSync('scripts/products_list.json', JSON.stringify(list, null, 2), 'utf-8');
console.log(`Saved ${list.length} products to scripts/products_list.json`);
