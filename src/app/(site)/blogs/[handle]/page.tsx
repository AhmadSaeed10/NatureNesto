import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CmsArticle } from "@/components/cms/CmsArticle";
import { Button } from "@/components/ui/Button";
import { cms } from "@/content/cms";
import { getPost, listPosts } from "@/lib/cms/content";
import { richTextPlain } from "@/lib/cms/rich-text";
import { pageMetadata } from "@/lib/seo";

const DATE = new Intl.DateTimeFormat("en-PK", { dateStyle: "long", timeZone: "Asia/Karachi" });

// Cache Components needs at least one param to validate the route at build time; the
// placeholder renders a 404. Posts published later render on first request.
const PLACEHOLDER = "no-posts-yet";
export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.length ? posts.map((post) => ({ handle: post.handle })) : [{ handle: PLACEHOLDER }];
}

export async function generateMetadata({
  params,
}: PageProps<"/blogs/[handle]">): Promise<Metadata> {
  const { handle } = await params;
  const post = await getPost(handle);
  if (!post) return {};
  return pageMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || richTextPlain(post.body),
    path: `/blogs/${post.handle}`,
  });
}

export default async function PostPage({ params }: PageProps<"/blogs/[handle]">) {
  const { handle } = await params;
  const post = await getPost(handle);
  if (!post) notFound();
  return (
    <CmsArticle
      eyebrow={cms.blog.eyebrow}
      title={post.title}
      body={post.body}
      meta={
        <>
          {post.publishedAt ? (
            <time dateTime={post.publishedAt} className="text-ink-muted">
              {DATE.format(new Date(post.publishedAt))}
            </time>
          ) : null}
          {post.cover ? (
            <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-surface">
              <Image
                src={post.cover.src}
                alt={post.cover.alt}
                fill
                priority
                sizes="(min-width: 1280px) 900px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </>
      }
    >
      <div>
        <Button href="/blogs" variant="secondary">
          {cms.blog.back}
        </Button>
      </div>
    </CmsArticle>
  );
}
