import type { Metadata } from "next";
import { seo } from "@/content/seo";
import { site } from "@/content/site";
import { ANNOUNCEMENT_STORAGE_KEY } from "@/lib/constants";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: seo.home.description,
  openGraph: {
    siteName: site.name,
    locale: "en_PK",
    type: "website",
    images: [{ url: seo.ogImage.url, width: 1200, height: 630, alt: seo.ogImage.alt }],
  },
  twitter: { card: "summary_large_image" },
};

// Runs before paint so a dismissed announcement never flashes on reload.
const announcementScript = `try{if(sessionStorage.getItem("${ANNOUNCEMENT_STORAGE_KEY}"))document.documentElement.dataset.announcement="dismissed"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The pre-paint script may add data-announcement before hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: announcementScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
