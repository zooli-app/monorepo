# Zooli monorepo

One repo, four independently-deployable projects — each is its own Next.js
app (own `package.json`, own `node_modules`, own Vercel project), sharing
code only through the two `packages/*` below. This is what lets user,
admin, vendor, and backend each grow and deploy on their own schedule
without stepping on each other.

## Layout
```
zooli/
├── apps/
│   ├── zooli-web/      user-facing app         (port 3000)
│   ├── zooli-vendor/   vendor dashboard         (port 3001)
│   ├── zooli-admin/    admin panel              (port 3003)
│   ├── api/            backend (Node/Next.js route handlers)  (port 3002)
│   └── mobile/         Expo app (user-facing, iOS/Android)
├── packages/
│   └── zooli-tokens/   shared brand palette — the ONLY thing all four
│                       apps have in common; edit colors here, not per-app
└── package.json        npm workspaces root — ties the above together
```
- `apps/zooli-web`, `apps/zooli-vendor`, `apps/zooli-admin` — three separate
  Next.js frontends, one per audience, all on the unified violet/gold palette.
- `apps/api` — the one backend: Supabase (Postgres/Auth) + Upstash Redis
  (caching) + Cloudinary (image uploads). All three frontends will call this
  same API — nobody talks to Supabase directly except this app.
- `packages/zooli-tokens` — shared design tokens (also feeds the future Expo
  mobile app via `theme.native.ts`).

## Backend: groceries vertical (built first, per your sequencing)
Schema + RLS: `apps/api/supabase/migrations/000{1,2,3}_*.sql`
- **profiles** (role: customer/vendor/admin), **stores**, **categories**,
  **products**, **addresses**, **carts**/**cart_items**, **orders**/**order_items**
- RLS: customers see/edit only their own cart, addresses, and orders; vendors
  manage only their own store's products and see orders placed against it;
  admin/service-role bypasses RLS entirely.

Endpoints (`apps/api/app/api/**/route.ts`):
| Route | Method | Who | Does |
|---|---|---|---|
| `/api/categories` | GET | public | list categories (Redis-cached 5 min) |
| `/api/stores` | GET | public | list open stores by category (Redis-cached 1 min) |
| `/api/stores/:id/products` | GET | public | list a store's available products |
| `/api/stores/:id/products` | POST | vendor/admin | add a product to your own store |
| `/api/cart` | GET/POST | customer | view / add-to cart (one cart per store) |
| `/api/cart/item` | DELETE | customer | remove a line item |
| `/api/orders` | GET | customer/vendor | order history |
| `/api/orders` | POST | customer | checkout: cart → order, decrements stock, empties cart |
| `/api/upload` | POST | vendor/admin | signed Cloudinary params for direct-to-cloud image upload |

## Backend: ride vertical (built second)
Schema + RLS: `apps/api/supabase/migrations/000{4,5}_*.sql`
- **drivers** (1:1 with a `driver`-role profile — vehicle type/number, license,
  online flag, rolling rating), **ride_fare_rules** (base/per-km/per-min rate
  per vehicle type, seeded for bike/auto/sedan/suv), **rides** (pickup/drop,
  status lifecycle, fare estimate + final, timestamps for every stage).
- **Live driver location lives in Redis, not Postgres** — a Redis GEO set per
  vehicle type (`lib/geo.ts`), refreshed by a driver heartbeat and expiring
  after 30s of silence. Matching ("find nearby drivers") is a single Redis
  command instead of a Postgres scan; a driver is pulled out of the pool the
  instant they accept a ride so they can't be double-booked.
- Double-accept race is closed at the DB level: the accept endpoint's
  `UPDATE ... WHERE status='searching' AND driver_id IS NULL` only ever lets
  one concurrent request succeed.

Endpoints:
| Route | Method | Who | Does |
|---|---|---|---|
| `/api/drivers/status` | POST | driver | go online (+ location heartbeat) / offline |
| `/api/rides` | GET | customer/driver | the caller's own ride history |
| `/api/rides` | POST | customer | request a ride — computes fare estimate, creates it `searching`, finds nearby drivers |
| `/api/rides/:id` | GET | party to the ride | poll status + driver's live location (from Redis) |
| `/api/rides/:id/accept` | POST | driver | atomically claim a searching ride |
| `/api/rides/:id/status` | POST | driver or customer (rules vary) | move through `arrived → in_progress → completed`, or `cancelled` |

## Backend: food-delivery vertical (built third — reuses groceries, not parallel tables)
Schema: `apps/api/supabase/migrations/000{6,7}_*.sql`. Deliberately does **not**
introduce a second set of store/product/cart/order tables — a restaurant is
just a `store` with `category = 'restaurant'`, a menu item is just a
`product`, and a food order is the same `orders` row groceries uses. The
migration only adds what food actually needs beyond that: a `driver_id` on
`orders`, a `ready_for_pickup` status between `preparing` and
`out_for_delivery`, and per-stage timestamps.

Delivery assignment is **pull-based**, unlike ride matching's push-based
model: a ride finds nearby drivers and offers it to them; a delivery instead
becomes visible in every nearby online driver's feed once the vendor marks
it `ready_for_pickup`, and whichever driver claims it first gets it — same
atomic `UPDATE ... WHERE driver_id IS NULL` guard as ride accept.

Endpoints:
| Route | Method | Who | Does |
|---|---|---|---|
| `/api/orders/:id/status` | POST | vendor/driver/customer (rules vary) | `pending → confirmed → preparing → ready_for_pickup`, `out_for_delivery → delivered`, or `cancelled` |
| `/api/deliveries/available` | GET | driver | nearby unclaimed `ready_for_pickup` orders, nearest first (needs a location heartbeat first) |
| `/api/orders/:id/claim` | POST | driver | atomically claim a ready order for delivery |

`/api/orders` (POST) and `/api/cart` are already generic enough to place a
food order exactly like a groceries one — no new create-order endpoint
needed.

### Setup
```bash
cd apps/api
cp .env.example .env.local   # fill in Supabase / Upstash / Cloudinary keys
# In the Supabase SQL editor, run all migration files in order (0001 through 0009).
npm install
npm run dev                  # http://localhost:3002
```

### Deploy to Vercel

All four apps (web, vendor, admin, api) deploy as **separate Vercel
projects from the same Git repo** — Vercel's monorepo detection reads the
root `package.json`'s `workspaces` field and installs from the repo root
automatically, as long as you don't override the install/build command
yourself (each app's `vercel.json`, where present, deliberately avoids
that).

1. Push this whole repo to one GitHub/GitLab/Bitbucket repo.
2. In Vercel, "New Project" → import that repo → set **Root Directory** to
   `apps/api`. Repeat 3 more times for `apps/zooli-web`, `apps/zooli-vendor`,
   `apps/zooli-admin`. Framework auto-detects as Next.js every time.
3. Deploy `apps/api` first and note its URL. Add every var from
   `apps/api/.env.example` in that project's Environment Variables, **plus**
   `ALLOWED_ORIGINS` (comma-separated list of your three frontend URLs —
   the CORS middleware only allows `localhost` by default; production
   origins must be listed explicitly).
4. In each of the 3 frontend projects, set `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_API_URL` — the last one
   pointing at the real deployed api URL from step 3, not localhost. These
   are baked in at build time, so redeploy after setting them.
5. Once all four have real URLs, go back and update `ALLOWED_ORIGINS` on the
   api project with the actual frontend URLs (they didn't exist yet in step
   3), then redeploy just that project.

The mobile app doesn't deploy to Vercel — it ships via Expo/EAS Build to the
App Store / Play Store, or is run ad-hoc through Expo Go during development.

## Design system
`packages/zooli-tokens` — violet + gold + maroon brand palette, generated
into full 50–900 Tailwind ramps, exported as a Tailwind preset (used by
zooli-vendor), raw CSS variables (used by zooli-web), and a plain JS object
for React Native (`theme.native.ts`) — ready for the Expo app.

## Run everything

**All four apps now share one npm workspace and one `node_modules`.**
`zooli-web` used to be excluded (it ran Next 14/React 18 while the rest ran
Next 16/React 19 — mixing them broke the build), but it's since been
upgraded to match: Next 16, React 19, and `params` in dynamic routes
converted to the async/Promise convention Next 15+ requires. It also picked
up `@zooli/tokens`'s and `@zooli/api-client`'s workspace linking (`"*"`
instead of the old `file:../../packages/...` path it needed when it lived
outside the workspace).

**One-time setup — one install:**
```bash
npm install    # from the repo ROOT — links all 4 apps + both shared packages together
```
If you ever see a stale-version error after changing a package's dependency
range, delete `package-lock.json` and every `node_modules` folder before
reinstalling — a stale lockfile pinning an old resolution is what caused
this exact class of bug during development (silently nesting a second copy
of `next` for one app instead of sharing the hoisted one).

**Run each app** (separate terminal tabs, or the shortcuts below):
```bash
npm run dev:web       # zooli-web    → http://localhost:3000
npm run dev:vendor    # zooli-vendor → http://localhost:3001
npm run dev:admin     # zooli-admin  → http://localhost:3003
npm run dev:api       # api          → http://localhost:3002
```
Before running the API, copy `apps/api/.env.example` to `apps/api/.env.local`
and fill in real Supabase/Upstash/Cloudinary keys — see the "Setup" section
above. The three frontends still run on mock data until they're pointed at
`http://localhost:3002`.

## How to check it worked
- **Colors**: open all three frontends side by side — nav bars, buttons, and
  status badges should all read as the same violet/gold family, not the
  mismatched purple/amber each app started with.
- **Builds**: `npm run build -w zooli-web`, `-w zooli-vendor`, `-w zooli-admin`,
  `-w zooli-api` — each should finish with a route list and no red errors.
  This is the fastest way to catch a broken import or type error before
  it reaches a real deploy.
- **API**: with `.env.local` filled in and all 9 SQL migrations run in
  Supabase, `curl http://localhost:3002/api/categories` should return
  `{"categories": [...]}"` instead of an error. For the ride vertical,
  `curl http://localhost:3002/api/rides` with a valid Supabase JWT should
  return `{"rides": [...]}` — full ride creation/accept needs a real driver
  + customer account, since fare calc and matching both hit Postgres + Redis.

## Roadmap
1. ✅ Unified color scheme across web, vendor, and admin
2. ✅ Backend, groceries vertical end-to-end (schema, RLS, cart→checkout, image upload)
3. ✅ Backend, ride vertical end-to-end (schema, RLS, Redis-based live matching, fare calc, status lifecycle)
4. ✅ Backend, food-delivery vertical end-to-end (reused groceries' store/product/cart/order tables, added delivery assignment + prep-status lifecycle)
5. ✅ All 3 frontends + mobile connected to the real API with real data
6. ✅ Mobile app (Expo) — auth, browsing, cart, checkout, ride booking/tracking

## Reviews, vendor business fields, and wallets (now real, not demo data)

Three previously-mock-only features got real tables (`0008`/`0009_*.sql`):

- **Reviews & ratings** — a customer can review a `delivered` order exactly
  once (`POST /api/orders/:id/review`); the store's `rating_avg`/
  `rating_count` recompute automatically. Public read via
  `GET /api/stores/:id/reviews`; vendor's own via `GET /api/vendor/reviews`.
  Wired into: the web account page (rate a delivered order), the vendor
  dashboard's rating KPI + "Latest Reviews", and a rebuilt vendor `/reviews`
  page. The mock version's sentiment analysis and vendor-reply threads had
  no backend to support them and were dropped rather than faked.
- **Per-vendor GSTIN / zone / commission** — all three now live on `stores`.
  GSTIN and zone are vendor-editable (`PATCH /api/vendor/store`, wired into
  vendor Settings → Business Details). Commission is deliberately **not**
  vendor-editable — only `PATCH /api/admin/stores/:id` can change it — wired
  into both the admin Vendors detail panel and a rebuilt admin
  `/payments/commission` page (previously a "coming in next sprint" stub).
- **Wallet balances** — every user gets a `wallets` row, credited
  automatically with 2% cashback when an order is delivered or a ride
  completes (`apps/api/lib/wallet.ts`, called from both status-transition
  routes — there's no manual "add money" or top-up flow). Wired into the
  web account page's existing Wallet tab, and a rebuilt admin
  `/payments/wallet` page (also previously a stub) showing every user's
  balance platform-wide.

## Connecting the frontends to real data (what changed)

**`packages/zooli-api-client`** is now the single client every app (web,
vendor, admin, mobile) uses to talk to the backend — one typed function per
endpoint, plus Supabase auth helpers. Each app supplies its own Supabase
client (web/vendor/admin persist sessions to localStorage; mobile persists
to AsyncStorage) and hands it to `createApiClient` via `getAccessToken`.

**New backend endpoints**, added because the frontends needed them and they
didn't exist yet:
- `/api/addresses` — checkout needs a saved delivery address; nothing
  created one before.
- `/api/admin/{stats,stores,orders,users}` + `PATCH /api/admin/stores/:id` —
  admin's dashboard/vendors/orders/users pages needed a way to see
  platform-wide data and approve/suspend a store.
- `/api/vendor/{store,products,orders}` — vendor's own store setup, full
  inventory management (including out-of-stock items the public endpoint
  hides), and an orders view enriched with customer contact info. That last
  one deliberately uses the service-role client: plain RLS only lets a user
  read their own `profiles`/`addresses` row, so a vendor legitimately
  fulfilling an order can't get the customer's name/phone through the
  RLS-scoped client — application code re-imposes the "only your own
  store's orders" boundary instead.
- **CORS middleware** on the API — the three frontends run on different
  ports/origins than the backend, so responses need CORS headers or the
  browser blocks them before any route handler code runs.

**zooli-vendor / zooli-admin**: real Supabase auth replaces the old fake
localStorage tokens; every page listed in the endpoint tables above pulls
real data. A few UI fields have no backing table yet (reviews/ratings,
per-vendor GSTIN/zone/commission, wallet balances) — those stay on clearly
labeled demo data rather than fabricating persistence that doesn't exist.
Admin's "Add Vendor" form is local-only for the same reason: there's no
admin-side vendor-creation endpoint, since vendors self-onboard through
their own app.

**zooli-web**: the old app had no way to actually browse a store's products
— category pages only ever listed vendors, with nowhere to click through to
an actual menu. `/services/[slug]/[storeId]` is new, and is what makes a
real add-to-cart → checkout loop possible. `/cart` and `/account` were
server components that couldn't read the browser-only Supabase session, so
both are now client components. `/services/[slug]` switched from
build-time static generation to per-request rendering (`force-dynamic`) —
correct for live inventory regardless, and also necessary since static
generation would otherwise require the backend to be reachable during
`next build`. Only grocery and food browsing are real; the other 7 category
verticals (rides aside — see mobile) have no backend yet and stay on mock
listings.

**apps/mobile** (new): an Expo Router app sharing `@zooli/api-client` with
the web apps. Covers sign in/up, browsing groceries/food stores and their
products, cart with real checkout, order history, and ride booking +
live-polling trip tracking. Ride booking currently takes pickup/drop as
typed coordinates rather than a map picker — the obvious next enhancement.
`npx tsc --noEmit` passes clean; a full native build needs Xcode/Android
SDK this environment doesn't have, so that's unverified beyond type-checking.

### Setup — mobile
```bash
cd apps/mobile
cp .env.example .env.local   # fill in Supabase URL/anon key + your API URL
npm install
npm start                     # opens Expo Dev Tools — press i/a for iOS/Android sim, or scan the QR with Expo Go
```

---

## Vendor registration forms

Prospective vendors register from the vendor portal **before** they have a login:

- `/register` — chooser for the 8 services (food, rides, home services, house shifting, parcel, tuition, hotels & function halls, resorts & tourist).
- `/register/<service>` — the service's form (matches the design PDFs). Supports file upload to Cloudinary, map preview + geolocation (food), live validation, **Save & Continue Later** (draft kept in the browser's localStorage on that device), a review screen, and a reference number on success (`ZV-YYMM-XXXXXX`).
- Admin → **Vendor Applications** (`/applications`) lists submissions, filters by status/service, opens every answer and uploaded document, and lets an admin mark *under review / needs info / approved / rejected* with internal notes.

### How it's built

| Piece | Where |
|---|---|
| Form definitions + validation (single source of truth) | `packages/zooli-vendor-forms` |
| Public submit + signed-upload routes (rate-limited via Upstash) | `apps/api/app/api/vendor-applications/` |
| Admin list / detail / review routes | `apps/api/app/api/admin/applications/` |
| Table `vendor_applications` (RLS on, no policies → service-role only) | `apps/api/supabase/migrations/0010_vendor_applications.sql` |
| Form UI | `apps/zooli-vendor/components/register/` |
| Admin review UI | `apps/zooli-admin/app/(dashboard)/applications/` |

The server re-validates every submission with the same rules the browser uses and only accepts uploaded-file URLs from your own Cloudinary account, so requests can't skip fields or smuggle in links.

**To change a form**, edit its file in `packages/zooli-vendor-forms/src/forms/` (dropdown lists live in `src/options.ts`). The UI, server validation and admin view all update together.

### Setup after pulling this change

1. `npm install` (registers the new `@zooli/vendor-forms` workspace and updates the lockfile).
2. Run **both** migrations in Supabase: `0010_vendor_applications.sql` and `0011_applications_security.sql`.
3. Fill the new block at the bottom of `apps/api/.env.example` into `apps/api/.env.local` (see below). Two values are **mandatory in production**: `APPLY_SESSION_SECRET` and `DATA_ENCRYPTION_KEY`.
4. Make sure the vendor portal's origin is allowed by the API's CORS list (`ALLOWED_ORIGINS` in production).

### Security model

| Concern | What happens |
|---|---|
| **Documents are private** | Uploaded with Cloudinary `type=authenticated` — a copied link does not open. Admins get a fresh **15-minute signed link** each time they open an application. |
| **Upload rules enforced by the server** | Signed upload restricts formats to jpg/png/pdf at Cloudinary; on submit the API re-checks every file (exists, private, ≤ 8 MB, allowed format) and deletes offenders. File ids must be under `zooli/applications/`. |
| **Sensitive numbers** | Aadhaar, PAN, bank account and driving-licence numbers are **AES-256-GCM encrypted** before they reach the database. Admins see `XXXXXXXX0123`; **Reveal** decrypts one value and is **audit-logged** (`application_audit_log`, as are opens and status changes). `AADHAAR_STORAGE=masked_only` stores only the last 4 Aadhaar digits (nothing to reveal). Drafts in the applicant's browser never contain these fields and expire after 7 days. |
| **Bots** | A captcha (Cloudflare Turnstile) yields a 1-hour signed session that uploads, OTP and submit all require. Rate limits per IP / mobile fall back to per-instance memory if Redis is down. |
| **Approval** | *Approve* creates the Supabase login + profile (+ a store, closed until the vendor opens it), links them to the application, then sends the credentials. Food / home / shifting / hotel / resort / tuition → `vendor` + store; rides / parcel → `driver`, no store. Everything is rolled back if any step fails. |

### Mock ⇄ live switches (`apps/api/.env.local`)

Nothing needs an account while the switch says `mock`; flip a word to go live — no code change.

| Setting | `mock` | `live` |
|---|---|---|
| `OTP_MODE` | OTP is always `OTP_MOCK_CODE` (default `123456`), nothing is sent | real SMS through `SMS_PROVIDER` |
| `OTP_REQUIRED` | `false` (now): applicants aren't asked for an OTP | `true`: they must verify their mobile before submitting (works with either OTP mode) |
| `SMS_MODE` | status / credentials SMS are printed in the API console | sent via `SMS_PROVIDER` (`msg91` or `twilio`) |
| `EMAIL_MODE` | printed in the API console | sent via Resend |
| `CAPTCHA_MODE` | a "(dev mode)" button | Turnstile widget (`TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`) |

**To switch on mobile OTP later:** set `SMS_PROVIDER` + its credentials, then `OTP_MODE=live` and `OTP_REQUIRED=true`. For MSG91 you must have DLT-approved templates whose placeholders are named `var1`, `var2`, … (`MSG91_TEMPLATE_OTP`: var1 = code; `_STATUS`: var1 = reference, var2 = message; `_CREDENTIALS`: var1 = reference, var2 = email, var3 = temporary password).

> ⚠ With `OTP_MODE=mock` **anyone can pass the OTP check** (the code is public). That is fine while `OTP_REQUIRED=false`, but do not rely on it as verification.

### Production checklist

- Set `APPLY_SESSION_SECRET` and `DATA_ENCRYPTION_KEY` (generate with the command in `.env.example`) and **back the key up** — encrypted values are unrecoverable without it.
- Set `CAPTCHA_MODE=live` with Turnstile keys.
- In Cloudinary: new accounts block delivery of PDF/ZIP files by default (Settings → Security). Signed admin links normally work regardless — test one PDF.
- Restrict Supabase dashboard access; the audit log only records actions made through the admin app.
- Collecting Aadhaar is regulated (Aadhaar Act, DPDP Act). Have a lawyer confirm your consent text, purpose, retention period and whether `AADHAAR_STORAGE=masked_only` is the safer choice for you.
- The temporary password is sent by SMS/email; vendors should change it on first login (the portal has no forced-change flow yet).
- Live SMS/email providers are implemented but **not tested against real accounts** — send yourself a test first.

### Notes / not included yet

- There is no Grocery registration form yet (no design was supplied).
- Document links open in a new tab and expire after 15 minutes; reopen the application panel for fresh ones.
- Applicants can't re-open a submitted application; admin "Needs more info" currently tells them to contact support rather than letting them edit.

### Admin dashboard data

Every admin page now shows live data (no sample numbers). Dashboard, Analytics, Payments, Ride and Delivery pages read from `GET /api/admin/{stats,analytics,orders,rides,drivers,transactions,wallets}`. "Revenue" means order totals excluding cancelled orders. Where the platform has no data source yet (coupons, vendor payout batches, NPS / app rating / delivery time / retention) the page says so instead of showing placeholder figures. If an admin page can't reach the API it shows the real error, including a hint to check `NEXT_PUBLIC_API_URL`.
