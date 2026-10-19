// Rich text for pages, posts, workshops and FAQ answers. Stored as a small Markdown subset
// and rendered from this tree with an element allowlist, so stored content can never
// inject HTML or scripts. Supported: ## headings, paragraphs, - and 1. lists, > quotes,
// --- rules, **bold**, *italic*, [links](https://...).

export interface RichTextValue {
  format: "markdown";
  source: string;
}

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "link"; href: string; children: Inline[] }
  | { type: "break" };

export type Block =
  | { type: "heading"; level: 2 | 3 | 4; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "quote"; children: Inline[] }
  | { type: "rule" };

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
export const isSafeHref = (href: string): boolean => SAFE_HREF.test(href.trim());

export const RICH_TEXT_MAX = 50_000;

/** Reads a stored jsonb value (markdown, legacy plain text, or a bare string). */
export function richTextSource(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if ("source" in value && typeof value.source === "string") return value.source;
    if ("text" in value && typeof value.text === "string") return value.text;
  }
  return "";
}

export const toRichText = (source: string): RichTextValue => ({
  format: "markdown",
  source: source.replace(/\r\n?/g, "\n").slice(0, RICH_TEXT_MAX),
});

const INLINE_PATTERNS: { type: "link" | "strong" | "em"; regex: RegExp }[] = [
  { type: "link", regex: /\[([^\]\n]+)\]\(([^)\s]+)\)/ },
  { type: "strong", regex: /\*\*([^*\n]+?)\*\*/ },
  { type: "em", regex: /(?<![\w*])[*_]([^*_\n]+?)[*_](?![\w*])/ },
];

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  while (rest) {
    let best: { type: "link" | "strong" | "em"; match: RegExpExecArray } | null = null;
    for (const pattern of INLINE_PATTERNS) {
      const match = pattern.regex.exec(rest);
      if (match && (best === null || match.index < best.match.index))
        best = { type: pattern.type, match };
    }
    if (!best) {
      pushText(out, rest);
      break;
    }
    const { match, type } = best;
    if (match.index > 0) pushText(out, rest.slice(0, match.index));
    const inner = match[1] ?? "";
    if (type === "link") {
      const href = match[2] ?? "";
      // Unsafe schemes (javascript:, data:) are dropped and the label kept as text.
      if (isSafeHref(href)) out.push({ type: "link", href, children: parseInline(inner) });
      else out.push(...parseInline(inner));
    } else {
      out.push({ type, children: parseInline(inner) });
    }
    rest = rest.slice(match.index + match[0].length);
  }
  return out;
}

function pushText(out: Inline[], text: string) {
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    if (index > 0) out.push({ type: "break" });
    if (line) out.push({ type: "text", text: line });
  });
}

const LIST_ITEM = /^\s*(?:([-*])|(\d+)[.)])\s+(.*)$/;

export function parseRichText(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n?/g, "\n").slice(0, RICH_TEXT_MAX).split("\n");
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: "paragraph", children: parseInline(paragraph.join("\n")) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      // Pages own the one h1, so content headings start at h2.
      const level = Math.min(4, Math.max(2, (heading[1] ?? "").length + 1)) as 2 | 3 | 4;
      blocks.push({ type: "heading", level, children: parseInline(heading[2] ?? "") });
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flush();
      blocks.push({ type: "rule" });
      continue;
    }
    if (trimmed.startsWith(">")) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith(">")) {
        quote.push((lines[i] ?? "").trim().replace(/^>\s?/, ""));
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "quote", children: parseInline(quote.join("\n")) });
      continue;
    }
    const item = LIST_ITEM.exec(line);
    if (item) {
      flush();
      const ordered = Boolean(item[2]);
      const items: Inline[][] = [];
      while (i < lines.length) {
        const next = LIST_ITEM.exec(lines[i] ?? "");
        if (!next || Boolean(next[2]) !== ordered) break;
        items.push(parseInline(next[3] ?? ""));
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    paragraph.push(trimmed);
  }
  flush();
  return blocks;
}

/** Plain text for excerpts and meta descriptions. */
export function richTextPlain(source: string, max = 160): string {
  const flatten = (nodes: Inline[]): string =>
    nodes
      .map((node) =>
        node.type === "text" ? node.text : node.type === "break" ? " " : flatten(node.children),
      )
      .join("");
  const text = parseRichText(source)
    .map((block) =>
      block.type === "list"
        ? block.items.map(flatten).join(" ")
        : block.type === "rule"
          ? ""
          : flatten(block.children),
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
