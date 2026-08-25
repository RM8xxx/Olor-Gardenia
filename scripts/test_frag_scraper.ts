import { INITIAL_PRODUCTS } from '../src/data/initialProducts.ts';
import fs from 'fs';
import path from 'path';

async function fetchFragranticaImage(brand: string, name: string): Promise<string | null> {
  const query = `${brand} ${name}`.replace(/[^\w\s]/gi, ' ').trim();
  const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(query)}`;
  
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    });
    clearTimeout(t);
    if (res.ok) {
      const html = await res.text();
      // Match fimgs perfume images
      const matches = [...html.matchAll(/https:\/\/fimgs\.net\/mdimg\/perfume\/(?:375x500|m)\.(\d+)\.jpg/g)].map(m => m[1]);
      if (matches.length > 0) {
        // Return high-res 375x500 version
        return `https://fimgs.net/mdimg/perfume/375x500.${matches[0]}.jpg`;
      }
    }
  } catch {}

  // Fallback: try searching with just perfume name if brand search gave nothing
  try {
    const searchUrl2 = `https://www.fragrantica.com/search/?query=${encodeURIComponent(name)}`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(searchUrl2, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    });
    clearTimeout(t);
    if (res.ok) {
      const html = await res.text();
      const matches = [...html.matchAll(/https:\/\/fimgs\.net\/mdimg\/perfume\/(?:375x500|m)\.(\d+)\.jpg/g)].map(m => m[1]);
      if (matches.length > 0) {
        return `https://fimgs.net/mdimg/perfume/375x500.${matches[0]}.jpg`;
      }
    }
  } catch {}

  return null;
}

async function testSingle() {
  const testItems = [
    { brand: "Le Labo", name: "Rose 31" },
    { brand: "Louis Vuitton", name: "California Dream" },
    { brand: "Montblanc", name: "Emblem" },
    { brand: "Selena Gomez", name: "Selena Gomez" },
    { brand: "Stella McCartney", name: "Stella" },
    { brand: "Stéphane Humbert Lucas", name: "God Of Fire" },
    { brand: "Valentino", name: "Donna Born in Roma Green Stravaganza" },
    { brand: "Victorinox", name: "Swiss Army" }
  ];

  for (const item of testItems) {
    const img = await fetchFragranticaImage(item.brand, item.name);
    console.log(`${item.brand} - ${item.name}: ${img}`);
  }
}

testSingle();
