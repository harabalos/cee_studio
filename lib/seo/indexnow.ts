/**
 * IndexNow — instantly notify Bing / Yandex / Seznam (and any IndexNow-
 * compatible engine) that a URL changed. Legit for any page type (unlike
 * Google's Indexing API, which is restricted to jobs/events).
 *
 * The key is verified by hosting <key>.txt at the domain root (public/).
 * Google does NOT use IndexNow — it discovers new posts via the (now
 * hourly-revalidating) sitemap instead.
 */

const KEY = "5496df42de6cd72f845472c90dbf9a8f";
const HOST = "ceestudio.ch";

export async function pingIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch (e) {
    // Non-fatal — indexing notification is best-effort.
    console.error("[indexnow] ping failed", e);
  }
}
