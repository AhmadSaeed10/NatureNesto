import { notFound } from "next/navigation";
import { DocEditor, type DocDraft } from "@/components/admin/content/DocEditor";
import { getPageForEditor, getPostForEditor, getWorkshopForEditor } from "@/lib/admin/content";
import { isDocKind } from "@/lib/admin/content-kinds";
import { listMediaOptions } from "@/lib/admin/media";

export default async function EditDocPage({
  params,
  searchParams,
}: PageProps<"/admin/content/[kind]/[id]">) {
  const { kind, id } = await params;
  const { saved } = await searchParams;
  if (!isDocKind(kind) || !/^[0-9a-f-]{36}$/.test(id)) notFound();

  const [doc, media] = await Promise.all([
    kind === "pages"
      ? getPageForEditor(id)
      : kind === "blog"
        ? getPostForEditor(id)
        : getWorkshopForEditor(id),
    listMediaOptions(),
  ]);
  if (!doc) notFound();
  return (
    <DocEditor
      key={`${id}-${doc.version}`}
      kind={kind}
      doc={doc satisfies DocDraft}
      media={media}
      justSaved={saved === "1"}
    />
  );
}
