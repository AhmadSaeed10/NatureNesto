import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { CategoryManager } from "@/components/admin/collections/CategoryManager";
import { CollectionTabs } from "@/components/admin/collections/CollectionTabs";
import { admin } from "@/content/admin";
import { listCategoryTree } from "@/lib/admin/collections";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

export default async function CategoriesPage() {
  await requireStaff(ACCESS.catalog);
  const categories = await listCategoryTree();
  return (
    <AdminPage title={admin.collections.title}>
      <CollectionTabs />
      <AdminCard
        title={admin.collections.tabs.categories}
        description={admin.collections.categories.intro}
      >
        {/* Remounts after each change so the forms reset to the saved tree. */}
        <CategoryManager
          key={categories.map((c) => `${c.id}:${c.parentId}:${c.name}`).join("|")}
          categories={categories}
        />
      </AdminCard>
    </AdminPage>
  );
}
