import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';

async function searchFragranticaImg(perfumeName: string): Promise<string | null> {
  try {
    const url = `https://www.fragrantica.com/search/?q=${encodeURIComponent(perfumeName)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      // Look for fimgs.net/mdimg/perfume/375x500.XXXX.jpg or similar
      const matches = [...html.matchAll(/https:\/\/fimgs\.net\/mdimg\/perfume\/[^\s"'<>]+\.jpg/g)].map(m => m[0]);
      if (matches.length > 0) return matches[0];
      const match2 = [...html.matchAll(/https:\/\/fimgs\.net\/images\/perfume\/[^\s"'<>]+\.jpg/g)].map(m => m[0]);
      if (match2.length > 0) return match2[0];
    }
  } catch (e) {
    // console.error(e);
  }
  return null;
}

async function searchDuckDuckGoImage(query: string): Promise<string | null> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' bottle perfume "fimgs.net/mdimg/perfume"')}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/https?:\/\/(?:www\.)?fimgs\.net\/mdimg\/perfume\/(?:375x500|m)\.\d+\.jpg/);
      if (match) return match[0];
    }
  } catch {}
  return null;
}

async function test() {
  const targets = [
    "Le Labo Rose 31",
    "Louis Vuitton California Dream",
    "Montblanc Emblem",
    "Selena Gomez Selena Gomez",
    "Stella McCartney Stella",
    "Stephane Humbert Lucas God Of Fire",
    "Valentino Donna Born in Roma Green Stravaganza",
    "Victorinox Swiss Army"
  ];

  for (const t of targets) {
    const img1 = await searchDuckDuckGoImage(t);
    console.log(`${t} -> ${img1}`);
  }
}

test();
