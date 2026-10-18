/** URL handle from free text: "Monstera Deliciosa!" becomes "monstera-deliciosa". */
export function toHandle(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export const HANDLE_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Tags are matched exactly by collection rules, so they are normalised the same way. */
export function toTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9:-]/g, "")
    .slice(0, 50);
}
