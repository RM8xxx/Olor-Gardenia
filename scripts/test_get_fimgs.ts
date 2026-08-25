async function testGet(url: string): Promise<number> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(t);
    return res.status;
  } catch (e: any) {
    return 0;
  }
}

async function run() {
  const urls = [
    "https://fimgs.net/mdimg/perfume/375x500.3639.jpg", // Le Labo Rose 31
    "https://fimgs.net/mdimg/perfume/375x500.60333.jpg", // LV California Dream
    "https://fimgs.net/mdimg/perfume/375x500.23725.jpg", // Montblanc Emblem
    "https://fimgs.net/mdimg/perfume/375x500.14876.jpg", // Selena Gomez Selena Gomez
    "https://fimgs.net/mdimg/perfume/375x500.207.jpg", // Stella McCartney Stella
    "https://fimgs.net/mdimg/perfume/375x500.73030.jpg", // SHL God of Fire
    "https://fimgs.net/mdimg/perfume/375x500.89201.jpg", // Valentino Donna Green Stravaganza
    "https://fimgs.net/mdimg/perfume/375x500.3204.jpg" // Victorinox Swiss Army
  ];

  for (const u of urls) {
    const status = await testGet(u);
    console.log(`${status} -> ${u}`);
  }
}

run();
