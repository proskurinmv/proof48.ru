# Design QA — Кровельные системы

- Source visual truth: `/Users/a1111/Desktop/ПРУФ_ Современные кровельные решения.png`
- Browser implementation crop: `/Users/a1111/Documents/proof48.ru/qa/roofing-systems-section.png`
- Combined comparison evidence: `/Users/a1111/Documents/proof48.ru/qa/roofing-systems-comparison.png`
- Mobile evidence: `/Users/a1111/Documents/proof48.ru/qa/roofing-systems-mobile.png`
- Browser viewport: 1673 × 941 CSS px for the source-size pass; 375 × 812 CSS px for mobile.
- Source pixels: 1673 × 941.
- Implementation section pixels: 1673 × 942 at device pixel ratio 1.
- Density normalization: source fitted to 1673 × 942 for the combined side-by-side comparison; implementation retained at browser density.
- State: default, `#roofing` visible.

## Required fidelity surfaces

- Fonts and typography: existing Montserrat system is preserved. The two-line display heading, weights, line height, wrapping and card hierarchy closely match the source.
- Spacing and layout rhythm: the brand strip, inset intro, CTA/metrics row, three-card grid, gutters, radii and section height follow the source composition.
- Colors and tokens: all colors and gradients use existing variables from `color.css`; no raw color values were added.
- Image quality: four dedicated WebP assets match the dark industrial roof art direction, including the pitched-roof hero, water-beaded coating, bitumen roll and membrane detail.
- Copy and content: heading, description, CTA, metrics and three system descriptions match the supplied design.
- Icons: metrics and arrows use `#ui-layers`, `#icon_industrial_width` and `#icon_arrow_right_3` from the existing sprite.
- Accessibility: semantic section/headings, labelled links, visible focus inherited from the UI system and reduced-motion handling are present.

## Full-view and focused comparison evidence

The combined comparison places the supplied source and browser-rendered block side by side at the same width. It confirms the dark left text field, right-aligned pitched roof, two-color heading, CTA/metrics alignment, three equal photographic cards and numbered hierarchy.

The same comparison is also the focused region check: the block fills the entire reference frame, while card typography, image crops, icons and link affordances remain legible at 1:1 density.

## Comparison history

1. Initial dark implementation used the previous light liquid-coating asset and the project-wide 1366 px container. This made the cards too narrow and the first card visually unlike the source.
2. Replaced the liquid asset with a dark water-beaded membrane macro, generated a matching pitched-roof hero, widened only this section to the source grid and aligned the intro inset.
3. The second comparison showed the action row and cards slightly high. Vertical spacing was adjusted with existing spacing variables; the final section is 1673 × 942 against a 1673 × 941 source.

## Responsive and interaction checks

- Checked widths: 1440, 1280, 1024, 768, 576, 375 and 320 px.
- Desktop: three cards in one row.
- Tablet: two cards plus a full-width third card.
- Mobile: one-column cards, full-width CTA and two compact metrics.
- No horizontal overflow at any checked width.
- All four section images load successfully and have non-zero natural dimensions.
- Mobile menu navigation to the section works.
- Browser console: no warnings or errors.

## Findings

No actionable P0/P1/P2 differences remain.

## Follow-up polish

- P3: a dedicated brand-mark asset could replace the text-only `PROOF` strip if one is added to the project sprite later.

final result: passed
