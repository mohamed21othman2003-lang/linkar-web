# Linkar frontend: conventions (read before writing any code)

Source of truth: Figma file `Jg1QS1kTQMFGU99S6LIu3R`, page **`linkar-site-final`** (`535:37670`), frames named `V2-xx` / `W2-xx`.
Do **not** use the `archive · …` pages (they are the old v1 design). Any difference from Figma is a bug.

Business model in this design (frame «قرارات مطبّقة · 11 أكتوبر» in the Index): the site shows **no time slots and no
visit time**. Booking = services → branch → pay directly → a voucher valid 14 days arrives. **No cancel / reschedule from
the site.** Follow the screens exactly; don't bring back request/respond wording from the old brief.

## Stack
Next.js 16.2 App Router (read `node_modules/next/dist/docs/` for anything non-trivial), React 19, Tailwind 4, TypeScript.
`src/app/(site)/…` = inner pages (light header + footer come from `(site)/layout.tsx`).
`src/app/(home)/page.tsx` = home (transparent header inside the hero).
`src/app/(site)/account/layout.tsx` = account shell (side menu, requires a session).

## Design tokens (src/app/globals.css)
Default Tailwind colors, radii, shadows and font sizes are **disabled**; only Figma tokens exist.
- Colors: brand palette `neon-green #abf907`, `deep-charcoal #152935`, `nature-green #3bb34b`, `solid-black`, `cool-gray #d9dedb`,
  `state-gray #66706b`, `promotional-red #a13434`, `green-active #3a6932`, `green-dark #48863e`, `white`;
  v3: `v3-text-meta #999`, `v3-rating-star`, `v3-card-dark #142224`, `v3-chip-dark`, `v3-text-on-dark #f2f3f2`,
  `v3-card-stroke #b3b3b3`, `v3-box-light #f2f3f2`, `v3-heart-lime`, `v3-text-on-lime`;
  raw-but-repeated: `tile #f4f6f5`, `tint-lime #f4f9e8`, `page-soft #f7f8f7`, `hero-bg`, `hero-ink #0b1712`, `shade`, `whatsapp`, tier colors.
  Semantic (Brand Light, flips to Brand Dark inside `.theme-dark`): `bg-bg-canvas`, `text-text-primary`, `text-text-secondary`,
  `border-border-default`, … (see globals.css).
- Text: `text-display-xl/display-l/h2/h3/h4/h5/body-l/body-m/body-s/label-l/label-m/caption/overline/micro` = Figma `v2/Web/*` styles
  (size + line-height + weight). If Figma uses an unstyled size (e.g. Bold 17 on cards) use `text-[17px] font-bold`.
- Radius: `rounded-xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 · full`. Sizes: `h-control-sm/md/lg/xl` (36/44/52/60), `size-icon-*`.
- Shadows: `shadow-elevation-1/2/3`, `shadow-focus-ring`, `shadow-fab`.
- If a Figma value has no token and repeats, **add a token in globals.css** with a comment (don't scatter hex codes).
  One-off arbitrary values (`h-[30px]`, `w-[760px]`) are fine when they match Figma.

## RTL / i18n
- Arabic is default (RTL). English is LTR and is **our translation** (Figma has Arabic only, except the EN hero 1315:343728).
- Use **logical** utilities only: `ms/me/ps/pe/start/end/text-start/text-end`. Never `ml/mr/pl/pr/left/right` for direction.
- Figma code from `get_design_context` is in LTR absolute coordinates of an RTL design: the **rightmost** element is the
  **first** in DOM order. Rebuild with flex/grid, don't copy absolute positioning.
- Directional icons (chevrons, arrows) get `flip` (`<Icon name="chevron-left" flip />`) so they mirror in LTR.
- Locale on the server: `const locale = await getLocale()` (`@/i18n/locale`). Pick text with `tx(locale, obj, "title")`
  (reads `title_ar` / `title_en`) or `pick(locale, ar, en)`.
- Numbers: `formatPrice(locale, 1399)` → «1,399 ر.س» / «SAR 1,399»; `formatNumber`, `formatDate` in `@/lib/format`.
- **No hardcoded copy in components.** All page content goes in data files with `_ar`/`_en` fields; small shared UI words
  in `src/i18n/dict/common.ts` (`getCommon(locale)`); area-specific UI words in your own `src/i18n/dict/<area>.ts`.
  No English words in the Arabic version and vice versa (labels, placeholders, errors, alt text, metadata).

## Data layer
- Mock data: `src/lib/data/<area>/*.ts`, same shape the Django API will return (`*_ar`/`*_en`, `slug`, image paths).
- Read it through async accessors in `src/lib/server/<area>.ts` (see `src/lib/server/content.ts`). Pages never import
  `lib/data` directly, except for types.
- Shared entities: `services` (5 slugs: `wash ppf tint polish nano-ceramic`) and `providers` (slugs: nukhba, nanoshield, xpel,
  bareeq, 3seven, 3m, golden-wash, crystal, llumar, v-kool, lamaa, autoshabo, johnson, feynlab, nanox) in `src/lib/data/`.
  Read them via `getServices()`, `getProviders()`, `getProvider(slug)`, `getProvidersBySlugs()`.
  Logos: `/figma/logos/<slug>.png` (v-kool is `.jpg`); display size table `logoSize` in providers.ts.
- Session (demo): cookie `linkar_session` = `user` (محمد سالم) or `new` (empty states). `getSession()` from
  `@/lib/server/session`; `signIn(kind, next)` / `signOut()` server actions in `@/app/actions/session`.
- Content values (texts, prices, names, dates, booking numbers) come from Figma **verbatim**. Never invent content.
  If something is missing in Figma, leave a clearly marked placeholder and list it in your report.

## Links
All URLs come from `src/lib/routes.ts` (`routes.provider(slug)`, `routes.bookings("past")`, …). Never type a path by hand.
Every link must resolve (no 404). If a target screen doesn't exist in Figma, link to the closest real page and report it.

## Shared components (reuse, don't re-create)
- `@/components/ui/Button` (`Button`, `ButtonLink`, `buttonClass`: variants primary/dark/light/ghost/outline/glass; sizes lg/md/sm/pill)
- `@/components/ui/Container` (1440 max, 80px gutters desktop, 16px mobile)
- `@/components/ui/PageHeader` (`PageHeader`, `Breadcrumb`): calm page head with lime gradient + breadcrumb + H2 + description
- `@/components/ui/Badges`: `TagPill`, `DarkChip`, `ProviderBadges` (LINKAR certified + tier), `RatingMeta` (★ 4.8 | 1.2 كم | فرعان)
- `@/components/icons/Icon`: `<Icon name="search" size={18} className="text-nature-green" />` (48 UI glyphs, color = currentColor;
  Figma tones: Green=text-nature-green, Neon=text-neon-green, Charcoal=text-deep-charcoal, White=text-white, Gray=text-state-gray,
  Red=text-promotional-red, Orange=text-v3-rating-star) and `<ServiceGlyph name="tint" />` (5 service icons).
  Other Figma icons (`Icon/*` family, brand glyphs) → download them into `public/figma/icons/` and use `<img>`.
- Cards (`@/components/cards/*`): `ProviderCard`, `PickCard`, `OfferCard`, `OfferFeaturedCard`, `ServiceCard`, `ClientLogo`/`LogoArea`,
  `FavoriteButton`, `Countdown`.
- Layout: `Header`, `Footer`, `Fabs` (`@/components/layout/*`), `AccountNav`.
- Reference implementation of a full page: `src/app/(site)/services/` (W2-25).
If a shared component can't express the design, extend it **backwards-compatibly** (new optional prop) — don't fork it.
Only the owner of a file listed in your brief may restructure it.

## Figma workflow (per screen)
1. `get_metadata` / `use_figma` (read-only) on the frame to see its sections. Call `get_design_context` on **sections**
   (not the whole frame: header/footer repeat and waste context; skip `v2 · Web header` and `v2 · Footer` instances).
   Pass `skillNames: "resource:figma-design-to-code"` and the shared `sessionId`.
2. Download every asset the response lists (`curl -fsSL`) into `public/figma/<area>/…` with readable names — never
   reference temporary figma.com URLs. Photos: prefer originals via `download_assets` `rawImages`; check the pixel size is
   ≥ 2× the displayed size (report it if the original is smaller). Use `next/image` with real `width/height` + `sizes`.
3. Build with tokens + shared components, flex/grid layout, interactive where the design implies interaction
   (tabs, dropdowns, modals, toggles, filters, steppers, copy buttons…). Popups listed under «10 · النوافذ المنبثقة»
   that belong to your screens are part of your scope (modal/drawer/toast components in your area folder).
4. Cards next to each other must have equal height: `grid` + `flex flex-col` + `mt-auto` for the footer/button row.
5. Mobile (390): no horizontal overflow, sensible stacking (Figma has desktop only).

## Visual check (mandatory before reporting a screen as done)
Dev server is already running at `http://localhost:3000` (don't start another; **don't run `next build`**).
- Screenshot: `node scripts/shot.mjs <path> .claude/figma-refs/<area>/<code>-1440-ar.png [--locale en] [--width 390] [--session user|new]`
  (prints status, horizontal overflow and console errors).
- Figma render: `get_screenshot` on the frame (maxDimension ~1600–2000) and compare side by side (Read both PNGs):
  texts verbatim, colors, fonts/weights, spacing, alignment, section order, icons/images.
  Fix differences, re-shoot. Check AR 1440, EN 1440, AR 390 for every page.
- `npx tsc --noEmit -p .` and `npx eslint <your files>` must pass.

---

## Pixel-perfect & motion pass (round 2)

Goal: every screen matches its Figma frame **pixel for pixel** at 1440 (AR), with the Figma prototype interactions
and animations. The bar (measured, not eyeballed):
- `heightDelta` = 0 (±2 px) and `mismatchPct` ≤ 3 % for the whole frame, no 400-px band above 5 %.
  What remains must be font anti-aliasing only (red speckles on text edges) — check the `-diff.png`.
- Reference result: W2-25 /services → heightDelta 0, mismatch 2.12 %.

### Measuring
1. Figma reference at **exactly 1440 wide**: `get_screenshot` with `maxDimension` = the frame's longer edge
   (e.g. 9414 for a 1440×9414 frame) → save to `.claude/figma-refs/<area>/fig-<nodeId>.png`.
   **Cache it**: reuse an existing 1440-wide `fig-*.png` instead of calling Figma again (the Figma MCP is rate limited).
   For a modal/popup frame, render the popup node itself and compare against a crop of the open state.
2. Site: `node scripts/shot.mjs <path> .claude/figma-refs/<area>/site-<nodeId>.png [--session user|new]`
   (it scrolls to load lazy images, pins sticky elements and hides the first-visit location modal;
   pass `--first-visit` to keep the modal).
3. `node scripts/diff.mjs fig.png site.png .claude/figma-refs/<area>/<nodeId>` → JSON (mismatch %, height delta,
   worst bands) + `<prefix>-diff.png` (red = different) + `<prefix>-side.png` (site left, Figma right). Read the
   side/diff PNGs (crop the worst band with PIL when needed), fix, repeat until the bar is met.
4. Then re-check EN 1440 and AR 390 (no overflow, sensible) — those have no Figma frame.

### Known Figma→CSS gotchas
- **Gradients with transparent stops** (e.g. `#abf907 @7% → white`): Figma interpolates colour and alpha separately
  (non-premultiplied), CSS doesn't — the middle comes out lighter in CSS. Compute the composited colour at 0/25/50/75/100 %
  and use opaque stops (see `bg-pagehead` in globals.css).
- **Invisible elements still take space** (e.g. transparent chevrons in the light header nav). Inspect with read-only
  `use_figma` (visible, opacity, fills) before deleting something that "isn't there".
- Text: use the exact Figma line-height (`leading-[…]`), `whitespace-nowrap` where Figma has fixed single lines,
  and Figma's paragraph widths (`max-w-[760px]`) so line breaks land on the same words.
- Images: same crop as Figma (`object-cover` + `object-position` from the image fill transform).

### Motion (from the Figma prototype — implement all of it)
Inventory of `linkar-site-final`: DISSOLVE 200 ms / 150 ms EASE_OUT (navigation + 149 overlays),
SMART_ANIMATE 200 ms EASE_OUT (component variant changes: FAQ accordion, tabs, toggles…),
SCROLL_ANIMATE 400–600 ms (scroll-to links, carousels prev/next), AFTER_TIMEOUT 2 s (P-10 toasts auto-close),
plus **keyframe animations** (9 s loops on Home: floating phones, popping chips, pulsing tags…).
- Get them per frame: `get_motion_context` (recursive: true) on each frame/section/component you own — it returns
  ready `motion.dev` snippets. Use the `motion` package: `import { motion } from "motion/react"` in client components.
  Keep the exact durations, `times`, easing arrays and `repeat: Infinity`.
- Prototype reactions per node: read-only `use_figma` → `node.reactions` (trigger ON_CLICK / ON_HOVER / AFTER_TIMEOUT,
  action NAVIGATE / OVERLAY / CHANGE_TO / SCROLL_TO / CLOSE, transition type + duration + easing).
- Tokens in globals.css: `ease-figma-out` / `ease-figma-in` / `ease-figma-in-out`, `animate-dissolve` (200 ms),
  `animate-dissolve-fast` (150 ms), `animate-dissolve-out`. Overlays/modals/menus/toasts: fade in with
  `animate-dissolve` (overlay backdrop too). Variant changes: `transition-[…] duration-200 ease-figma-out`
  or motion `layout` / `AnimatePresence`. Toasts: auto-close after 2000 ms.
- Page navigation already cross-fades 200 ms (React `<ViewTransition>` in the layouts, `experimental.viewTransition`).
- Hover / pressed / focus: check the component sets for `State=Hover/Pressed/Focus` variants and implement them
  (Button: hover = bg/brand-hover, pressed = bg/brand-pressed, focus = Focus/Ring).
- Respect `prefers-reduced-motion` (global rule already in globals.css; motion's `useReducedMotion` for JS loops).

### Playwright MCP (shared browser — take the lock)
There is ONE Playwright MCP browser shared by all agents. Before using any `mcp__playwright__*` tool:
`node scripts/mcp-lock.mjs acquire <your-area>` (waits until free) → do a short batch (navigate, set cookies with
`browser_evaluate` → `document.cookie="locale=ar; path=/"` / `linkar_session=user`, then reload; click triggers, hover,
take screenshots of interaction/animation states, read console) → `node scripts/mcp-lock.mjs release <your-area>`.
Keep each batch under ~4 minutes. Use the MCP for **interactions and animations** (open menus/modals, hover,
mid-animation captures, console errors); use `scripts/shot.mjs` for the full-page pixel diffs.
