async function testWikidata(query: string) {
  try {
    const res = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json`);
    if (res.ok) {
      const data = await res.json();
      console.log(`Wikidata for ${query}:`, data.search?.slice(0, 2));
    }
  } catch (e: any) {
    console.log(`Wikidata err: ${e.message}`);
  }
}

async function run() {
  await testWikidata("Le Labo Rose 31");
  await testWikidata("Louis Vuitton California Dream");
  await testWikidata("Montblanc Emblem");
}

run();
