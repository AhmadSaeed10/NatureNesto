import { notFound } from "next/navigation";
import { DocEditor } from "@/components/admin/content/DocEditor";
import { isDocKind } from "@/lib/admin/content-kinds";
import { listMediaOptions } from "@/lib/admin/media";

export default async function NewDocPage({ params }: PageProps<"/admin/content/[kind]/new">) {
  const { kind } = await params;
  if (!isDocKind(kind)) notFound();
  const media = await listMediaOptions();
  return <DocEditor kind={kind} doc={null} media={media} />;
}
