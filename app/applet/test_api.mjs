async function checkFrontend() {
  try {
    const res = await fetch("https://perfumapi-frontend.onrender.com/", { signal: AbortSignal.timeout(10000) });
    console.log("Status:", res.status);
    const html = await res.text();
    console.log("HTML length:", html.length);
    console.log("HTML snippet:", html.slice(0, 500));
    const scriptMatches = [...html.matchAll(/src=["']([^"']+\.js)["']/g)];
    console.log("Scripts:", scriptMatches.map(m => m[1]));
    for (const m of scriptMatches) {
      const scriptUrl = new URL(m[1], "https://perfumapi-frontend.onrender.com/").href;
      console.log("Fetching script:", scriptUrl);
      const sRes = await fetch(scriptUrl);
      const sText = await sRes.text();
      const apiMatches = sText.match(/https?:\/\/[a-zA-Z0-9_-]+\.onrender\.com[^\s"'`]*/g) || [];
      console.log("API URLs found in", m[1], ":", Array.from(new Set(apiMatches)));
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}
checkFrontend();
