# Job Mansion — Design System

Single source of truth for all UI. If a screen disagrees with this file, this file wins.

Reference screenshots in `docs/reference/` were not available at the time of writing. The system is built for a professional Indian training product: dense enough to feel useful, warm enough to feel human, never decorative for its own sake.

---

## 1. Brand and audience

**Three words:** Grounded. Precise. Direct.

**Audience:** Students and career switchers in India, mostly on a phone. Many will be on a mid-range Android, in bright light, on a slow network. Design for a thumb, a 375 px width, and copy that respects someone paying with real money.

The site should feel like a serious training institute that also happens to be easy to use — not a SaaS landing page, not a coaching-centre pamphlet.

---

## 2. Color

All values are hex. Do not introduce extra brand hues. Do not use default Tailwind blue, indigo, violet, cyan, or pink.

| Token | Hex | Role |
|---|---|---|
| `primary` | `#0E5A52` | Buttons, links, focus ring, wordmark |
| `primary-hover` | `#0A433D` | Hover / active on primary fills |
| `primary-soft` | `#E6F1EF` | Selected rows, chip fills, subtle highlight |
| `accent` | `#E8A23B` | Sparse emphasis: price flash, featured badge fill, one mark on a page |
| `accent-hover` | `#C98628` | Hover on accent fills |
| `accent-soft` | `#F8E9CC` | Accent chip background |
| `bg` | `#FBF8F3` | Page canvas |
| `surface` | `#FFFFFF` | Cards, nav, modals, inputs |
| `ink` | `#1C1B19` | Headings and body |
| `muted` | `#5F5A54` | Secondary text, captions, helper |
| `border` | `#E4DED4` | Dividers, card outlines |
| `border-strong` | `#8F877B` | Input borders (must meet 3:1) |
| `success` | `#1F7A4D` | Paid, enrolled, success toasts |
| `success-soft` | `#E5F4EC` | Success badge / alert fill |
| `error` | `#B42318` | Form errors, destructive actions |
| `error-soft` | `#F8E8E6` | Error alert fill |
| `warning` | `#7A5200` | Pending, refund in progress |
| `warning-soft` | `#F7EED8` | Warning alert fill |
| `disabled` | `#8A847C` | Disabled labels only (not body copy) |

**Accent is not a text color on `bg`.** It is a fill. Put `ink` on accent fills. Never put white on accent.

**Primary is not a text color on primary fills.** Put white on `primary`. Put `primary` as text on `bg` / `surface` / `primary-soft`.

### WCAG AA contrast (4.5:1 text, 3:1 UI)

Checked with relative luminance (sRGB).

| Pair | Ratio | Result | Use |
|---|---|---|---|
| `ink` on `bg` | 16.25 | AA pass | Body and headings |
| `ink` on `surface` | 17.21 | AA pass | Card copy |
| `ink` on `primary-soft` | 14.91 | AA pass | Highlighted text |
| `ink` on `accent` | 7.92 | AA pass | Text on amber fills |
| `ink` on `accent-soft` | 14.36 | AA pass | Featured chips |
| `ink` on `success-soft` | 15.15 | AA pass | Success alerts |
| `ink` on `error-soft` | 14.49 | AA pass | Error alerts |
| `ink` on `warning-soft` | 14.90 | AA pass | Warning alerts |
| `muted` on `bg` | 6.44 | AA pass | Captions, meta |
| `muted` on `surface` | 6.82 | AA pass | Card meta |
| `primary` on `bg` | 7.62 | AA pass | Links, teal text |
| `primary` on `primary-soft` | 6.99 | AA pass | Link on tint |
| white on `primary` | 8.07 | AA pass | Primary buttons |
| white on `primary-hover` | 11.15 | AA pass | Pressed primary |
| white on `success` | 5.32 | AA pass | Success badges if filled |
| white on `error` | 6.57 | AA pass | Destructive buttons |
| white on `warning` | 6.92 | AA pass | Warning badges if filled |
| `error` on `bg` | 6.21 | AA pass | Inline error text |
| `error` on `error-soft` | 5.53 | AA pass | Error title on tint |
| `success` on `bg` | 5.02 | AA pass | Success text |
| `success` on `success-soft` | 4.68 | AA pass | Success title on tint |
| `warning` on `bg` | 6.53 | AA pass | Warning text |
| `warning` on `warning-soft` | 6.15 | AA pass | Warning title on tint |
| `border-strong` on `bg` | 3.35 | AA UI pass | Input outline |
| `border-strong` on `surface` | 3.55 | AA UI pass | Input on cards |
| white on `accent` | 2.17 | **Fail** | Forbidden |
| `ink` on `primary` | 2.13 | **Fail** | Forbidden |
| `accent` on `bg` | 2.05 | **Fail** | Do not use amber as body text |
| `accent` on `accent-soft` | 1.81 | **Fail** | Use `ink` on accent-soft instead |
| `border` on `bg` | 1.26 | Fail as UI control | Decorative dividers only |

`disabled` on `bg` is 3.49 — large-text only. Disabled controls may use it; never use it for readable body copy.

---

## 3. Typography

**Display:** Bricolage Grotesque (600, 700). Slightly odd, architectural, not a luxury serif.

**Body:** DM Sans (400, 500, 600). Neutral, compact, readable at 16 px on a phone.

Self-host only:

```
@fontsource/bricolage-grotesque/600.css
@fontsource/bricolage-grotesque/700.css
@fontsource/dm-sans/400.css
@fontsource/dm-sans/500.css
@fontsource/dm-sans/600.css
```

Do not load Google Fonts at runtime. Do not load italic unless a screen truly needs it.

**Fallbacks:** `Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif` and `DM Sans, ui-sans-serif, system-ui, sans-serif`.

### Scale

Sizes in px. Line-height in px. Letter-spacing 0 unless noted. Headings use Bricolage; everything else uses DM Sans.

| Token | Mobile | Desktop | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display` | 32 / 40 | 44 / 52 | 700 | −0.02em | Home hero only |
| `h1` | 28 / 36 | 36 / 44 | 700 | −0.02em | Page titles |
| `h2` | 24 / 32 | 28 / 36 | 700 | −0.01em | Section titles |
| `h3` | 20 / 28 | 22 / 30 | 600 | 0 | Card titles, modal titles |
| `h4` | 18 / 26 | 18 / 26 | 600 | 0 | Subheads inside a section |
| `body` | 16 / 26 | 16 / 26 | 400 | 0 | All running copy |
| `body-strong` | 16 / 26 | 16 / 26 | 500 | 0 | Labels in forms, table primary cell |
| `small` | 14 / 22 | 14 / 22 | 400 | 0 | Meta, nav, helper |
| `caption` | 12 / 18 | 12 / 18 | 500 | 0.02em | Badges, overlines, legal |

Never drop body below 16 px. Never set a heading in DM Sans. Never set a paragraph in Bricolage.

Sentence case for every heading. No all-caps except a 12 px caption overline (category names).

---

## 4. Layout and spacing

**Base unit:** 8 px. Allowed spacing: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96. Prefer 8 and 16. Use 4 only inside chips and input padding tweaks.

| Token | Value |
|---|---|
| Page container | 1120 px max, 20 px side gutter on mobile, 32 px from 768 px up |
| Content measure | 640 px max for long reading (About, legal) |
| Nav height | 64 px |
| Section padding (mobile) | 48 px vertical |
| Section padding (desktop) | 80 px vertical |
| Card padding | 20 px mobile, 24 px desktop |
| Stack gap inside a card | 12 or 16 px |
| Form field gap | 16 px |
| Button height | 44 px (touch) |
| Input height | 44 px |

**Grid:** 4 columns below 768 px, 12 columns from 768 px. Gutter 16 px mobile, 24 px desktop. Course listing is 1 column on 375, 2 on 768, 3 on 1120 — never 5.

**Density:** Public marketing pages can breathe. Dashboards, tables and forms stay tight: 8–12 px between related rows, no huge empty cards.

**Alignment:** Left-align type. Center only a hero headline block or an empty state. Do not center body copy, forms, or card grids.

---

## 5. Shape and depth

Two radii only:

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8 px | Buttons, inputs, badges, toasts |
| `radius-md` | 12 px | Cards, modals, drawers, images |

No `rounded-full` except the focus ring’s outer offset is a rectangle; avatars if we ever show one may be 8 px, not a circle, to stay consistent.

**Border:** 1 px. `border` on cards and dividers. `border-strong` on inputs at rest. `primary` 2 px on focus.

Two shadows, warm, low:

| Token | Value | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(28, 27, 25, 0.06)` | Cards at rest |
| `shadow-md` | `0 8px 24px rgba(28, 27, 25, 0.10)` | Modals, dropdowns, sticky nav scroll |

No third shadow. No colored glows. No glass.

---

## 6. Components

Focus ring for every interactive control: `outline: 2px solid #0E5A52; outline-offset: 2px`. Visible on `:focus-visible` only, not mouse click.

### Button

Variants: `primary` (teal fill, white text), `secondary` (surface, 1 px `border-strong`, ink text), `ghost` (no fill, primary text), `destructive` (error fill, white text).

| State | Behaviour |
|---|---|
| Rest | 44 × min 44, 16 px horizontal, 14/22 500, radius-sm |
| Hover | Darken fill (`primary-hover` / `accent-hover` / `#931E14` for destructive). Secondary: background `primary-soft` |
| Focus-visible | Teal ring |
| Active | Translate Y 1 px, keep hover color |
| Disabled | Opacity 0.45, `not-allowed`, no hover |
| Loading | Spinner 16 px, label stays (e.g. “Paying…”), button disabled |

Primary is for one action per view. Do not put two primary buttons side by side.

### Input, select, textarea

Label above, 14 px 500 ink. Field: surface fill, 1 px `border-strong`, radius-sm, 12 px 16 px padding, 16 px body text.

| State | Behaviour |
|---|---|
| Hover | Border `ink` |
| Focus | 2 px `primary` border, no extra glow |
| Error | 2 px `error` border, error text 14 px `error` below |
| Disabled | `bg` fill, `disabled` text, no hover |
| Placeholder | `muted` |

Helper text uses `muted`. Error replaces helper, it does not sit beside it.

### Card

Surface, 1 px `border`, radius-md, `shadow-sm`. Hover on clickable cards: `shadow-md` and border `primary` at 1 px. Not clickable: no hover lift.

### Badge

12 px caption, 500, 4×8 padding, radius-sm. Pairings:

- Published / paid / active: `success-soft` + `success` text
- Draft / pending: `warning-soft` + `warning` text
- Refunded / error: `error-soft` + `error` text
- Featured: `accent-soft` + `ink` text
- Category: `primary-soft` + `primary` text

### Table

Header 12 px caption, `muted`, 8 px 12 px, bottom border. Rows 16 px body, 12 px 12 px, hairline `border`. Hover row: `primary-soft`. Do not zebra-stripe. Horizontal scroll on mobile rather than squashing columns.

### Modal

Surface, radius-md, `shadow-md`, max 480 px wide, 24 px padding. Dimmer: `rgba(28, 27, 25, 0.45)`. Close is a button, not only overlay click. Esc closes. Focus traps inside. Title is `h3`.

### Toast

Fixed bottom 16 px (mobile) or bottom-right 24 px (desktop), radius-sm, 16 px padding, `shadow-md`, 5 s default. Success / error / warning use the matching soft fill and ink title. One toast at a time.

### Empty state

Icon 24 px Lucide, `muted`. Title `h3`. One sentence of `body` + `muted`. One secondary or primary action. No illustration mashups.

---

## 7. Content

**Voice:** Plain, specific, confident. Say what the course is and what it costs. Do not sell a lifestyle.

Write like a good instructor: short sentences, concrete nouns, no slogans.

**Headings:** Sentence case. “Full stack web development”, not “Full Stack Web Development” as a style rule (proper nouns stay capitalized).

**Prices:** Always rupees, `en-IN`. Store paise on the server; display as `₹19,999`. Strike `discountPrice` only when it exists. Never show `$`.

**Banned phrases:** unlock, elevate, seamless, supercharge, revolutionize, next-level, empower, journey, unlock your potential, world-class, cutting-edge, one-stop, harness, leverage (as a verb in marketing).

Also avoid: “10,000+ students”, “99% placement”, star ratings we did not measure, fake testimonials.

**Buttons:** Verb + object. “Pay ₹19,999”, “Create account”, “Send enquiry”. Not “Get started” unless the destination is truly ambiguous.

---

## 8. Imagery and icons

**Photos:** Unsplash or Pexels only. One treatment for every photo: slightly warm, no heavy filters, no neon overlays, 4:3 for cards, 16:9 for heroes. Prefer real classrooms, laptops, desks, Indian cities and campuses — not stock “team high-five”.

Credit the photographer in alt text when it is a meaningful image; decorative images get empty alt.

**Course tech marks:** Devicon, original colors, 24 px in lists, 32 px in hero chips. Never recolor a Devicon to teal.

**UI icons:** Lucide only, 20 px in nav and buttons, 16 px inline, 1.75 stroke, currentColor. No emoji as icons, ever. No random SVG packs mixed in.

**Logo:** Wordmark in Bricolage 700, `primary`, with a simple two-bar house-gable SVG (geometry, not clip art). Not an illustration of a mansion.

---

## 9. Avoid

- Purple-blue gradients, any gradient fill, gradient text
- Glassmorphism, blur overlays, glowing blobs, mesh backgrounds
- Five identical cards in a row
- Everything centered
- Oversized rounded corners (`rounded-2xl` / `rounded-3xl` / pills on every control)
- Emoji icons
- Lorem ipsum
- Invented statistics
- Default Tailwind indigo / blue buttons
- Inter, Roboto, or system font as the intended brand face
- Autoplaying video or motion that cannot be stopped
- Stock “happy diverse team pointing at a laptop” as the only imagery

---

## 10. Motion

- Hover and focus color/border/shadow: 150–200 ms `ease-out` only
- Page content: opacity 0 → 1 over 180 ms on first paint of the main region
- Drawers: 200 ms ease-out translate
- No bounce, no spring, no looping
- `prefers-reduced-motion: reduce`: no fade, no translate; instant state changes. Focus rings still appear.

---

## Implementation notes (for later; not code)

- Map these tokens in `tailwind.config.js` and `@theme` in `index.css`. Do not leave default `blue` / `indigo` in any component class.
- Install `@fontsource/bricolage-grotesque` and `@fontsource/dm-sans`. Import the weight CSS files from `main.jsx` or `index.css`.
- Lucide via `lucide-react`. Devicon via `devicon` CSS or SVG.
)
