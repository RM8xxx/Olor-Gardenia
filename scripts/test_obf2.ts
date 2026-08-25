async function testOBF(brand: string, name: string) {
  const query = `${brand} ${name}`;
  try {
    const res = await fetch(`https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const prod = data.products.find((p: any) => p.image_front_url || p.image_url);
        if (prod) {
          console.log(`OBF [${brand} - ${name}]: ${prod.product_name} -> ${prod.image_front_url || prod.image_url}`);
          return;
        }
      }
    }
    console.log(`OBF [${brand} - ${name}]: No result`);
  } catch (e: any) {
    console.log(`OBF err: ${e.message}`);
  }
}

async function run() {
  await testOBF("Le Labo", "Rose 31");
  await testOBF("Montblanc", "Emblem");
  await testOBF("Selena Gomez", "Selena Gomez");
  await testOBF("Stella McCartney", "Stella");
  await testOBF("Victorinox", "Swiss Army");
}

run();
