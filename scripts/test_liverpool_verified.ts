async function testLiverpoolVerified(brand: string, name: string) {
  const query = `${brand} ${name}`;
  try {
    const res = await fetch(`https://www.liverpool.com.mx/tienda?s=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      // Check if page says no results or 0 resultados
      if (html.includes('No encontramos resultados') || html.includes('0 resultados')) {
        console.log(`Liverpool: 0 results for "${query}"`);
        return null;
      }
      // Check for product card titles in html
      // Look for data-prod-title or <h5 class="card-title ...">
      const titleMatches = [...html.matchAll(/<h3[^>]*class="[^"]*card-title[^"]*"[^>]*>([^<]+)<\/h3>/gi)].map(m => m[1].trim());
      console.log(`Liverpool search "${query}" found titles:`, titleMatches.slice(0, 3));
    }
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
}

async function test() {
  await testLiverpoolVerified("Le Labo", "Rose 31");
  await testLiverpoolVerified("Louis Vuitton", "California Dream");
  await testLiverpoolVerified("Montblanc", "Emblem");
  await testLiverpoolVerified("Selena Gomez", "Selena Gomez");
  await testLiverpoolVerified("Stella McCartney", "Stella");
  await testLiverpoolVerified("Stéphane Humbert Lucas", "God Of Fire");
  await testLiverpoolVerified("Valentino", "Donna Born in Roma Green Stravaganza");
  await testLiverpoolVerified("Victorinox", "Swiss Army");
}

test();
