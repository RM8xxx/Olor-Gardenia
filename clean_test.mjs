import { INITIAL_PRODUCTS } from './src/data/initialProducts.ts';
import fs from 'fs';

// Helper normalization
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function runCleaner() {
  console.log("=== INITIATING DATA CLEANING SCRIPT ===");
  console.log(`Total local perfumes to analyze: ${INITIAL_PRODUCTS.length}`);

  // 1. Fetch all pre-cached perfumes from PerfumAPI Supabase DB
  let apiPerfumes = [];
  try {
    const res = await fetch("https://perfumapidatabase.onrender.com/perfumes?limit=500");
    if (res.ok) {
      const data = await res.json();
      apiPerfumes = data.perfumes || [];
      console.log(`Successfully retrieved ${apiPerfumes.length} perfumes from PerfumAPI DB.`);
    }
  } catch (e) {
    console.error("Error connecting to PerfumAPI:", e.message);
  }

  // Check matching
  let matchedFromCache = 0;
  const needSearch = [];

  for (const local of INITIAL_PRODUCTS) {
    const normLocalName = normalize(local.name);
    const normLocalBrand = normalize(local.brand);

    // Try finding exact or best match in API perfumes
    const match = apiPerfumes.find(p => {
      const normApiName = normalize(p.name);
      const normApiBrand = normalize(p.brand);
      
      const brandMatches = normApiBrand.includes(normLocalBrand) || normLocalBrand.includes(normApiBrand);
      const nameMatches = normApiName.includes(normLocalName) || normLocalName.includes(normApiName);
      
      return brandMatches && nameMatches;
    });

    if (match && match.image_url) {
      matchedFromCache++;
      // console.log(`[CACHE MATCH] ${local.brand} - ${local.name} -> ${match.name} (${match.image_url})`);
    } else {
      needSearch.push(local);
    }
  }

  console.log(`Matches found in PerfumAPI primary database: ${matchedFromCache}`);
  console.log(`Perfumes to query via PerfumAPI search endpoint: ${needSearch.length}`);
}

runCleaner();
