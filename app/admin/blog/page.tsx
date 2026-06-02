import Link from "next/link";
import { getAllPostsAdmin } from "@/lib/blog/db";
import { formatZurich } from "@/lib/booking/availability";
import NewPostButton from "./NewPostButton";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  pending_review: "bg-amber-100 text-amber-800",
  draft: "bg-accent/30 text-foreground/70",
  discarded: "bg-foreground/10 text-foreground/50",
};

export default async function AdminBlogPage() {
  const posts = await getAllPostsAdmin();
  const pending = posts.filter((p) => p.status === "pending_review");
  const published = posts.filter((p) => p.status === "published");
  const other = posts.filter((p) => p.status !== "pending_review" && p.status !== "published");

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-seasons text-3xl text-brand">Blog</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-foreground/50 hidden sm:block">
            {pending.length} pending · {published.length} published
          </p>
          <NewPostButton />
        </div>
      </div>

      <Section title={`Pending review (${pending.length})`} posts={pending} />
      <Section title={`Published (${published.length})`} posts={published} />
      {other.length > 0 && <Section title={`Drafts / discarded (${other.length})`} posts={other} muted />}
    </div>
  );
}

function Section({
  title,
  posts,
  muted = false,
}: {
  title: string;
  posts: Awaited<ReturnType<typeof getAllPostsAdmin>>;
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="font-seasons text-xl mb-4">{title}</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-foreground/50 italic border border-accent/30 p-4 bg-background">
          Nothing here.
        </p>
      ) : (
        <div className="border border-accent/40 bg-background divide-y divide-accent/20">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/admin/blog/${p.id}`}
              className={`flex items-center gap-4 p-4 hover:bg-brand/5 transition-colors ${muted ? "opacity-60" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.title?.de || "(untitled)"}</div>
                <div className="text-xs text-foreground/50 truncate">
                  /blog/{p.slug} · {p.category ?? "—"} · {p.source === "ai" ? "🤖 AI" : "✍️ manual"} ·{" "}
                  {formatZurich(p.published_at ?? p.created_at, "d MMM yyyy")}
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_STYLE[p.status] ?? ""}`}>
                {p.status.replace("_", " ")}
              </span>
              <span className="text-xs uppercase tracking-widest text-foreground/40">Edit →</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
