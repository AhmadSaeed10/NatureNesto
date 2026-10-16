import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { shop } from "@/content/shop";
import type { Product } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** wa.me base link; the product enquiry is appended as a prefilled message. */
  whatsappHref: string;
  priority?: boolean;
}

export function ProductCard({ product, whatsappHref, priority = false }: ProductCardProps) {
  const price = formatPrice(product.price);
  const enquiry = `${whatsappHref}?text=${encodeURIComponent(shop.whatsappMessage(product.name, price))}`;

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface">
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-(--duration-reveal) ease-brand group-hover:scale-105",
            !product.inStock && "opacity-60 grayscale",
          )}
        />
        {product.badges && product.badges.length > 0 ? (
          <ul className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {product.badges.map((badge) => (
              <li
                key={badge}
                className="rounded-pill bg-background/90 px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-ink uppercase backdrop-blur-sm"
              >
                {shop.badges[badge]}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <h3 className="font-serif text-h4 text-ink">{product.name}</h3>
        {product.size ? <p className="text-small text-ink-muted">{product.size}</p> : null}
        <p className="mt-1 flex items-baseline gap-2 text-ink">
          <span className="font-medium">{price}</span>
          {product.compareAtPrice ? (
            <s className="text-small text-ink-muted">{formatPrice(product.compareAtPrice)}</s>
          ) : null}
        </p>
        <div className="mt-auto pt-4">
          {product.inStock ? (
            <Button
              href={enquiry}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              withArrow
              className="w-full sm:w-auto"
              aria-label={`${shop.enquire}: ${product.name}`}
            >
              {shop.enquire}
            </Button>
          ) : (
            <p className="inline-flex min-h-(--size-tap) items-center text-small font-medium text-ink-muted">
              {shop.outOfStock}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
