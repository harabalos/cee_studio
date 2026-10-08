/**
 * Admin blog image upload — two steps so originals of ANY size work
 * (Vercel rejects request bodies over ~4.5 MB, so the file never passes
 * through this route on the way in).
 *
 *  1. POST { action: "sign" }                    → { path, token }
 *     The browser then uploads the untouched original straight to Supabase
 *     Storage (`blog-images/tmp/...`) with that one-time token.
 *  2. POST { action: "process", path, slug }     → { url }
 *     We download the original, auto-rotate from EXIF, resize to max 2560px
 *     wide (2.5x the widest display size, so retina stays sharp), encode as
 *     high-quality WebP, store it in `blog-images`, and delete the original.
 */

import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { getAdminUser } from "@/lib/auth/admin";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/blog/db";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "blog-images";
const TMP_PREFIX = "tmp/";

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { action?: string; path?: string; slug?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  if (body.action === "sign") {
    const path = `${TMP_PREFIX}${randomUUID()}`;
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[admin/blog/upload] sign failed", error?.message);
      return NextResponse.json({ error: "sign_failed", detail: error?.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, path: data.path, token: data.token });
  }

  if (body.action === "process") {
    const tmpPath = body.path ?? "";
    // Only ever touch files this flow created.
    if (!tmpPath.startsWith(TMP_PREFIX) || tmpPath.includes("..")) {
      return NextResponse.json({ error: "bad_path" }, { status: 400 });
    }

    try {
      const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(tmpPath);
      if (dlErr || !blob) {
        return NextResponse.json({ error: "download_failed", detail: dlErr?.message }, { status: 500 });
      }

      let out: Buffer;
      try {
        out = await sharp(Buffer.from(await blob.arrayBuffer()))
          .rotate()
          .resize({ width: 2560, withoutEnlargement: true })
          .webp({ quality: 92, smartSubsample: false })
          .toBuffer();
      } catch {
        await supabase.storage.from(BUCKET).remove([tmpPath]);
        return NextResponse.json(
          { error: "unsupported_image", detail: "Could not read this image. Use JPG, PNG or WebP." },
          { status: 415 }
        );
      }

      const path = `${slugify(body.slug ?? "") || "post"}-${Date.now()}.webp`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, out, { contentType: "image/webp", upsert: false });
      if (upErr) {
        console.error("[admin/blog/upload] storage failed", upErr.message);
        return NextResponse.json({ error: "storage_failed", detail: upErr.message }, { status: 500 });
      }

      await supabase.storage.from(BUCKET).remove([tmpPath]); // best-effort cleanup

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return NextResponse.json({ ok: true, url: pub.publicUrl, bytes: out.length });
    } catch (e) {
      console.error("[admin/blog/upload] processing failed", e);
      return NextResponse.json({ error: "process_failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
