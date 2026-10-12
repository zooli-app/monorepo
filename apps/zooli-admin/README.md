# Zooli Admin Panel
### Veera Smart Services India Pvt Ltd

A production-ready Next.js 15 admin panel for the Zooli super-app platform.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend (next step) | FastAPI |
| Mobile App (next step) | Flutter |

---

## Project Structure

```
zooli-admin/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx         # Dashboard shell (sidebar + topbar)
│   │   ├── dashboard/         # Main overview
│   │   ├── orders/            # Order management
│   │   ├── vendors/           # Vendor management
│   │   ├── users/             # User management
│   │   ├── services/          # Service categories
│   │   ├── rides/             # Live rides tracking
│   │   ├── offers/            # Coupons & promotions
│   │   ├── payments/          # Transactions & payouts
│   │   ├── analytics/         # Reports & insights
│   │   └── settings/          # Platform configuration
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   └── Topbar.tsx         # Top header bar
│   ├── dashboard/
│   │   ├── OrdersChart.tsx    # Bar chart
│   │   ├── RevenueChart.tsx   # Area chart
│   │   └── StatusDonut.tsx    # Donut chart
│   └── shared/
│       ├── MetricCard.tsx     # KPI card component
│       ├── PageHeader.tsx     # Page title + SectionCard
│       └── StatusBadge.tsx    # Status pills
├── lib/
│   ├── types.ts               # All TypeScript types
│   ├── utils.ts               # Formatters + status configs
│   └── mock-data.ts           # Mock data (replace with API)
├── tailwind.config.ts
├── next.config.ts
└── tsconfig.json
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/dashboard`.

**Demo credentials:** `admin@zooli.in` / `admin123`

---

## Connecting to FastAPI Backend

Replace mock data calls with API calls. Example:

```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getOrders(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${API_BASE}/orders${qs}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}
```

Set in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Services Covered

| # | Service | Description |
|---|---------|-------------|
| 1 | 🍔 Food & Beverages | Restaurant orders |
| 2 | 🥦 Vegetables & Grocery | Grocery delivery |
| 3 | 🚗 Rides | Car / Auto / Bike booking |
| 4 | 🔧 Home Services | Plumber, electrician, etc. |
| 5 | 🚛 House Shifting | Packers & movers |
| 6 | 📦 Parcel (Local) | Local delivery |
| 7 | 🎓 Tuition Point | Home tutors |
| 8 | 🏨 Hotel & Function Halls | Venue booking |
| 9 | 🏖️ Resorts & Tourist | Resort packages |

---

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Purple (primary) | `#6D28D9` | Sidebar, buttons, links |
| Yellow (accent) | `#F59E0B` | Badges, highlights |
| Dark Purple | `#130D2E` | Sidebar background |
| Content bg | `#F4F2FB` | Page background |

---

## Next Steps

1. **FastAPI Backend** — Auth, CRUD APIs for all 9 services
2. **Vendor Panel** — Separate Next.js app for vendors
3. **Flutter App** — Customer-facing mobile app
4. **Real-time** — WebSockets for live order/ride tracking
5. **Maps** — Google Maps integration for rides page
