---
description: Run the full quality gate for the NatureNesto project and report results
---

Run the quality gate and report a concise pass or fail table.

1. Run `npm run lint`, `npm run typecheck` and `npm run build`. Report errors and warnings.
2. Search the codebase for violations of CLAUDE.md:
   - hardcoded hex colors outside src/lib/tokens.ts
   - hardcoded user facing copy inside components instead of src/content
   - uses of `any`, non-null assertions without a comment, or `@ts-ignore`
   - images without alt text or without explicit sizing
   - animations that use properties other than transform, opacity or clip-path
   - missing reduced motion handling in components under src/components/motion
   - long dash characters (em dashes) in copy or comments
3. Check token contrast: compute WCAG contrast ratios for ink, inkMuted, primary and primaryDark against background and surface. Flag anything below 4.5:1 for body text or 3:1 for large text.
4. List any route referenced in navigation or footer that does not exist.
5. Output:
   - a table: check, status, details
   - a prioritized fix list (blocking, important, nice to have)

Do not fix anything unless I ask. Wait for confirmation.
