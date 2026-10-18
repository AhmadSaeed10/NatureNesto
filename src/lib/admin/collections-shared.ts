import type { CollectionRule } from "./products-shared";

// Shared by the collection editor (client) and the collection queries and actions (server).
export type CollectionKind = "manual" | "automatic";
export const SORT_ORDERS = ["manual", "title", "price-asc", "price-desc", "newest"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export interface CollectionMember {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
}

export interface EditorCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  kind: CollectionKind;
  rules: CollectionRule[];
  sortOrder: SortOrder;
  published: boolean;
  imageId: string;
  seoTitle: string;
  seoDescription: string;
  members: CollectionMember[];
  matchCount: number;
  version: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  handle: string;
  parentId: string | null;
  depth: number;
}
