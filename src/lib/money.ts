// Prices are stored in paisa (PKR x 100) so sums never meet floating point error.
export const PAISA_PER_RUPEE = 100;

/** "1,500.50" or "1500" (rupees) to paisa, or null when the text is not a price. */
export function rupeesToPaisa(value: string): number | null {
  const clean = value.replace(/[,\s]/g, "");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(clean)) return null;
  return Math.round(Number(clean) * PAISA_PER_RUPEE);
}

/** Paisa to an editable rupee string: 150050 becomes "1500.50", 150000 becomes "1500". */
export function paisaToRupees(paisa: number | null | undefined): string {
  if (paisa === null || paisa === undefined) return "";
  const rupees = paisa / PAISA_PER_RUPEE;
  return Number.isInteger(rupees) ? String(rupees) : rupees.toFixed(2);
}

const PKR = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export const formatPaisa = (paisa: number): string => PKR.format(paisa / PAISA_PER_RUPEE);
