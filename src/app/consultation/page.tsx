import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { EnquiryPage } from "@/components/forms/EnquiryPage";
import { forms } from "@/content/forms";
import { needHelp } from "@/content/home";
import { headerCta } from "@/content/nav";
import { site } from "@/content/site";
import { seo } from "@/content/seo";
import { steps } from "@/content/steps";
import { pageMetadata } from "@/lib/seo";

const TITLE = headerCta.label;

export const metadata = pageMetadata({
  title: TITLE,
  description: seo.pageDescription(TITLE),
  path: "/consultation",
});

const whatsapp = needHelp.channels.find((channel) => channel.kind === "whatsapp");

export default function ConsultationPage() {
  return (
    <EnquiryPage
      eyebrow={forms.pages.consultationEyebrow}
      title={TITLE}
      // Step 01 of How It Works is exactly what this form asks for.
      intro={steps[0]?.body ?? ""}
    >
      <EnquiryForm kind="consultation" whatsappHref={whatsapp?.href ?? ""} email={site.email} />
    </EnquiryPage>
  );
}
