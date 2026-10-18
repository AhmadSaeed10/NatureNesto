import { AdminPage } from "@/components/admin/AdminPage";
import { CollectionEditor } from "@/components/admin/collections/CollectionEditor";
import { admin } from "@/content/admin";
import { listMediaOptions } from "@/lib/admin/media";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

export default async function NewCollectionPage() {
  await requireStaff(ACCESS.catalog);
  const media = await listMediaOptions();
  return (
    <AdminPage title={admin.collections.editor.newTitle}>
      <CollectionEditor collection={null} media={media} />
    </AdminPage>
  );
}
