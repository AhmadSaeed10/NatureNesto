import { notFound } from "next/navigation";
import { SectionEditor } from "@/components/admin/content/SectionEditor";
import { getSectionForEditor } from "@/lib/admin/content";
import { getEditorOptions } from "@/lib/admin/products";

export default async function SectionEditPage({ params }: PageProps<"/admin/content/home/[type]">) {
  const { type } = await params;
  const [section, options] = await Promise.all([getSectionForEditor(type), getEditorOptions()]);
  if (!section) notFound();
  return (
    <SectionEditor
      key={`${section.type}-${section.hasDraft}-${section.visible}`}
      type={section.type}
      initial={section.value as Record<string, unknown>}
      hasDraft={section.hasDraft}
      visible={section.visible}
      media={options.media}
    />
  );
}
