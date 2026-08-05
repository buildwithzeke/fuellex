
# FuelLex — Design System

A complete reference for the visual language, Tailwind tokens, dark mode, UI component library, animations, and custom CSS that make up FuelLex's design system.

---

## Table of Contents

1. [Overview](#overview)
2. [Tailwind Setup](#tailwind-setup)
3. [Colour Tokens](#colour-tokens)
4. [Dark Mode](#dark-mode)
5. [Typography](#typography)
6. [Spacing & Radii](#spacing--radii)
7. [Shadows](#shadows)
8. [UI Component Library](#ui-component-library)
9. [Map Pin System](#map-pin-system)
10. [Animations & Motion](#animations--motion)
11. [Custom CSS Utilities](#custom-css-utilities)
12. [How to Use Tokens in Code](#how-to-use-tokens-in-code)

---

## Overview

FuelLex uses **Tailwind CSS v4** with a fully custom `@theme` token set defined in `client/src/index.css`. There is no `tailwind.config.js` — configuration lives entirely in CSS using the new v4 `@theme` directive.

Dark mode is toggled by adding the `.dark` class to `<html>`. All tokens are redefined under `.dark { ... }` so components automatically pick up dark values without any extra class logic in JSX.

The design targets a mobile-first card-based aesthetic: rounded corners, subtle shadows, clean whitespace, and a blue primary palette with semantic status colours.

---

## Tailwind Setup

Tailwind is imported at the top of `index.css`:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

The `@custom-variant dark` line tells Tailwind v4 that the `dark:` prefix should activate when any ancestor has the `.dark` class. This replaces the old `darkMode: 'class'` config option.

The `@theme { }` block that follows declares all custom design tokens. Any CSS custom property defined inside `@theme` is automatically available as a Tailwind utility class. For example, `--color-primary: #2563eb` generates `bg-primary`, `text-primary`, `border-primary`, `ring-primary`, etc.

---

## Colour Tokens

All colours are defined as CSS custom properties and available as Tailwind utilities.

### Brand — Primary (Blue)

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-primary` | `#2563eb` | `#3b82f6` | Buttons, links, active states, icons |
| `--color-primary-strong` | `#1d4ed8` | `#2563eb` | Hover states on primary elements |
| `--color-primary-soft` | `#eff6ff` | `#172554` | Background tint for icon containers, chips |
| `--color-primary-ink` | `#2563eb` | `#93c5fd` | Text on primary-soft backgrounds |

### Status — Success (Green)

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-success` | `#10b981` | `#34d399` | Available badges, in-stock indicators, map pins |
| `--color-success-strong` | `#059669` | — | Hover on success elements |
| `--color-success-soft` | `#ecfdf5` | `#064e3b` | Background tint for success containers |

### Status — Warning (Amber)

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-warning` | `#f59e0b` | `#fbbf24` | Expensive price map pins, verified station star |
| `--color-warning-soft` | `#fffbeb` | `#78350f` | Warning background tints |
| `--color-warning-ink` | `#b45309` | `#fde68a` | Text on warning-soft backgrounds |

### Status — Danger (Red)

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-danger` | `#ef4444` | `#f87171` | Out-of-stock, error states, map pins, destructive buttons |
| `--color-danger-strong` | `#dc2626` | — | Hover on danger elements |
| `--color-danger-soft` | `#fef2f2` | `#7f1d1d` | Error message backgrounds |

### Surfaces & Text

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `--color-surface` | `#ffffff` | `#0f1a2e` | Card backgrounds, navbar, modals |
| `--color-bg` | `#f8fafc` | `#0b1220` | Page background |
| `--color-text` | `#0f172a` | `#f1f5f9` | Primary body text, headings |
| `--color-text-2` | `#64748b` | `#94a3b8` | Secondary / descriptive text |
| `--color-text-3` | `#94a3b8` | `#64748b` | Muted / placeholder text, timestamps |
| `--color-border` | `#e2e8f0` | `#1e293b` | All borders, dividers |
| `--color-border-strong` | `#cbd5e1` | `#334155` | Stronger borders where needed |

---

## Dark Mode

Dark mode is controlled by the `ThemeContext`. When dark mode is active, `ThemeProvider` adds the `.dark` class to `document.documentElement`.

The user's preference is persisted in `localStorage` under the key `fuellex_theme`. On first visit, the system `prefers-color-scheme` is respected as the default.

All colour tokens are re-declared under `.dark { }` in `index.css`. This means:

- Components never need `dark:` variants for colour — they use semantic token names like `bg-surface` or `text-text-2` and the values update automatically.
- `dark:` Tailwind variants are only used for structural differences (e.g. opacity changes, display toggles) where the light and dark versions need different CSS properties, not just different values.

### Toggling dark mode

```jsx
import { useTheme } from '../context/ThemeContext'

const { theme, toggle } = useTheme()
// theme === 'light' | 'dark'
// toggle() flips between the two
```

---

## Typography

**Font family:** Inter Variable — a variable font with optical sizing loaded via `@fontsource-variable/inter`.

```css
--font-sans: "Inter Variable", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
```

The font is imported in `main.jsx`:
```js
import '@fontsource-variable/inter'
```

Tailwind makes this available as `font-sans` (set on `<body>` by default).

### Text scale conventions used in the codebase

| Tailwind class | Size | Usage |
|---|---|---|
| `text-[10px]` / `text-[10.5px]` | 10–10.5px | Tag labels, micro captions |
| `text-xs` | 12px | Timestamps, hints, table headers |
| `text-[12.5px]` / `text-[13px]` | 12.5–13px | Form labels, secondary body, card metadata |
| `text-sm` | 14px | Standard body text, button labels |
| `text-[15px]` / `text-[16px]` | 15–16px | Section headings, card titles |
| `text-lg` | 18px | Page headings (small) |
| `text-xl` | 20px | Page headings (medium) |
| `text-2xl` | 24px | Price display in station cards |
| `text-[34px]` | 34px | Large price on station detail page |
| `text-4xl` / `text-[42px]` | 36–42px | Landing page hero headline |

Font weights used: `font-medium` (500), `font-semibold` (600), `font-bold` (700), `font-extrabold` (800). The design leans heavily on `font-extrabold` for headings to create strong visual hierarchy.

---

## Spacing & Radii

Radii are defined as tokens but the codebase predominantly uses arbitrary values to match the mockup pixel-perfectly.

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `10px` | Small elements (tags, checkboxes) |
| `--radius-md` | `12px` | Buttons, inputs, icon containers |
| `--radius-lg` | `16px` | Cards, modals |
| `--radius-xl` | `24px` | Large cards, bottom sheets, hero search bar |

Most components use these values via arbitrary Tailwind classes directly: `rounded-[10px]`, `rounded-[14px]`, `rounded-[16px]`, `rounded-[24px]`.

Spacing follows Tailwind's default 4px scale (1 unit = 4px). Common values in the codebase: `p-4` (16px), `p-5` (20px), `p-[18px]`, `gap-3.5` (14px), `gap-4` (16px).

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(15,23,42,.06)` | Subtle card depth (light) |
| `--shadow-md` | `0 6px 16px rgba(15,23,42,.08)` | Floating panels, dropdowns |
| `--shadow-lg` | `0 16px 40px rgba(15,23,42,.12)` | Modals, toasts |
| `--shadow-primary` | `0 6px 16px rgba(37,99,235,.32)` | FAB, primary CTA buttons |
| `--shadow-success` | `0 6px 16px rgba(16,185,129,.32)` | Success-toned floating elements |

Dark mode uses higher-opacity black-based shadows since the surface is already dark.

---

## UI Component Library

All primitives live in `client/src/components/ui/`. Full props are documented in [frontend.md](./frontend.md). This section focuses on visual behaviour and token usage.

### Button

Five visual variants:

| Variant | Background | Text | Use |
|---|---|---|---|
| `primary` | `bg-primary` | white | Default CTA |
| `secondary` | `bg-surface` + `border-border` | `text-text` | Secondary actions |
| `ghost` | transparent | `text-text-2` | Tertiary, cancel actions |
| `success` | `bg-success` | white | Positive confirmation |
| `danger` | `bg-danger` | white | Destructive confirmation |
| `outline-danger` | transparent + `border-danger` | `text-danger` | Soft destructive (e.g. logout) |

All variants have hover, active (scale-95), focus-ring, and disabled states. The `loading` prop replaces the label with a `Spinner` and prevents double-submission.

Three sizes: `sm` (h-8, text-xs), `md` default (h-10, text-sm), `lg` (h-11, text-sm).

### Tag

Inline pill for labels and status indicators. Six tones:

| Tone | Background | Text | Typical use |
|---|---|---|---|
| `fuel` | `bg-primary-soft` | `text-primary-ink` | Fuel type label (PMS, AGO…) |
| `avail` | `bg-success-soft` | `text-success` | "Available" status |
| `oos` | `bg-danger-soft` | `text-danger` | "Out of stock" status |
| `price` | `bg-warning-soft` | `text-warning-ink` | Price vs average comparison |
| `brand` | `bg-primary-soft` | `text-primary` | Station brand / active filter chip |
| `neutral` | `bg-bg` | `text-text-2` | Generic label |

The `dot` prop adds a small colour-matched bullet `●` before the text — used on availability tags.

### Card

The foundational surface for almost all content blocks. Uses `bg-surface`, `border-border`, `shadow-sm`, `rounded-[16px]`, and `p-5`. The `hoverable` variant adds a cursor-pointer and a subtle `translateY(-1px)` lift with `shadow-md` on hover — used for clickable station and feature cards.

### Field

Labeled form input. The outer wrapper is `rounded-[12px]` with `border-border`, transitions to `border-primary` + a `ring-4 ring-primary/15` focus glow on focus. Error state switches border and text to `text-danger`. Prefix/suffix slots sit inside the input with a left/right divider.

### Modal

Portal (`ReactDOM.createPortal`) rendered into `document.body`. Backdrop is `bg-black/50` with a subtle blur. Inner panel is `bg-surface rounded-[24px]`. Closes on Escape key or backdrop click. Locks body scroll (`overflow: hidden` on `<body>`) while open to prevent scroll-behind on mobile.

### SegmentedControl

Pill-style tab row. Active option gets `bg-primary-soft text-primary border-primary`. Inactive options are `bg-surface border-border text-text-2`. The `activeTone` prop can swap the active colours to `success` (green) or `danger` (red) — used on the availability toggle in `ReportForm`.

### Skeleton

Shimmer loading placeholder using the `.fl-skeleton` class (see [Animations](#animations--motion)). Apply `className` for dimensions. Dark mode uses a darker shimmer gradient automatically.

### BottomSheet

Slide-up mobile overlay using the `fl-sheet-up` animation. Full-width, rounded top corners (`rounded-t-[24px]`), drag handle bar at top. Used for filter panel on mobile.

---

## Map Pin System

Map pins are Leaflet `L.divIcon` elements built from raw HTML. The CSS for pins is defined in `index.css`.

### Structure

```html
<div class="fl-pin fl-pin--{tone}">
  <span class="fl-pin__tip" data-mark="₦"></span>
  <span class="fl-pin__label">Station Name · ₦915</span>
</div>
```

- `.fl-pin__tip` — the teardrop shape, rotated -45deg, coloured by tone class.
- `::after` on `.fl-pin__tip` reads the `data-mark` attribute and renders the `₦` symbol rotated back 45deg inside the teardrop.
- `.fl-pin__label` — a pill label positioned below the teardrop, readable at map zoom level.

### Tone classes

| Class | Colour token | Meaning |
|---|---|---|
| `.fl-pin--green` | `--color-success` | Price ≥ 2% below average (cheapest nearby) |
| `.fl-pin--blue` | `--color-primary` | Price within ±2% of average (normal) |
| `.fl-pin--orange` | `--color-warning` | Price ≥ 2% above average (expensive) |
| `.fl-pin--red` | `--color-danger` | Station reported out of stock |

### Active state

`.fl-pin--active .fl-pin__tip` adds a blue glow ring:
```css
box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.15);
```
Used when a user selects a station in the sidebar — the corresponding pin pulses to indicate focus.

### Dark mode label

The label background switches from `rgba(255,255,255,.94)` to `rgba(15,26,46,.94)` under `.dark`.

---

## Animations & Motion

All animations are defined as `@keyframes` in `index.css` and exposed as Tailwind utility classes.

### `animate-fl-pulse`

Green radial pulse used on the "live" status dot in the landing page hero.

```css
@keyframes fl-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  70%  { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
```

Duration: `2s infinite`.

### `animate-fl-toast-in`

Toast notification entrance. Slides up 16px and fades in.

```css
@keyframes fl-toast-in {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

Duration: `0.3s ease`.

### `animate-fl-fade-in`

Simple opacity fade, used for overlays and backdrop.

```css
@keyframes fl-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

Duration: `0.2s ease`.

### `animate-fl-sheet-up`

Mobile bottom sheet entrance. Slides in from below.

```css
@keyframes fl-sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
```

Duration: `0.3s ease`.

### `animate-fl-rise`

Page element entrance. Combines upward movement with fade. Used for cards loading in.

```css
@keyframes fl-rise {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

Duration: `0.4s ease`.

### `.fl-skeleton` (shimmer)

Loading placeholder. A right-to-left sweeping gradient animation.

```css
@keyframes fl-shimmer {
  0%   { background-position:  100% 0; }
  100% { background-position: -100% 0; }
}

.fl-skeleton {
  background: linear-gradient(90deg, #eef2f7 25%, #e2e8f0 37%, #eef2f7 63%);
  background-size: 400% 100%;
  animation: fl-shimmer 1.4s ease infinite;
  border-radius: 8px;
}
```

Dark mode version uses a navy gradient automatically via `.dark .fl-skeleton`.

---

## Custom CSS Utilities

### `.fl-scrollbar-none`

Hides the scrollbar on horizontal scroll containers (used on mobile station card strip).

```css
.fl-scrollbar-none {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.fl-scrollbar-none::-webkit-scrollbar { display: none; }
```

### `.fl-slider`

Styled `<input type="range">`. Replaces the default browser track with a primary-coloured fill using a CSS custom property `--fill`. The thumb is a white circle with a primary border.

```css
.fl-slider {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--color-primary) var(--fill, 40%),
    var(--color-border) var(--fill, 40%) 100%
  );
}
```

The `--fill` value is set inline by the `Slider` component based on `(value - min) / (max - min) * 100%`.

### `.fl-map-placeholder`

Background gradient shown behind the Google Maps `<iframe>` while it loads on the station detail page.

```css
.fl-map-placeholder {
  background: linear-gradient(180deg, #eaf2fb, #dde9f5);
}
.dark .fl-map-placeholder {
  background: linear-gradient(180deg, #172554 0%, #0b1220 100%);
}
```

### Leaflet overrides

Several Leaflet default styles are overridden in `index.css` to match the design system:

- `.leaflet-bar a` — uses `bg-surface`, `text-text`, `border-border` for zoom controls.
- `.leaflet-bar a:hover` — uses `bg-primary-soft`, `text-primary`.
- `.leaflet-popup-content-wrapper` — `border-radius: 14px` and `shadow-lg`.
- `.leaflet-popup-content` — removes default margin.
- `.leaflet-control-attribution` — reduced to `9px` font, dark-mode friendly.
- Map container background (`#dde9f5` light / `#0b1220` dark) prevents white flash before tiles load.

---

## How to Use Tokens in Code

Since all tokens are registered via `@theme`, they work as standard Tailwind utility classes.

### Colour

```jsx
// Background
<div className="bg-primary">           // --color-primary
<div className="bg-primary-soft">      // --color-primary-soft
<div className="bg-surface">           // --color-surface
<div className="bg-danger-soft">       // --color-danger-soft

// Text
<p className="text-text">              // --color-text
<p className="text-text-2">            // --color-text-2
<p className="text-success">           // --color-success

// Border
<div className="border-border">        // --color-border
<div className="border-primary">       // --color-primary

// Ring (focus)
<input className="ring-primary/15">   // --color-primary at 15% opacity
```

### Shadows

```jsx
<div className="shadow-sm">            // --shadow-sm
<div className="shadow-md">            // --shadow-md
<button className="shadow-[0_10px_26px_rgba(37,99,235,.45)]"> // FAB custom
```

### Composing with `cx()`

The `cx` helper from `lib/format.js` is used throughout the codebase to conditionally join class names:

```js
import { cx } from '../../lib/format'

<div className={cx(
  'rounded-[16px] border bg-surface p-5',
  hoverable && 'cursor-pointer hover:-translate-y-px hover:shadow-md',
  className   // consumer-passed overrides
)} />
```

This replaces the `clsx` / `classnames` package with a minimal 2-line implementation.
