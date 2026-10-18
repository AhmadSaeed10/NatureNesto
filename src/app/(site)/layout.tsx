import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { HEADER_HOME_LINK_ID, Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { needHelp } from "@/content/home";
import { site } from "@/content/site";
import { ui } from "@/content/ui";
import { MAIN_CONTENT_ID } from "@/lib/constants";

const whatsappHref =
  needHelp.channels.find((channel) => channel.kind === "whatsapp")?.href ?? `mailto:${site.email}`;

// Storefront chrome. The admin route group has its own calmer shell.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
