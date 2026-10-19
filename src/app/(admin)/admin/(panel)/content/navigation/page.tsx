import { MenuEditor } from "@/components/admin/content/MenuEditor";
import { admin } from "@/content/admin";
import { listMenus } from "@/lib/admin/content";

export default async function NavigationPage() {
  const menus = await listMenus();
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-2xl text-ink-muted">{admin.content.navigation.intro}</p>
      {menus.map((menu) => (
        <MenuEditor
          key={`${menu.id}-${menu.items.map((i) => i.href + i.label).join("|")}`}
          menu={menu}
        />
      ))}
    </div>
  );
}
