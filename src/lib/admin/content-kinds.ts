import type { DocEditorKind } from "@/components/admin/content/DocEditor";

export const DOC_KINDS: readonly DocEditorKind[] = ["pages", "blog", "workshops"];
export const isDocKind = (value: string): value is DocEditorKind =>
  (DOC_KINDS as readonly string[]).includes(value);
