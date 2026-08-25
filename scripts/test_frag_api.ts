async function testFragranticaApi() {
  // Test fragrantica autocomplete/search endpoints
  const testEndpoints = [
    "https://www.fragrantica.com/search-perfume?name=rose%2031",
    "https://www.fragrantica.com/search/?query=rose+31",
    "https://www.fragrantica.com/api/perfumes/search?q=rose+31",
    "https://www.fragrantica.es/search/?query=rose+31",
    "https://api.fragrantica.com/v1/perfumes/search?query=rose+31"
  ];

  for (const ep of testEndpoints) {
    try {
      const res = await fetch(ep, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      console.log(`${ep} -> ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Content length: ${text.length}, preview: ${text.substring(0, 150)}`);
      }
    } catch (e: any) {
      console.log(`${ep} -> ERROR: ${e.message}`);
    }
  }
}

testFragranticaApi();
