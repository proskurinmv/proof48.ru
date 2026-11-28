# Design QA — Scroll experience and Footer

- Source video: `/Users/a1111/Desktop/Запись экрана — 2026-11-23 в 21.53.53.mov`.
- Implementation: `http://127.0.0.1:4173/main/`.
- Browser captures: Firefox at 1440 × 900 and 375 × 812 CSS px.

## Motion analysis

- The reference pins the dark opening scene while the next light panel rises above it.
- The covered hero content recedes more slowly than the foreground panel, creating visible depth.
- The floating lower navigation from the reference was intentionally omitted because Proof already has a fixed header.

## Implementation comparison

- The Hero is pinned on desktop and the Industries panel covers it with the project radius and spacing tokens.
- Hero content translates, scales and fades in proportion to native page scroll; the background shifts at a different rate.
- The verified 500 px browser position shows the Hero fixed at the top and the light panel at 368 px.
- Native browser scrolling and existing anchor behavior are preserved.

## Responsive and accessibility checks

- Touch and coarse-pointer devices retain native scrolling.
- `prefers-reduced-motion: reduce` disables inertia and stacked transitions.
- No wheel or touch events are intercepted.
- The 375 px capture preserves the existing mobile layout without horizontal overflow.
- Protected design-system files were not edited.

## Comparison history

- RED: the page only changed wheel timing, so the visual result was nearly indistinguishable from native trackpad scrolling.
- GREEN: four focused tests pass for file loading, accessibility fallbacks, the pinned panel geometry and scroll-linked depth.
- No actionable P0, P1 or P2 differences remain.

## Footer comparison

- Source: `/Users/a1111/Desktop/Премиальный футер «Пруф» с кровельной текстурой.png`.
- Implementation: `http://127.0.0.1:4173/main/index.html#footer`.
- Visual comparison: source and the 1440 × 900 implementation capture were reviewed together in the in-app browser.
- Layout: brand, service/company navigation, contacts, social icons and the location row preserve the reference hierarchy and separators.
- Assets: the supplied `main/images/footer/footer-fon.png` is used as the section background; the existing `#logo-proof` symbol is rendered in white with the requested CSS filter.
- Content: project phone and email replace the mock placeholders; social marks are MAX, VK and Rutube.
- Responsive checks: 1440, 1024, 768, 375 and 320 px. On mobile, the `Services` and `Company` navigation groups form two equal columns; Footer text remains within the viewport and the Footer itself has no horizontal overflow.
- Accessibility: semantic footer/navigation/contact links, labelled social marks and visible keyboard focus inherited from the project UI layer.
- No protected design-system files were edited.

final result: passed
