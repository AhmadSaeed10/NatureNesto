# NatureNesto

Next.js rebuild of naturenesto.com for a Lahore based plant and decor studio. Brand, content and information architecture are preserved; craft is elevated with editorial typography, texture and motion.

Read `CLAUDE.md` before contributing. It is the working agreement for brand tokens, typography, motion, accessibility and conventions.

## Stack

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4, ESLint, Prettier. Requires Node 22.18 or newer (scripts run TypeScript natively).

## Scripts

| Script              | What it does                                                                        |
| ------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`       | Start the dev server (regenerates tokens first)                                     |
| `npm run build`     | Production build (regenerates tokens first). Must pass before any PR                |
| `npm run start`     | Serve the production build                                                          |
| `npm run lint`      | ESLint. Must pass                                                                   |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`. Must pass                                |
| `npm run format`    | Prettier write. `format:check` to verify only                                       |
| `npm run tokens`    | Regenerate `src/styles/tokens.css` from `src/lib/tokens.ts`                         |
| `npm run contrast`  | WCAG contrast report for token pairs. Fails if an approved text pair drops below AA |

## Design tokens

`src/lib/tokens.ts` is the single source of truth. Tailwind v4 reads its theme from CSS, so `npm run tokens` compiles the tokens into a `@theme` block in `src/styles/tokens.css` (generated, do not edit). The default Tailwind palette is cleared, so only brand colours exist as utilities: `bg-background`, `bg-surface`, `text-ink`, `text-ink-muted`, `text-primary-dark`, `bg-primary`, `border-line` and so on.

Colour rules:

- Use `primary-dark` for green text and links. `primary` is for fills, icons, large text and decoration only.
- CTA fills use `primary-dark` with a `background` label. A label on `primary` or `accent` fails AA for normal text.
- Do not set `ink-muted` body text on `surface`. Use `ink` there.
- Never hardcode hex values outside `tokens.ts`.

Colour values are estimates from the logo and are marked UNCONFIRMED until checked against the original SVG.

Type utilities: `text-display`, `text-h1` to `text-h4`, `text-lead`, `text-body`, `text-small`, plus the `eyebrow` utility. Fonts: `font-serif` (Instrument Serif, italic for emphasis) and `font-sans` (DM Sans).

Texture: the page carries a fixed paper grain behind all content. Add `grain` to a surface for local grain.

## Content editing

All copy and link data lives in typed files under `src/content`. Components never hardcode copy.

- Source of truth for homepage copy: `docs/homepage-copy.md`. Copy is verbatim and is never rewritten.
- Any `flag` field marks an open item for client confirmation. List them with `grep -rn "flag:" src/content`.
- Old live URLs are redirected (308) to clean slugs via `src/content/redirects.ts`.

## Project structure

```
src/
  app/          routes, layouts, metadata
  components/   layout, sections, ui, motion
  content/      typed copy and link data
  lib/          tokens, fonts and shared utilities
  styles/       generated token CSS
scripts/        token build and contrast check
docs/           copy source and phase prompts
```
