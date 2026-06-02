/**
 * Hero image — keyless (AMOX-style).
 *
 * Downloads a curated stock image URL (e.g. an Unsplash CDN link set on the
 * topic), compresses it with sharp, uploads to Supabase Storage (blog-images),
 * and returns the public URL. No API key required.
 *
 * Graceful: if no URL is given or anything fails, returns null and the post is
 * created without a hero — Konstantina adds one at review.
 */

import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function fetchAndStoreImage(
  imageUrl: string | null | undefined,
  slug: string
): Promise<string | null> {
  if (!imageUrl) return null;

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.error("[blog/stock] download failed", res.status, imageUrl);
      return null;
    }
    const srcBuf = Buffer.from(await res.arrayBuffer());

    const out = await sharp(srcBuf)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toBuffer();

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
    return pub.publicUrl;
  } catch (e) {
    console.error("[blog/stock] unexpected error", e);
    return null;
  }
}
