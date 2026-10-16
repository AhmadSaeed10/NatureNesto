// Titles and descriptions written for the rebuild (the live ones were keyword stuffed).
// flag: client to review wording.
export const seo = {
  flag: "Titles and descriptions written for the rebuild. Client to review.",
  home: {
    title: "Nature Nesto | Plants, Pots and Plant Styling in Lahore",
    description:
      "Bring life to your space with Nature Nesto, a Lahore plant and decor studio. Indoor and outdoor plants, pots and planters, and personalised plant styling.",
  },
  ogImage: {
    url: "/og.jpg",
    width: 1200,
    height: 630,
    alt: "Nature Nesto, a plant and decor studio in Lahore",
    flag: "Placeholder social image built from the placeholder hero poster.",
  },
  pageDescription: (title: string): string =>
    `${title} at Nature Nesto, a plant and decor studio in Lahore.`,
} as const;
