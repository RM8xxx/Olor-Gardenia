async function searchDdgImages(query: string): Promise<string | null> {
  try {
    // 1. Get vqd token
    const tokenRes = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iax=images&ia=images`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    if (!tokenRes.ok) return null;
    const tokenText = await tokenRes.text();
    const vqdMatch = tokenText.match(/vqd=["']([^"']+)["']/i) || tokenText.match(/vqd=([0-9\-]+)/i);
    if (!vqdMatch) return null;
    const vqd = vqdMatch[1];

    // 2. Fetch image JSON
    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,type:photo,&p=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://duckduckgo.com/'
      }
    });
    if (imgRes.ok) {
      const data = await imgRes.json();
      if (data.results && data.results.length > 0) {
        // Return first valid direct image URL
        const first = data.results.find((r: any) => r.image && !r.image.includes('placeholder'));
        if (first) return first.image;
      }
    }
  } catch (e: any) {
    console.error('DDG error:', e.message);
  }
  return null;
}

async function run() {
  const items = [
    "Le Labo Rose 31 perfume bottle",
    "Louis Vuitton California Dream perfume bottle",
    "Montblanc Emblem perfume bottle",
    "Selena Gomez Selena Gomez perfume bottle",
    "Stella McCartney Stella perfume bottle",
    "Stephane Humbert Lucas God Of Fire perfume bottle",
    "Valentino Donna Born in Roma Green Stravaganza perfume bottle",
    "Victorinox Swiss Army perfume bottle"
  ];

  for (const item of items) {
    const img = await searchDdgImages(item);
    console.log(`${item} => ${img}`);
  }
}

run();
