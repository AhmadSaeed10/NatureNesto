import { notFound } from "next/navigation";
import { AdminPage } from "@/components/admin/AdminPage";
import { ProductEditor } from "@/components/admin/products/ProductEditor";
import { admin } from "@/content/admin";
import { getEditorOptions, getProductForEditor } from "@/lib/admin/products";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  await requireStaff(ACCESS.catalog);
  const { id } = await params;
  const { saved } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [product, options] = await Promise.all([getProductForEditor(id), getEditorOptions()]);
  if (!product) notFound();
  return (
    <AdminPage title={product.title || admin.productEditor.editTitle}>
      {/* Keyed by version so every save, duplicate or switch starts from fresh state. */}
      <ProductEditor
        key={`${id}-${product.version}`}
        product={product}
        justSaved={saved === "1"}
        {...options}
      />
    </AdminPage>
  );
}
