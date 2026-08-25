async function testJoma() {
  const res = await fetch(`https://www.jomashop.com/api/search?query=Rose%2031`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const text = await res.text();
  console.log('Joma text preview:', text.substring(0, 500));
}
testJoma();
