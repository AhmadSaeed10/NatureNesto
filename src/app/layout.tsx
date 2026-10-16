import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { HEADER_HOME_LINK_ID, Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { ANNOUNCEMENT_STORAGE_KEY, MAIN_CONTENT_ID } from "@/lib/constants";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  openGraph: {
    siteName: site.name,
    locale: "en_PK",
    type: "website",
  },
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
          <CursorFollower label={ui.cursorView} />
        </MotionProvider>
      </body>
    </html>
  );
}
