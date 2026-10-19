import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CmsArticle } from "@/components/cms/CmsArticle";
import { HomeSections } from "@/components/cms/HomeSections";
import { admin } from "@/content/admin";
import {
  getPageForEditor,
  getPostForEditor,
  getWorkshopForEditor,
  previewHomeRows,
} from "@/lib/admin/content";
import { isDocKind } from "@/lib/admin/content-kinds";
import { getStaff } from "@/lib/auth/staff";
import { buildHomeSections } from "@/lib/cms/data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function PreviewContent({ searchParams }: PageProps<"/preview">) {
  // Staff only: anyone else gets a plain 404, so the page reveals nothing.
  if (!(await getStaff())) notFound();
  const params = await searchParams;
  const kind = typeof params.kind === "string" ? params.kind : "";
  const id = typeof params.id === "string" && /^[0-9a-f-]{36}$/.test(params.id) ? params.id : "";

  let content: React.ReactNode;
  if (!kind) {
    content = <HomeSections sections={buildHomeSections(await previewHomeRows())} />;
  } else if (isDocKind(kind) && id) {
    const doc =
      kind === "pages"
        ? await getPageForEditor(id)
        : kind === "blog"
          ? await getPostForEditor(id)
          : await getWorkshopForEditor(id);
    if (!doc) notFound();
    content = <CmsArticle title={doc.title} body={doc.body} />;
  } else {
    notFound();
  }

  return (
    <>
      <p role="status" className="bg-ink px-4 py-3 text-center text-small text-background">
        {admin.content.previewBanner}
      </p>
      {content}
    </>
  );
}

export default function PreviewPage(props: PageProps<"/preview">) {
  return (
    <Suspense>
      <PreviewContent {...props} />
    </Suspense>
  );
}
