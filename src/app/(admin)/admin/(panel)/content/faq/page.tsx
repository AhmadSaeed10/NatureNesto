import { FaqManager } from "@/components/admin/content/FaqManager";
import { listFaqForEditor } from "@/lib/admin/content";

export default async function FaqAdminPage() {
  const items = await listFaqForEditor();
  return (
    <FaqManager key={items.map((item) => `${item.id}:${item.position}`).join("|")} items={items} />
  );
}
