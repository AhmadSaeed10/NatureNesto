import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { HEADER_HOME_LINK_ID, Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { needHelp } from "@/content/home";
import { seo } from "@/content/seo";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { ANNOUNCEMENT_STORAGE_KEY, MAIN_CONTENT_ID } from "@/lib/constants";
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

const whatsappHref =
  needHelp.channels.find((channel) => channel.kind === "whatsapp")?.href ?? `mailto:${site.email}`;

// Runs before paint so a dismissed announcement never flashes on reload.
const announcementScript = `try{if(sessionStorage.getItem("${ANNOUNCEMENT_STORAGE_KEY}"))document.documentElement.dataset.announcement="dismissed"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The pre-paint script may add data-announcement before hydration.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: announcementScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <MotionProvider>
          <SkipLink />
          <AnnouncementBar
            message={site.announcement}
            socials={site.socials}
            focusTargetId={HEADER_HOME_LINK_ID}
          />
          <Header />
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
          <FloatingWhatsApp href={whatsappHref} label={ui.whatsappFloat} />
          <CursorFollower label={ui.cursorView} />
        </MotionProvider>
      </body>
    </html>
  );
}
