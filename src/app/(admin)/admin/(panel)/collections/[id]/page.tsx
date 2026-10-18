import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/AdminPage";
import { CollectionEditor } from "@/components/admin/collections/CollectionEditor";
import { admin } from "@/content/admin";
import { getCollectionForEditor } from "@/lib/admin/collections";
import { listMediaOptions } from "@/lib/admin/media";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

export default async function EditCollectionPage({
  params,
  searchParams,
}: PageProps<"/admin/collections/[id]">) {
  await requireStaff(ACCESS.catalog);
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [collection, media] = await Promise.all([getCollectionForEditor(id), listMediaOptions()]);
  if (!collection) notFound();
  return (
    <AdminPage title={collection.title || admin.collections.editor.editTitle}>
      <CollectionEditor
        key={`${id}-${collection.version}`}
        collection={collection}
        media={media}
        justSaved={saved === "1"}
      />
    </AdminPage>
  );
}
