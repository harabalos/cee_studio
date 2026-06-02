-- Per-topic curated hero image URL (AMOX-style, keyless). The cron downloads
-- + compresses + stores it. If null, the post gets no hero and the owner
-- adds one at review.
ALTER TABLE public.blog_topics ADD COLUMN IF NOT EXISTS image_url text;
COMMENT ON COLUMN public.blog_topics.image_url IS 'Optional curated stock image URL (e.g. Unsplash CDN) downloaded + stored at generation time. No API key needed.';
