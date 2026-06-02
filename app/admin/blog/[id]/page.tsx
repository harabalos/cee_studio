import { notFound } from "next/navigation";
import { getPostByIdAdmin } from "@/lib/blog/db";
import BlogEditor from "./BlogEditor";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({ params }: { params: { id: string } }) {
  const post = await getPostByIdAdmin(params.id);
  if (!post) notFound();
  return <BlogEditor post={post} />;
}
