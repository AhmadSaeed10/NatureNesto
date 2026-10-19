import { admin } from "@/content/admin";
import type { HomeSectionType } from "@/lib/cms/sections";
import type { FieldSpec } from "./BlockForm";

const f = admin.content.fields;
const ICON_OPTIONS = Object.entries(admin.content.icons).map(([value, label]) => ({
  value,
  label,
}));
const CHANNEL_OPTIONS = Object.entries(f.channels).map(([value, label]) => ({ value, label }));

const cta: FieldSpec = {
  kind: "group",
  key: "cta",
  label: f.label,
  fields: [
    { kind: "text", key: "label", label: f.label },
    { kind: "text", key: "href", label: f.href, hint: f.hrefHint },
  ],
};

const titleOf = (key: string) => (item: Record<string, unknown>) =>
  typeof item[key] === "string" ? (item[key] as string) : "";

/** Form layout for each homepage block; field keys match src/lib/cms/sections.ts. */
export const SECTION_SPECS: Record<HomeSectionType, FieldSpec[]> = {
  hero: [
    { kind: "text", key: "subline", label: f.subline },
    { kind: "text", key: "headline", label: f.headline },
    { kind: "text", key: "secondary", label: f.secondary },
    cta,
    { kind: "image", key: "poster", label: f.poster, alt: false },
    {
      kind: "group",
      key: "video",
      label: f.video,
      fields: [{ kind: "text", key: "src", label: f.video, hint: f.hrefHint }],
    },
  ],
  tagline: [
    {
      kind: "list",
      key: "items",
      label: admin.content.home.sections.tagline,
      max: 6,
      blank: () => ({ text: "", icon: "plant" }),
      title: titleOf("text"),
      item: [
        { kind: "text", key: "text", label: f.text },
        { kind: "select", key: "icon", label: f.icon, options: ICON_OPTIONS },
      ],
    },
  ],
  value_props: [
    {
      kind: "list",
      key: "items",
      label: admin.content.home.sections.value_props,
      max: 6,
      blank: () => ({ title: "", body: "", icon: "guidance" }),
      title: titleOf("title"),
      item: [
        { kind: "text", key: "title", label: f.title },
        { kind: "text", key: "body", label: f.body, multiline: true },
        { kind: "select", key: "icon", label: f.icon, options: ICON_OPTIONS },
      ],
    },
  ],
  how_it_works: [
    { kind: "text", key: "eyebrow", label: f.eyebrow },
    { kind: "text", key: "title", label: f.title },
    {
      kind: "list",
      key: "steps",
      label: admin.content.home.sections.how_it_works,
      max: 8,
      blank: () => ({ number: "", title: "", body: "" }),
      title: titleOf("title"),
      item: [
        { kind: "text", key: "number", label: f.number },
        { kind: "text", key: "title", label: f.title },
        { kind: "text", key: "body", label: f.body, multiline: true },
      ],
    },
  ],
  services: [
    { kind: "text", key: "eyebrow", label: f.eyebrow },
    {
      kind: "list",
      key: "services",
      label: admin.content.home.sections.services,
      max: 12,
      blank: () => ({
        slug: "",
        title: "",
        href: "/services",
        legacyPath: "",
        icon: "leaf",
        featured: false,
      }),
      title: titleOf("title"),
      item: [
        { kind: "text", key: "title", label: f.title },
        { kind: "text", key: "href", label: f.href, hint: f.hrefHint },
        { kind: "text", key: "slug", label: f.key },
        { kind: "select", key: "icon", label: f.icon, options: ICON_OPTIONS },
        { kind: "checkbox", key: "featured", label: f.featured },
      ],
    },
  ],
  banner: [
    { kind: "text", key: "headline", label: f.headline },
    { kind: "text", key: "secondary", label: f.secondary },
    cta,
    { kind: "image", key: "image", label: f.image, alt: true },
  ],
  plants: [
    { kind: "text", key: "title", label: f.title },
    {
      kind: "list",
      key: "categories",
      label: admin.content.home.sections.plants,
      max: 12,
      blank: () => ({ slug: "", title: "", href: "/", image: { src: "", alt: "" } }),
      title: titleOf("title"),
      item: [
        { kind: "text", key: "title", label: f.title },
        { kind: "text", key: "href", label: f.href, hint: f.hrefHint },
        { kind: "text", key: "slug", label: f.key },
        { kind: "image", key: "image", label: f.image, alt: true },
      ],
    },
  ],
  need_help: [
    { kind: "text", key: "title", label: f.title },
    { kind: "text", key: "body", label: f.body, multiline: true },
    { kind: "text", key: "signOff", label: f.signOff },
    {
      kind: "list",
      key: "channels",
      label: admin.content.home.sections.need_help,
      max: 4,
      blank: () => ({ kind: "email", label: "", prompt: "", display: "", href: "mailto:" }),
      title: titleOf("label"),
      item: [
        { kind: "select", key: "kind", label: f.kind, options: CHANNEL_OPTIONS },
        { kind: "text", key: "label", label: f.label },
        { kind: "text", key: "prompt", label: f.prompt },
        { kind: "text", key: "display", label: f.display },
        { kind: "text", key: "href", label: f.href, hint: f.hrefHint },
      ],
    },
  ],
};
