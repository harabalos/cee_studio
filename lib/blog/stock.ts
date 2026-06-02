/**
 * Stock hero image: search Pexels by the AI's imageQuery, compress with sharp,
 * upload to Supabase Storage (blog-images), return the public URL.
 *
 * Graceful: if PEXELS_API_KEY is missing/dummy or anything fails, returns null
 * and the post is created without a hero — Konstantina adds one at review.
 */

import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface StockResult {
  url: string;       // public Storage URL
  credit: string;    // photographer name
}

function hasKey(): boolean {
  const k = process.env.PEXELS_API_KEY;
  return !!k && !k.toUpperCase().includes("DUMMY") && k.length > 8;
}

export async function fetchStockHero(query: string, slug: string): Promise<StockResult | null> {
  if (!hasKey()) {
    console.warn("[blog/stock] PEXELS_API_KEY not set — skipping hero image");
    return null;
  }

  try {
    // 1. Search Pexels (landscape, first good result)
    const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5`;
    const sres = await fetch(searchUrl, {
      headers: { Authorization: process.env.PEXELS_API_KEY as string },
    });
    if (!sres.ok) {
      console.error("[blog/stock] pexels search failed", sres.status);
      return null;
    }
    const data = (await sres.json()) as {
      photos?: { src: { large2x: string; large: string }; photographer: string }[];
    };
    const photo = data.photos?.[0];
    if (!photo) return null;

    // 2. Download the source image
    const imgRes = await fetch(photo.src.large2x || photo.src.large);
    if (!imgRes.ok) return null;
    const srcBuf = Buffer.from(await imgRes.arrayBuffer());

    // 3. Compress + resize with sharp (1600px wide, q78 jpeg)
    const out = await sharp(srcBuf)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

    // 4. Upload to Supabase Storage (public bucket)
    const supabase = getSupabaseAdmin();
    const path = `${slug}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, out, { contentType: "image/jpeg", upsert: true });
    if (error) {
      console.error("[blog/stock] storage upload failed", error.message);
      return null;
    }

    const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
    return { url: pub.publicUrl, credit: photo.photographer };
  } catch (e) {
    console.error("[blog/stock] unexpected error", e);
    return null;
  }
}
