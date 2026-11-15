# Linkar control panel

A standalone Next.js 16 app inside the website repository (`admin/`), used by the Linkar team to run the platform: providers, branches, requests, bookings, customers, invoices and payments, provider dues, agencies and marketers, quality, messages, reference data and settings. The UI is Arabic (RTL).

- **Design:** Figma file `Jg1QS1kTQMFGU99S6LIu3R`, page `linkar-control-panel v3` (every screen component has its frame code in a comment, e.g. `// CON5-04 · الحجوزات (3114:33571)`).
- **Spec:** "Linkar - Frontend guide" (phase 1 screens: auth, users & roles, providers, branches); phase 2 screens follow the Figma file.

## Run locally

```bash
cd admin
npm install
npm run dev -- -p 3200       # http://localhost:3200
npm run build && npm start   # production build
```

## Demo login (until the backend exists)

- Email: any address ending in `@linkar.sa` or `@linkarksa.com`
- Password: any 8+ characters
- Verification code: any 6 digits (`000000` shows the error state)

After login the panel opens on `/overview`.

## Structure

| Path | Contents |
|---|---|
| `src/app/(auth)` | Login, two-step verification, password recovery and reset |
| `src/app/(panel)` | Panel shell (sidebar + top bar) and every section, one folder per route (`overview`, `requests`, `bookings`, `customers`, `providers`, `branches`, `partners`, `invoices`, `payments`, `dues`, `field-evaluation`, `reviews`, `messages`, `reference`, `settings`, `system`, …) |
| `src/components/ui` | Base components (Button, Field, Modal, Drawer, Toast, Select, …) |
| `src/components/panel` | Shared panel pieces (Sidebar, Topbar, DataTable, Tabs, FilterBar, shared modals, notifications) |
| `src/lib/api` | **API layer** — one file per area, currently returning demo data in the same shape as the future REST API |
| `src/proxy.ts` | Route protection (no session → `/login`) — Next.js 16 calls middleware "proxy" |

## Connecting the backend

Every screen gets its data through `src/lib/api/*` (registered in `src/lib/api/index.ts`) via TanStack Query. Each function is async and returns REST-like shapes — list endpoints take paging/search/sort/filters and return `{ items, total, counts }`. To connect the real API, replace the body of each function with a `fetch` to the backend (base URL from `NEXT_PUBLIC_API_URL`); screens don't need to change.

- Auth is demo-only in `src/app/api/auth/{login,verify,logout}/route.ts` (cookies `linkar_admin_session`, `linkar_admin_pending`).
- Sensitive actions return HTTP 428 to trigger the OTP modal (`useSensitive`); permissions are checked with `useCan(module, action)`.
- Demo data lives in browser memory, so it resets on a full page reload.

## Deployment

Deployed with the `admin` service in the root `docker-compose.yml` (host port `ADMIN_PORT`, default 3001), behind a reverse proxy (planned domain: `admin.linkarksa.com`). See the root [README](../README.md#deploying-to-a-server-docker).
