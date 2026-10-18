import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { CollectionTabs } from "@/components/admin/collections/CollectionTabs";
import { admin } from "@/content/admin";
import { listCollections } from "@/lib/admin/collections";
import { ACCESS, requireStaff } from "@/lib/auth/staff";

const copy = admin.collections;

export default async function CollectionsPage() {
  await requireStaff(ACCESS.catalog);
  const collections = await listCollections();

  return (
    <AdminPage
      title={copy.title}
      actions={
        <Link
          href="/admin/collections/new"
          className="inline-flex min-h-(--size-tap) items-center rounded-pill bg-primary-dark px-6 font-medium text-background"
        >
          {copy.add}
        </Link>
      }
    >
      <CollectionTabs />
      {collections.length === 0 ? (
        <p className="text-ink-muted">{copy.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-line bg-background">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-line text-ink-muted">
              <tr>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.title}
                </th>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.kind}
                </th>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.status}
                </th>
                <th scope="col" className="p-3 font-medium">
                  {copy.columns.products}
                </th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id} className="border-b border-line last:border-b-0">
                  <td className="p-3">
                    <Link
                      href={`/admin/collections/${collection.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {collection.title}
                    </Link>
                    <span className="block text-ink-muted">{collection.handle}</span>
                  </td>
                  <td className="p-3 text-ink-muted">{copy.kinds[collection.kind]}</td>
                  <td className="p-3 text-ink-muted">
                    {collection.status === "published" ? copy.published : copy.draft}
                  </td>
                  <td className="p-3 text-ink-muted">{copy.count(collection.productCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPage>
  );
}
