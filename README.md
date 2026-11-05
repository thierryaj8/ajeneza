# AJENEZA M. Thierry: portfolio, journal and CMS

Personal website and publishing platform: journalism, books, technology projects, ventures (OrLabs Tech Industries), leadership, a journal/blog, and a private admin dashboard that manages all of it without touching code.

The project is split into a **backend** (Express REST API, MVC) and a **frontend** (Next.js, component-based). In production **one Node process serves both** on the port the host provides, so it deploys to Render as a single web service.

```
ajeneza/
├── backend/                 Express + PostgreSQL API (MVC)
│   ├── src/
│   │   ├── server.ts        entry point: API + Next.js frontend on process.env.PORT
│   │   ├── app.ts           Express app (routes, security, uploads, health check)
│   │   ├── config/          env.ts, db.ts, resources.ts (content-type registry)
│   │   ├── prisma/          PostgreSQL schema and migrations
│   │   ├── controllers/     request handlers (C): auth, content, site, engagement, media, analytics, user
│   │   ├── routes/          URL → controller maps: auth, public, admin
│   │   ├── middleware/      auth & roles, CSRF, rate limits, uploads, errors, sanitising
│   │   ├── services/        tokens, storage (Cloudinary/disk), mail, slugs, activity log
│   │   ├── validators/      Zod schemas for every input
│   │   ├── utils/           HTTP helpers
│   │   └── scripts/         seed, create-admin
│   └── test/                API tests (Vitest + Supertest)
├── frontend/                Next.js 15 + React 19 + Tailwind (the V in MVC)
│   └── src/
│       ├── app/             routes only: (site)/… public pages, admin/… CMS pages
│       ├── components/
│       │   ├── layout/      Header, Footer, Brand, NewsletterBand, ThemeToggle, Tracker
│       │   ├── home/        Hero, About, Disciplines, Writing, Technology, Venture, Books, Leadership, Journal, Contact
│       │   ├── cards/       article, project, book, research cards; BookCover
│       │   ├── content/     Markdown, images, share buttons, article views
│       │   ├── forms/       contact, newsletter, comments
│       │   ├── ui/          page header, filters, pagination, empty states
│       │   └── admin/       CMS shell, editors, media picker, charts
│       └── lib/             API client, types, SEO helpers, site constants (owner name lives in lib/site.ts)
├── render.yaml              one-click Render Blueprint
└── docs/                    deployment guide, API reference
```

## Run locally

Requirements: Node 20.9+ and PostgreSQL 16+ (local or hosted).

```bash
npm install
docker run -d --name ajeneza-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ajeneza -p 5432:5432 postgres:16
cp backend/.env.example backend/.env                    # set DATABASE_URL and admin credentials
npm run db:deploy --workspace backend                   # create the PostgreSQL schema
npm run seed                                            # first admin + starter content from the template
npm run dev                                             # http://localhost:3000
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin

Production mode locally: `npm run build && npm start` (set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` first; production refuses to start without them).

> Starter content comes from the template. Everything marked `[Placeholder]`, all article bodies, and the project and book entries (which are concepts) must be replaced with real, verified information in the admin before launch.

## Deploy on Render

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In short: push to GitHub → Render → **New → Blueprint** → choose the repo. `render.yaml` sets build `npm ci --include=dev && npm run build`, start `npm start`, health check `/health`. The server listens on Render's `PORT`; nothing is hard-coded.

## Features

**Public site**: homepage built from the template (hero, about, disciplines, selected writing, filterable projects, OrLabs, books, leadership, searchable journal, contact, newsletter), About, Journalism and Journal (categories, search, popular/recent, sources, related posts, moderated comments), Books, Technology portfolio, Ventures, Leadership & Speaking, Contact, Timeline, Research & Insights, Reading Room, Now, Media Kit, site search, privacy notice, light/dark themes, responsive to phone width.

**SEO**: titles/descriptions, canonical URLs, Open Graph/Twitter cards, JSON-LD, `sitemap.xml`, `robots.txt`, RSS at `/feed.xml`, per-item SEO overrides.

**CMS** (`/admin`): dashboard and analytics, editors for every module, Markdown editor with preview, media library, inbox, comment moderation, newsletter export, site settings (including the homepage hero text), users and roles, activity log.

**Workflow**: Draft → In review → Scheduled → Published → Archived; scheduled items go live automatically. Roles: `superadmin`, `editor` (publishes), `content_manager` (drafts and submits for review).

## Security

bcrypt passwords and account lockout; short-lived JWT + rotating refresh token in httpOnly `SameSite=Strict` cookies; CSRF header on every admin write; role checks on every admin route; Zod validation; safe URLs only; Markdown rendered without raw HTML; upload type/size/magic-byte checks (no SVG/HTML); Helmet on the API, security headers on pages; rate limits and honeypots against spam; cookieless analytics that honour Do Not Track.

## Tests

Set both `DATABASE_URL` and `TEST_DATABASE_URL` to the same dedicated PostgreSQL database whose name contains `test`. Apply the schema with `npm run db:deploy --workspace backend`, then run `npm test`. The API test harness refuses to run against a database whose name does not contain `test`.
