import type { Metadata } from "next";
import { HomeSections } from "@/components/cms/HomeSections";
import { getHomeSections, getHomeSeo } from "@/lib/cms/data";
import { localBusinessJsonLd, pageMetadata, siteUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const homeSeo = await getHomeSeo();
  return pageMetadata({
    title: homeSeo.title,
    description: homeSeo.description,
    path: "/",
    absoluteTitle: true,
  });
}

export default async function Home() {
  const sections = await getHomeSections();
  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD must be inline; the content is built from typed site data, not user input.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd(siteUrl())).replace(/</g, "\\u003c"),
        }}
      />
      <HomeSections sections={sections} />
    </>
  );
}
