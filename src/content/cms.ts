// Labels for CMS driven pages (blog, workshops, FAQ) written for the rebuild.
// flag: client to review wording. Page titles reuse the existing footer link labels.
export const cms = {
  flag: "Labels written for the rebuild. Client to review.",
  blog: { title: "Blogs", eyebrow: "Journal", readMore: "Read more", back: "All posts" },
  workshops: {
    title: "Workshops",
    eyebrow: "Connect & Grow",
    upcoming: "Upcoming",
    past: "Past workshops",
    when: "When",
    where: "Where",
    places: (n: number) => (n === 1 ? "1 place" : `${n} places`),
    price: "Price",
    free: "Free",
    book: "Ask about a place",
  },
  faq: { title: "FAQ", eyebrow: "Questions", other: "More questions" },
} as const;
