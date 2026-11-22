# Design QA — Consultation

- Source visual truth: `/Users/a1111/Desktop/форма.png`.
- Source background: `/Users/a1111/Desktop/Капли на графитовой мембране рассветной крыши.png`.
- Implementation: `http://127.0.0.1:4173/main/#consultation`.
- Implementation screenshot: Codex Desktop in-app Browser session capture.
- Viewport: 1672 × 941 CSS px; source and implementation compared at 1:1 density.
- State: empty form, default select option, no attached files.

## Full-view comparison

- The source and implementation were rendered together in one side-by-side comparison view.
- The section keeps the source proportions: left copy, right 720 px form panel, 941 px section height and the supplied roof image.
- The form starts on the same visual line as the eyebrow label; field heights, two-column rhythm, radii and CTA placement match the source.
- The sticky site header remains visible by product requirement; this is the only intentional difference from the isolated source block.

## Focused comparison

- Typography: the desktop heading uses the project Montserrat family and matches the source five-line wrapping.
- Spacing: the desktop content begins around 100 px from the left, while the form begins around 874 px and remains 720 px wide.
- Colors: only project semantic variables are used; the form uses a neutral translucent surface and the CTA uses the existing teal tokens.
- Image quality: the supplied 1536 × 1024 image is used directly with responsive cover cropping.
- Copy: all source labels, field placeholders and CTA text are preserved.

## Responsive, interaction and accessibility checks

- Checked desktop and responsive widths: 1672, 1440, 1280, 1024, 768, 576, 375 and 320 px.
- At 1120 px the content and form stack; at 576 px the form becomes one column.
- No horizontal overflow at 375 or 320 px.
- Required inputs have programmatic labels; the select, textarea and multi-file control remain native and keyboard accessible.
- Filled inputs and the task select were tested with local sample values; six required controls are exposed.
- Focus styles, reduced-motion handling and touch-safe hover rules are present.

## Comparison history

- P2: the 320 px heading clipped the word “предварительное”. Fixed by reducing the mobile display size; title and form scroll widths now equal their client widths.
- P2: the first desktop pass wrapped the heading differently from the source. Fixed by widening the left grid track, shifting the form to the source position and tuning the display size.
- Post-fix side-by-side comparison shows no actionable P0, P1 or P2 differences.

final result: passed
