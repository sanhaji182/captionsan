# CaptionSan — Visual Direction

This document defines the modern visual direction for CaptionSan. It is the
reference for every later UI redesign task. Subsequent tasks (layout,
dashboard, components, motion, accessibility) must build on the tokens and
principles described here without diverging.

Indonesian remains the default UI language. English remains supported. The
prompt-first workflow and invite-only access are preserved. No core workflow
changes in this task.

## Design tone

- Calm, professional, and contemporary.
- Light mode first. Dark mode is out of scope for this task.
- Spacious, with strong hierarchy and generous whitespace.
- Restrained color usage. Color is reserved for status and primary action.
- Soft surfaces with subtle elevation, not flashy gradients or heavy shadows.

## Foundation tokens

These tokens are wired into `apps/web/src/app/globals.css` via Tailwind v4
`@theme` and are the single source of truth for the visual system. Pages
should reference Tailwind utility classes that resolve to these tokens
rather than ad-hoc hex values.

### Color

Neutral surface ramp (page, cards, borders, muted text) and a single brand
accent. Status colors are reserved for badges and feedback only.

- `--color-surface`: page background. A warm off-white that is calmer than
  pure white and lighter than `gray-50`.
- `--color-surface-raised`: cards, inputs, modals.
- `--color-surface-sunken`: subtle wells, table headers.
- `--color-border`: default borders and dividers.
- `--color-border-strong`: focused borders.
- `--color-foreground`: primary text.
- `--color-foreground-muted`: secondary text.
- `--color-foreground-subtle`: tertiary text and helper text.
- `--color-brand`: primary action and active states. Indigo-leaning, not
  saturated, so it stays calm next to neutral surfaces.
- `--color-brand-foreground`: text on brand surfaces.
- `--color-brand-soft`: tinted background for selected rows, hover, etc.
- `--color-success`, `--color-warning`, `--color-danger`: status only.

### Typography

- Body: Inter, variable, loaded via `next/font/google` for fast, layout-shift
  free rendering. Falls back to system UI fonts.
- Display: same family. We rely on weight and size, not a separate face.
- Type scale: 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30 / 36.
- Tracking: tighter on display sizes (`-0.02em` on 24+), normal otherwise.
- Line height: 1.5 for body, 1.25 for display.

### Radius

- `xs`: 6px (badges, small chips).
- `sm`: 8px (inputs, buttons).
- `md`: 10px (cards, panels).
- `lg`: 14px (modals, large surfaces).

### Shadow

Two levels only. No heavy drop shadows.

- `shadow-xs`: 0 1px 2px rgba(15, 23, 42, 0.04).
- `shadow-sm`: 0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.05).
- `shadow-md`: 0 4px 12px rgba(15, 23, 42, 0.06), 0 2px 4px rgba(15, 23, 42, 0.04).

### Spacing rhythm

Base unit is 4px. Section padding leans toward 24-32px on desktop. Form
fields use 12-14px vertical padding. Cards use 20-24px padding.

## Component-level intent

These are intent statements only. The component system itself is delivered
in Task 5. Tasks between now and then must respect these intents.

- Buttons have three priorities: primary (brand), secondary (neutral
  outline), and ghost (text-only). One primary per screen.
- Inputs are quiet by default and gain a brand-tinted border on focus.
- Cards use the raised surface, a subtle border, and `shadow-xs`. Elevation
  increases only on interactive emphasis.
- Status badges are pill-shaped, low-saturation, and readable on the muted
  background.

## What this task delivers

- This document.
- Design tokens wired into Tailwind v4 in `globals.css`.
- The Inter typeface wired in `layout.tsx` so the app immediately feels
  lighter and more contemporary.
- No page-level redesign. Existing flows render unchanged on top of the
  new foundation.

## What this task explicitly does not do

- Does not redesign navigation, dashboard, settings, or projects pages.
- Does not introduce new components.
- Does not change copy, language defaults, or workflow.
- Does not introduce dark mode.
