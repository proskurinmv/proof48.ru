# Design QA — Header and Hero

- Source visual truth: `/var/folders/wz/hg0bhl8n2pb2xkxvsp4f2mp00000gn/T/codex-file-preview-PyHuC8/Промышленная гидроизоляция PROOF.png`
- Required hero source: `/Users/a1111/Documents/proof/main/images/hero.png`
- Implementation screenshot: `/Users/a1111/Documents/proof/qa/implementation-1586x992.png`
- Side-by-side evidence: `/Users/a1111/Documents/proof/qa/design-comparison.png`
- Viewport: 1586 × 992 CSS px, desktop, menu closed
- Source pixels: 1586 × 992
- Implementation screenshot pixels: 1983 × 1241
- Density normalization: the source was resized to 1983 × 1241 for the side-by-side comparison; the browser screenshot represents the same 1586 × 992 CSS viewport at the in-app browser capture density.

## Required fidelity surfaces

- Fonts and typography: Montserrat from the existing UI system; weights, hierarchy, wrapping and line heights match the supplied composition. Mobile title and description remain readable at 320 px.
- Spacing and layout rhythm: 84 px desktop header, 72 px compact header, aligned hero content, full-height first screen and CTA proportions verified.
- Colors and visual tokens: existing Proof variables are used; the requested responsive teal gradient recreates the right-side accent without an extra raster layer.
- Image quality and asset fidelity: `hero.png` is used directly with `cover`; no placeholder or generated hero image is present. The worker differs from the mockup because the user explicitly required the supplied `hero.png` as the source of truth for the background.
- Copy and content: header navigation, phone, hero text and CTA labels match the mockup.
- Icons: the existing `custom/svg_icons.html` sprite is loaded; phone and arrow symbols render from it.
- Accessibility: semantic landmarks, labelled navigation, visible focus styles, ARIA state, Escape close, focus return and reduced-motion handling are present.

## Full-view comparison evidence

The desktop comparison shows matched header height, content origin, hero height, typography hierarchy, CTA dimensions and right-side gradient placement. The photographic subject difference is expected because the supplied standalone `hero.png` is intentionally used instead of the different image embedded in the composite mockup.

Focused region comparison was not required: Header and Hero controls remain clearly readable in the 1983 × 1241 full-view comparison. Responsive captures and geometry were additionally inspected at every required width.

## Comparison history

1. P2 — the global stable scrollbar gutter left an 18 px blank strip at the right edge.
   - Fix: scoped the one-screen page to `scrollbar-gutter: auto` in `hero.css`.
   - Post-fix evidence: implementation fills the 1586 px viewport; `scrollWidth` equals `innerWidth`.
2. P2 — initial diagonal accent started too far left and too high.
   - Fix: tightened the two hard-stop teal gradients to the right-side proportions of the mockup.
   - Post-fix evidence: `qa/implementation-1586x992.png` and `qa/design-comparison.png`.
3. P2 — external `<use>` references did not render because the existing sprite filename is plural (`svg_icons.html`).
   - Fix: load the actual sprite path once and reference its in-document symbol IDs.
   - Post-fix evidence: 278 symbols are present in the rendered DOM; phone and CTA arrows are visible.
4. P2 — removing the mobile description line break also removed the separating space.
   - Fix: preserved a literal word boundary in the HTML.
   - Post-fix evidence: the 375 px and 320 px browser checks show correct wrapping and no horizontal overflow.

## Responsive and interaction checks

- Widths checked: 1440, 1280, 1024, 768, 576, 375 and 320 px.
- Horizontal overflow: none at all widths.
- Mobile menu: open/close, link close, Escape close, focus return and desktop breakpoint reset checked.
- Browser console: no warnings or errors.
- Primary interactions tested: phone link, consultation CTA, project CTA and mobile menu controls are reachable and exposed with correct semantics.

## Findings

No actionable P0/P1/P2 issues remain. The only visible source difference is the photographic subject mandated by the separate `hero.png` asset.

## Follow-up polish

- P3: replace the typographic PROOF wordmark with an official standalone logo asset if one becomes available.

final result: passed
