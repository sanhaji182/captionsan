---
inclusion: fileMatch
fileMatchPattern: 'apps/web/**'
---

# CaptionSan — Visual Direction (steering)

This steering file mirrors `docs/design/visual-direction.md`. Apply it to any
work under `apps/web/`. The full rationale lives in the docs version. This
file is the short reference for agents.

## Tone
- Calm, professional, contemporary. Light mode first.
- Spacious layouts. Restrained color. Subtle elevation.

## Tokens (defined in `apps/web/src/app/globals.css` via Tailwind v4 `@theme`)
- Surface ramp: `surface`, `surface-raised`, `surface-sunken`.
- Borders: `border`, `border-strong`.
- Foreground: `foreground`, `foreground-muted`, `foreground-subtle`.
- Brand: `brand`, `brand-foreground`, `brand-soft`.
- Status: `success`, `warning`, `danger`.

## Typography
- Inter via `next/font/google`, wired in `apps/web/src/app/layout.tsx`.
- Type scale: 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36.
- Tighter tracking on 24+; line-height 1.5 body, 1.25 display.

## Radius
- xs 6, sm 8, md 10, lg 14.

## Shadow
- Only `xs`, `sm`, `md`. No heavy drop shadows.

## Component intent
- One primary action per screen.
- Quiet inputs that brand-tint on focus.
- Cards: raised surface, subtle border, `shadow-xs`.
- Status badges: low-saturation pills.

## Constraints for this and future redesign tasks
- Reference Tailwind utility classes that resolve to the tokens above.
- Do not introduce ad-hoc hex values in components.
- Do not change copy, language defaults, prompt-first flow, or invite-only
  access while applying visual changes.
- Dark mode is out of scope.
