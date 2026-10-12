# Zooli — Web (Desktop)

Production-grade Next.js (App Router + TypeScript) implementation of the Zooli
home page, built for desktop. No UI kit (no shadcn) — every component is
hand-built with CSS Modules so it's easy to restyle or rewire without fighting
someone else's class names.

## Stack

- Next.js 14 (App Router), TypeScript, React 18
- CSS Modules + a small CSS-variable design-token system (`src/app/globals.css`)
- `next/font` for self-hosted Google Fonts (Baloo 2 for display, Manrope for body)
- No component library, no Tailwind — plain, portable CSS

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
  app/
    layout.tsx        Root layout, font + metadata setup
    page.tsx           Home page — fetches data via lib/api and composes sections
    globals.css         Design tokens (colors, type scale, spacing, shadows)
  components/
    layout/             Header, Footer — page chrome
    home/                Hero, CategoryGrid, OffersSection, RideBooking
    ui/                  SearchBar, IconBadgeButton, SpokeDivider — shared primitives
    icons/               Hand-drawn icon set (CategoryIcon, UtilityIcons)
  lib/
    types.ts             Domain types — the contract between UI and API
    api/                 One file per resource (home.ts, client.ts)
    data/                Mock data used until the real API is wired up
```

## Connecting the real API

Every data-fetching function lives in `src/lib/api/` and already returns the
exact shape components expect (see `src/lib/types.ts`). To go live:

1. Set `NEXT_PUBLIC_API_BASE_URL` to your backend's base URL.
2. Set `NEXT_PUBLIC_USE_MOCKS=false`.
3. Implement the matching endpoint(s) — `getHomePageData()` in
   `src/lib/api/home.ts` currently expects `GET /v1/home` to return a
   `HomePageData` object. Split it into multiple endpoints later if needed;
   only `src/lib/api/home.ts` has to change, not any component.

No component imports mock data directly — they only ever receive props or
call functions in `src/lib/api`, so this is a one-file swap per resource.

## Notes for the next contributor

- All icons are inline SVG components (`src/components/icons`) using
  `currentColor`, so recoloring is a CSS change, not an asset swap.
- The header's lower nav strip and the home category grid both read from the
  same `categories` array — add/remove a service in one place
  (`src/lib/data/mock-categories.ts`, later the API) and both update.
- The wheel motif (`src/components/ui/SpokeDivider`,
  `src/components/home/Hero/WheelGraphic.tsx`) is the page's signature visual,
  taken directly from the bicycle wheel in the Zooli mark — reuse it for new
  section dividers rather than introducing a new motif.
