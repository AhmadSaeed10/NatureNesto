import { AdminPage } from "@/components/admin/AdminPage";
import { ProductEditor } from "@/components/admin/products/ProductEditor";
import { admin } from "@/content/admin";
import { getEditorOptions } from "@/lib/admin/products";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

export default async function NewProductPage() {
  await requireStaff(ACCESS.catalog);
  const options = await getEditorOptions();
  return (
    <AdminPage title={admin.productEditor.newTitle}>
      <ProductEditor product={null} {...options} />
    </AdminPage>
  );
}
