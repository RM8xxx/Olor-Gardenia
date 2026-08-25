import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';

// Let's test how many items match strictly on VTEX
async function checkVtexStrict(brand: string, name: string): Promise<string | null> {
  const query = `${brand} ${name}`;
  try {
    const res = await fetch(`https://chapurmx.vtexcommercestable.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Filter strictly
        const nameTokens = name.toLowerCase().split(/[\s\-]+/);
        const brandTokens = brand.toLowerCase().split(/[\s\-]+/);
        
        for (const item of data) {
          const prodTitle = (item.productName || '').toLowerCase();
          const prodBrand = (item.brand || '').toLowerCase();
          
          // Check if brand matches
          const brandMatches = brandTokens.some(t => prodTitle.includes(t) || prodBrand.includes(t));
          // Check if at least the main name token matches
          const nameMatches = nameTokens.filter(t => t.length > 2).some(t => prodTitle.includes(t));
          
          if (brandMatches && nameMatches) {
            const img = item.items?.[0]?.images?.[0]?.imageUrl;
            if (img) return img;
          }
        }
      }
    }
  } catch {}

  // Surtidora
  try {
    const res = await fetch(`https://surtidoradepartamental.vtexcommercestable.com.br/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const nameTokens = name.toLowerCase().split(/[\s\-]+/);
        const brandTokens = brand.toLowerCase().split(/[\s\-]+/);
        for (const item of data) {
          const prodTitle = (item.productName || '').toLowerCase();
          const prodBrand = (item.brand || '').toLowerCase();
          const brandMatches = brandTokens.some(t => prodTitle.includes(t) || prodBrand.includes(t));
          const nameMatches = nameTokens.filter(t => t.length > 2).some(t => prodTitle.includes(t));
          if (brandMatches && nameMatches) {
            const img = item.items?.[0]?.images?.[0]?.imageUrl;
            if (img) return img;
          }
        }
      }
    }
  } catch {}

  return null;
}

async function run() {
  const prods = INITIAL_PRODUCTS.slice(0, 30);
  for (const p of prods) {
    const strictImg = await checkVtexStrict(p.brand, p.name);
    console.log(`${p.brand} - ${p.name}: ${strictImg ? 'MATCHED' : 'NO STRICT MATCH'}`);
  }
}

run();
