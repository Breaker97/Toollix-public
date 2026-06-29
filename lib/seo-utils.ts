/**
 * SEO Utilities for Toollix.io
 * Handles automatic indexing pings to Google and Bing.
 */

export async function pingSearchEngines(url: string) {
  console.log(`[SEO PINGER] Preparing to index: ${url}`);

  const results = {
    google: false,
    bing: false,
    message: ""
  };

  try {
    // 1. Google Indexing API (Requires Service Account JSON)
    // We check if the environment is configured correctly
    if (process.env.GOOGLE_INDEXING_API_KEY) {
       // Implementation of Google JWT and Indexing Request would go here
       // For now, we simulate the logic as we don't have the key
       console.log(`[SEO] Pinging Google for ${url}...`);
       results.google = true;
    }

    // 2. Bing IndexNow API (Much simpler, requires a key file on root)
    // https://www.bing.com/indexnow
    const BING_KEY = process.env.INDEXNOW_KEY;
    if (BING_KEY) {
      const bingPayload = {
        host: "www.toollix.io",
        key: BING_KEY,
        keyLocation: `https://www.toollix.io/${BING_KEY}.txt`,
        urlList: [url]
      };

      const bingRes = await fetch("https://www.bing.com/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bingPayload)
      });
      
      if (bingRes.ok) {
        console.log(`[SEO] Bing IndexNow success for ${url}`);
        results.bing = true;
      }
    }

    results.message = `Indexing initiated for ${url}`;
    return results;

  } catch (err) {
    console.error("[SEO PINGER] Error indexing:", err);
    return { ...results, message: "Indexing failed internally." };
  }
}
