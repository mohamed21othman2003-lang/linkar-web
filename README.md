# Linkar — website + control panel (frontend)

Linkar is a Saudi platform that connects car owners with car-care providers: customers compare, book, pay and track services.

This repository contains **two independent Next.js 16 apps**:

| App | Folder | What it is | Docker service | Default port |
|---|---|---|---|---|
| Customer website | `/` (repo root) | Public site — Arabic (default) + English | `web` | 3000 |
| Control panel | `admin/` | Internal dashboard for the Linkar team (Arabic, RTL) | `admin` | 3001 |

> **Frontend only.** Both apps currently run on **demo data built into the code** — there is no backend, database or real payment yet. The panel's data layer (`admin/src/lib/api/`) is shaped like the future REST API, so connecting the backend means replacing those function bodies only.

---

## Deploying to a server (Docker)

Requirements: Docker Engine with the Compose plugin. Nothing else (Node is inside the images).

```bash
git clone https://github.com/Oofoq/linkar-web.git
cd linkar-web
cp .env.example .env          # then edit the values (see below)
docker compose up -d --build  # builds and starts both apps
```

Useful commands:

```bash
docker compose ps                 # status + health
docker compose logs -f web        # website logs   (use "admin" for the panel)
docker compose up -d --build      # redeploy after git pull
docker compose down               # stop (the image cache volume is kept)
```

### Environment variables (`.env`)

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://linkar-web.vercel.app` | Final public URL of the website. Baked in **at build time** (sitemap.xml, robots.txt) — rebuild with `--build` after changing it. |
| `WEB_PORT` | `3000` | Host port for the website. |
| `ADMIN_PORT` | `3001` | Host port for the control panel. |
| `BIND_ADDR` | `127.0.0.1` | `127.0.0.1` = reachable only through a reverse proxy on the same machine (recommended). `0.0.0.0` = exposed directly. |
| `ADMIN_API_URL` | *(empty)* | Backend API base URL for the panel, once it exists (also baked in at build time). Empty = demo data. |
| `ADMIN_BASE_PATH` | *(empty)* | Serve the panel under a path of the website's domain, e.g. `/admin` → `https://linkar.ido.sa/admin` (nginx then proxies `/admin/` to the panel without rewriting). Empty = the panel has its own subdomain. Baked in at build time. |

Never commit `.env` (it is git-ignored).

### Reverse proxy (nginx example)

Both containers listen on loopback by default; put nginx (or any proxy) in front and terminate TLS there.

```nginx
server {
    server_name linkarksa.com www.linkarksa.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    server_name admin.linkarksa.com;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

(The domains above are placeholders until the final domains are confirmed.)

### Image details

- Multi-stage build on `node:22-alpine`, Next.js `output: "standalone"`, runs as a non-root user.
- Health checks: website → `/robots.txt`, panel → `/login`.
- The website keeps optimized images in the `next_image_cache` volume between deploys.
- The build needs outbound internet access (npm packages, and the control panel downloads its Arabic font from Google Fonts at build time).

---

## Demo logins

**Website**

| Case | Credentials |
|---|---|
| Existing customer (phone) | `0551234567`, verification code `1234` |
| Existing customer (email) | `mohammed.salem@example.com`, any password |
| New customer (first login) | any other Saudi mobile number, code `1234` — invite code `SARA4K` |

**Control panel**

| Field | Value |
|---|---|
| Email | any address ending in `@linkar.sa` or `@linkarksa.com` |
| Password | any 8+ characters |
| Verification code | any 6 digits (except `000000`, which shows the error state) |

---

## Local development

```bash
# website
npm install
npm run dev                  # http://localhost:3000

# control panel
cd admin
npm install
npm run dev -- -p 3200       # http://localhost:3200
```

Production build locally: `npm run build && npm start` in either folder.

## Live previews (Vercel)

- Website: https://linkar-web.vercel.app
- Control panel: https://linkar-panel.vercel.app

## For developers

- Next.js 16 (App Router) + Tailwind 4. This Next.js version has breaking changes — read [AGENTS.md](AGENTS.md) before writing code.
- Website code conventions, design tokens and design-matching rules: [docs/frontend-conventions.md](docs/frontend-conventions.md).
- Control panel structure and API layer: [admin/README.md](admin/README.md).
- Figma assets exported for the website live in `public/figma/`.
- Design references: website = Figma page `linkar-site-final` (frames `V2-xx`, `W2-xx`); control panel = Figma file `Jg1QS1kTQMFGU99S6LIu3R`, page `linkar-control-panel v3`.
