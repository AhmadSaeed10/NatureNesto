// Column layout shared by export and import (one row per variant, grouped by handle).
export const PRODUCT_CSV_COLUMNS = [
  "Handle",
  "Title",
  "Status",
  "Vendor",
  "Type",
  "Tags",
  "Description",
  "SEO Title",
  "SEO Description",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant Title",
  "SKU",
  "Price",
  "Compare At Price",
  "Cost",
  "Weight (g)",
  "Stock",
  "Track Inventory",
  "Allow Backorder",
] as const;

export type ProductCsvColumn = (typeof PRODUCT_CSV_COLUMNS)[number];
export const CSV_MAX_BYTES = 5 * 1024 * 1024;
export const CSV_MAX_ROWS = 2000;
