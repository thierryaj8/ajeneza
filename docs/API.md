# REST API (base `/api/v1`)

All responses are JSON. Lists return `{ items, total, page, pages }` and accept `page` and `limit`.
All of this is served by the same server as the website. Admin routes require a session cookie (or `Authorization: Bearer <access token>`), and state-changing admin requests must send `X-Requested-With: XMLHttpRequest`.

## Auth
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` → sets cookies |
| POST | `/auth/refresh` | rotates the refresh token |
| POST | `/auth/logout` | |
| GET | `/auth/me` | current user |
| PUT | `/auth/password` | `{ currentPassword, newPassword }` |

## Public
| Method | Path | Notes |
| --- | --- | --- |
| GET | `/profile`, `/settings` | singletons |
| GET | `/categories?section=`, `/tags` | |
| GET | `/articles` | `section`, `category` (slug), `tag`, `q`, `featured`, `sort=popular`, `exclude` |
| GET | `/articles/:slug?section=` | |
| GET/POST | `/articles/:slug/comments` | POST `{ name, email, body }` → held for moderation |
| GET | `/books`, `/books/:slug` | `kind`, `publicationStatus` |
| GET | `/projects`, `/projects/:slug` | `projectCategory`, `devStatus`, `featured` |
| GET | `/ventures`, `/ventures/:slug` | |
| GET | `/achievements`, `/events`, `/timeline`, `/research`, `/reading-list` (+ `/:slug`) | |
| GET | `/search?q=` | articles, projects, books, research |
| GET | `/sitemap` | public URLs for the sitemap |
| POST | `/contact` | `{ name, email, organization?, subject, message, category }` |
| POST | `/newsletter/subscribe`, `/newsletter/unsubscribe` | `{ email }` |
| POST | `/track` | `{ path, referrer? }` cookieless page view |

Only published items (or scheduled items whose time has passed) are returned.

## Admin (`/admin/...`)
| Method | Path | Notes |
| --- | --- | --- |
| GET/PUT | `/admin/profile` | editor+ to update |
| GET/PUT | `/admin/settings` | superadmin to update |
| GET/POST | `/admin/{articles,books,projects,ventures,achievements,events,timeline,research,reading-list,categories,tags}` | list (`q`, `status`, …) / create |
| GET/PUT/DELETE | `/admin/{collection}/:id` | |
| GET | `/admin/messages` · PATCH `/admin/messages/:id/status` · DELETE `/admin/messages/:id` | |
| GET | `/admin/subscribers` · GET `/admin/subscribers/export` (CSV) · DELETE `/admin/subscribers/:id` | |
| GET | `/admin/comments` · PATCH `/admin/comments/:id/status` · DELETE `/admin/comments/:id` | |
| POST | `/admin/media/upload` (multipart `file`, `folder`, `alt`) · POST `/admin/media/embed` | |
| GET | `/admin/media?q=&kind=&folder=` · PATCH/DELETE `/admin/media/:id` | |
| GET | `/admin/dashboard/overview`, `/admin/dashboard/analytics?days=` | |
| GET | `/admin/activity` | |
| GET/POST | `/admin/users` · DELETE `/admin/users/:id` | superadmin |
