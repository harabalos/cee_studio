import { getSupabaseAdmin } from "@/lib/supabase/server";
import TopicsManager, { type Topic } from "./TopicsManager";

export const dynamic = "force-dynamic";

export default async function BlogTopicsPage() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("blog_topics")
    .select("id, keyword, brief, image_url, status, sort")
    .order("sort", { ascending: true });
  return <TopicsManager initial={(data ?? []) as Topic[]} />;
}
