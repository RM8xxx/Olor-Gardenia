async function findFragranticaId(brand: string, name: string): Promise<string | null> {
  const q = `site:fragrantica.com/perfume/ "${brand}" "${name}"`;
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      // Match fragrantica perfume URL: /perfume/Brand/Name-ID.html
      const matches = [...html.matchAll(/fragrantica\.com\/perfume\/[^\/]+\/[^\-]+-(\d+)\.html/g)].map(m => m[1]);
      if (matches.length > 0) {
        return `https://fimgs.net/mdimg/perfume/375x500.${matches[0]}.jpg`;
      }
    }
  } catch {}
  return null;
}

async function run() {
  const items = [
    { brand: "Le Labo", name: "Rose 31" },
    { brand: "Louis Vuitton", name: "California Dream" },
    { brand: "Montblanc", name: "Emblem" },
    { brand: "Selena Gomez", name: "Selena Gomez" },
    { brand: "Stella McCartney", name: "Stella" },
    { brand: "Stéphane Humbert Lucas", name: "God Of Fire" },
    { brand: "Valentino", name: "Donna Born in Roma Green Stravaganza" },
    { brand: "Victorinox", name: "Swiss Army" }
  ];

  for (const item of items) {
    const img = await findFragranticaId(item.brand, item.name);
    console.log(`${item.brand} - ${item.name} -> ${img}`);
  }
}

run();
