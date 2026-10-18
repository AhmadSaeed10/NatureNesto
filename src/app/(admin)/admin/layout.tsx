import type { Metadata } from "next";
import { admin } from "@/content/admin";

export const metadata: Metadata = {
  title: admin.metaTitle,
  robots: { index: false, follow: false },
};

// Calm admin shell: no storefront chrome, grain or motion.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 flex-col bg-surface text-ink">{children}</div>;
}
