async function testSources() {
  const q = "Le Labo Rose 31";
  
  // Test Parfumo
  try {
    const res = await fetch(`https://www.parfumo.com/ajax/search/all?current_search=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log(`Parfumo: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log('Parfumo data:', JSON.stringify(data).substring(0, 300));
    }
  } catch (e: any) {
    console.log(`Parfumo err: ${e.message}`);
  }

  // Test ScentSplit
  try {
    const res = await fetch(`https://scentsplit.com/search?q=${encodeURIComponent(q)}&view=json`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log(`ScentSplit: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log('ScentSplit data:', JSON.stringify(data).substring(0, 300));
    }
  } catch (e: any) {
    console.log(`ScentSplit err: ${e.message}`);
  }

  // Test FragranceNet
  try {
    const res = await fetch(`https://www.fragrancenet.com/search?fms=1&q=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log(`FragranceNet: ${res.status}`);
  } catch (e: any) {
    console.log(`FragranceNet err: ${e.message}`);
  }

  // Test Jomashop
  try {
    const res = await fetch(`https://www.jomashop.com/api/search?query=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    console.log(`Jomashop: ${res.status}`);
  } catch (e: any) {
    console.log(`Jomashop err: ${e.message}`);
  }
}

testSources();
