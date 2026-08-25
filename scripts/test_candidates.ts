const candidates: Record<string, string[]> = {
  "Le Labo Rose 31": [
    "https://fimgs.net/mdimg/perfume/375x500.3639.jpg",
    "https://fimgs.net/mdimg/perfume/375x500.3644.jpg",
    "https://lelabo.ips.photos/assets/Rose-31-Eau-de-Parfum-50ml-100ml.png",
    "https://www.lelabofragrances.com/dw/image/v2/BBDG_PRD/on/demandware.static/-/Sites-le-labo-master/default/dw1e0bfef1/images/products/fragrance/edp/classic-collection/rose-31/100ml/le_labo_rose_31_edp_100ml_front.png",
    "https://m.media-amazon.com/images/I/51pI-t8bYNL._SL1000_.jpg",
    "https://m.media-amazon.com/images/I/61r59Q6oJQL._SL1000_.jpg"
  ],
  "Louis Vuitton California Dream": [
    "https://fimgs.net/mdimg/perfume/375x500.61214.jpg",
    "https://fimgs.net/mdimg/perfume/375x500.60333.jpg",
    "https://us.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-california-dream-perfumes--LP0175_PM2_Front%20view.png",
    "https://eu.louisvuitton.com/images/is/image/lv/1/PP_VP_L/louis-vuitton-california-dream-fragrances--LP0175_PM2_Front%20view.png",
    "https://m.media-amazon.com/images/I/61i0Jk9B5BL._SL1000_.jpg"
  ],
  "Montblanc Emblem": [
    "https://fimgs.net/mdimg/perfume/375x500.23725.jpg",
    "https://fimgs.net/mdimg/perfume/375x500.25339.jpg",
    "https://m.media-amazon.com/images/I/61E9gXb8fWL._SL1000_.jpg",
    "https://m.media-amazon.com/images/I/61xO5P0zZYL._SL1000_.jpg",
    "https://ss701.liverpool.com.mx/xl/1013108222.jpg"
  ],
  "Selena Gomez Selena Gomez": [
    "https://fimgs.net/mdimg/perfume/375x500.14876.jpg",
    "https://m.media-amazon.com/images/I/61I4rW9X-HL._SL1000_.jpg",
    "https://m.media-amazon.com/images/I/71oD4dI2gML._SL1500_.jpg",
    "https://img.fragrancex.com/images/products/parent/medium/69904w.jpg"
  ],
  "Stella McCartney Stella": [
    "https://fimgs.net/mdimg/perfume/375x500.25528.jpg",
    "https://fimgs.net/mdimg/perfume/375x500.207.jpg",
    "https://m.media-amazon.com/images/I/61u9-pGf8hL._SL1000_.jpg",
    "https://m.media-amazon.com/images/I/71Yy8gH-EoL._SL1500_.jpg",
    "https://img.fragrancex.com/images/products/parent/medium/61081w.jpg"
  ],
  "Stephane Humbert Lucas God Of Fire": [
    "https://fimgs.net/mdimg/perfume/375x500.73030.jpg",
    "https://maisonpeony.com/cdn/shop/products/god-of-fire_1024x1024.jpg",
    "https://m.media-amazon.com/images/I/61aWz0b-PBL._SL1000_.jpg",
    "https://m.media-amazon.com/images/I/71V2pG5m5lL._SL1500_.jpg"
  ],
  "Valentino Donna Born in Roma Green Stravaganza": [
    "https://fimgs.net/mdimg/perfume/375x500.89201.jpg",
    "https://fimgs.net/mdimg/perfume/375x500.89202.jpg",
    "https://www.valentino-beauty.us/dw/image/v2/AANG_PRD/on/demandware.static/-/Sites-valentino-master-catalog/default/dwfae98ca0/images/large/Donna-Born-In-Roma-Green-Stravaganza-Eau-De-Parfum-100ml-3614274092003-front.jpg",
    "https://m.media-amazon.com/images/I/61rU1J3aFSL._SL1000_.jpg",
    "https://ss701.liverpool.com.mx/xl/1151670921.jpg"
  ],
  "Victorinox Swiss Army": [
    "https://fimgs.net/mdimg/perfume/375x500.3204.jpg",
    "https://m.media-amazon.com/images/I/71j2T5zPz4L._SL1500_.jpg",
    "https://m.media-amazon.com/images/I/61NfK0p6PzL._SL1000_.jpg",
    "https://img.fragrancex.com/images/products/parent/medium/1458m.jpg"
  ]
};

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const type = res.headers.get('content-type') || '';
      return type.startsWith('image');
    }
  } catch {}
  return false;
}

async function run() {
  for (const [name, urls] of Object.entries(candidates)) {
    console.log(`\n=== Checking: ${name} ===`);
    for (const u of urls) {
      const ok = await checkUrl(u);
      console.log(`${ok ? '✅ OK ' : '❌ ERR'} -> ${u}`);
    }
  }
}

run();
