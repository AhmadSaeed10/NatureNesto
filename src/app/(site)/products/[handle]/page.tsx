import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@/components/cms/RichText";
import { Reveal } from "@/components/motion/Reveal";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { commerce } from "@/content/commerce";
import { needHelp } from "@/content/home";
import { shop } from "@/content/shop";
import { site } from "@/content/site";
import { richTextPlain } from "@/lib/cms/rich-text";
import { getProduct, listProductHandles } from "@/lib/commerce/products";
import { PAISA_PER_RUPEE } from "@/lib/money";
import { pageMetadata, siteUrl } from "@/lib/seo";

const whatsappHref = needHelp.channels.find((channel) => channel.kind === "whatsapp")?.href ?? "";
// Cache Components needs one param at build; the placeholder renders a 404.
const PLACEHOLDER = "no-products-yet";

export async function generateStaticParams() {
  const handles = await listProductHandles();
  return handles.length ? handles.map((handle) => ({ handle })) : [{ handle: PLACEHOLDER }];
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[handle]">): Promise<Metadata> {
  const product = await getProduct((await params).handle);
  if (!product) return {};
  return pageMetadata({
    title: product.seoTitle || product.title,
    description: product.seoDescription || richTextPlain(product.description) || product.title,
    path: `/products/${product.handle}`,
  });
}

export default async function ProductPage({ params }: PageProps<"/products/[handle]">) {
  const product = await getProduct((await params).handle);
  if (!product) notFound();

  const base = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: richTextPlain(product.description, 500) || undefined,
    image: product.images.map((image) => new URL(image.src, base).toString()),
    sku: product.variants[0]?.sku ?? undefined,
    brand: { "@type": "Brand", name: product.vendor || site.name },
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      price: (variant.price / PAISA_PER_RUPEE).toFixed(2),
      priceCurrency: "PKR",
      availability: variant.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${base}/products/${product.handle}`,
      sku: variant.sku ?? undefined,
    })),
  };
  const [hero, ...rest] = product.images;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <script
        type="application/ld+json"
        // Built from typed catalogue data; < is escaped so content cannot close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Link
        href="/pots-and-planters"
        className="mb-8 inline-flex min-h-(--size-tap) items-center text-small text-primary-dark underline-offset-4 hover:underline"
      >
        {commerce.product.back}
      </Link>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <div className="flex flex-col gap-4">
          {hero ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          {rest.length ? (
            <ul className="grid grid-cols-2 gap-4">
              {rest.map((image) => (
                <li
                  key={image.src}
                  className="relative aspect-square overflow-hidden rounded-card bg-surface"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 27vw, 50vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Reveal className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col gap-4">
            {product.productType ? (
              <Eyebrow>{product.productType}</Eyebrow>
            ) : (
              <Eyebrow>{shop.eyebrow}</Eyebrow>
            )}
            <h1 className="text-h2">{product.title}</h1>
          </div>
          <ProductPurchase product={product} whatsappHref={whatsappHref} />
          {product.description ? (
            <div className="flex flex-col gap-3 border-t border-line pt-6">
              <h2 className="eyebrow text-ink-muted">{commerce.product.details}</h2>
              <RichText source={product.description} />
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
