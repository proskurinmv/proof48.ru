# Design QA — About transparency

- Source detail: `/var/folders/wz/hg0bhl8n2pb2xkxvsp4f2mp00000gn/T/codex-clipboard-7958fcc0-c07c-4e89-b301-eb0af481ca8d.png`.
- Implementation: `http://127.0.0.1:4173/main/#about`.
- Browser comparison viewport: 1280 × 720 CSS px.

## Focused comparison

- The photo now fills the complete 672 px media height and continues behind the trust panel.
- The trust panel overlays the image with a semi-transparent dark teal gradient derived only from existing color variables.
- The desktop media geometry is unchanged: upper-right radius 150 px, lower-right radius 32 px.
- Text, icons, dividers and the supplied image asset remain unchanged.

## Responsive and accessibility checks

- At 826 px the photo and trust panel still share one responsive grid area without horizontal overflow.
- At 768 px and below the existing image ratios and stacked trust items are preserved.
- Semantic list structure, image alternative text and existing keyboard behavior remain intact.
- Protected design-system files were not edited.

## Comparison history

- RED: the image height was 480 px inside a 672 px media block and did not overlap the 192 px trust panel.
- GREEN: the image height is 672 px, the panel overlaps it, and the computed gradient contains alpha values of 0.88 and 0.82.
- No actionable P0, P1 or P2 differences remain for the requested transparency change.

final result: passed
