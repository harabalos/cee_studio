/**
 * Admin blog image upload.
 * POST /api/admin/blog/upload   multipart/form-data { file, slug? }
 *
 * Whatever the admin picks (phone/camera originals included) is auto-rotated
 * from EXIF, resized to max 2560px wide (2.5x the widest display size, so retina stays sharp), re-encoded as high-quality WebP and stored in the
 * public `blog-images` bucket. Returns { url }.
 *
 * The browser already downsizes before sending (Vercel rejects request bodies
 * over ~4.5 MB); this is the safety net + the final, consistent encode.
 */

import { NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/blog/db";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "too_large", detail: "Image too large even after compression." }, { status: 413 });
  }

  try {
    const src = Buffer.from(await file.arrayBuffer());
    const out = await sharp(src)
      .rotate()
      .resize({ width: 2560, withoutEnlargement: true })
      .webp({ quality: 92, smartSubsample: false })
      .toBuffer();

    const rawSlug = String(form.get("slug") ?? "");
    const base = slugify(rawSlug) || "post";
    const path = `${base}-${Date.now()}.webp`;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, out, { contentType: "image/webp", upsert: false });
    if (error) {
      console.error("[admin/blog/upload] storage failed", error.message);
      return NextResponse.json({ error: "storage_failed", detail: error.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: pub.publicUrl, bytes: out.length });
  } catch (e) {
    console.error("[admin/blog/upload] processing failed", e);
    return NextResponse.json(
      { error: "unsupported_image", detail: "Could not read this image. Use JPG, PNG or WebP." },
      { status: 415 }
    );
  }
}
