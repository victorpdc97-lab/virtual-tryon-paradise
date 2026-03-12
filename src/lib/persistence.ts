import { put, list, del } from "@vercel/blob";

const MIN_FLUSH_INTERVAL = 3000; // 3 seconds between flushes per key
const lastFlushTime = new Map<string, number>();

function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function loadFromBlob<T>(key: string): Promise<T | null> {
  if (!isBlobConfigured()) return null;

  try {
    const { blobs } = await list({ prefix: `data/${key}` });
    if (blobs.length === 0) return null;

    const blob = blobs.sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )[0];

    const res = await fetch(blob.url);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function flushToBlob(key: string, getData: () => unknown): void {
  if (!isBlobConfigured()) return;

  const now = Date.now();
  const lastFlush = lastFlushTime.get(key) || 0;
  if (now - lastFlush < MIN_FLUSH_INTERVAL) return;
  lastFlushTime.set(key, now);

  // Fire-and-forget — don't block the request
  (async () => {
    try {
      const data = getData();

      // Delete old blobs with this prefix
      const { blobs } = await list({ prefix: `data/${key}` });
      if (blobs.length > 0) {
        await del(blobs.map((b) => b.url));
      }

      await put(`data/${key}.json`, JSON.stringify(data), {
        access: "public",
        contentType: "application/json",
      });
    } catch (err) {
      console.error(`Blob flush error (${key}):`, err);
    }
  })();
}
