# Deploying to Render (single service)

The backend's `server.ts` starts Express **and** the Next.js frontend in one process, listening on `process.env.PORT`. Render sets `PORT` for you (usually 10000), so there is nothing to configure for ports and no separate frontend service.

## 1. Database: MongoDB Atlas (free tier is fine)
1. Create a cluster and a database user.
2. Network Access → allow `0.0.0.0/0` (Render's outbound IPs vary) or Render's static IPs if you have them.
3. Copy the connection string, e.g. `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/ajeneza`.
4. Turn on Cloud Backup for automated backups.

## 2. Media: Cloudinary (recommended)
Render's filesystem is reset on every deploy, so uploaded images would disappear. Create a free Cloudinary account and copy `CLOUDINARY_URL`.

## 3. Render
**Option A, Blueprint (easiest):** push the repo to GitHub, then Render → **New → Blueprint** → select the repo. Render reads `render.yaml` and asks for the values marked `sync: false`.

**Option B, manual Web Service:**

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Root directory | *(leave empty: the repository root)* |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |

Environment variables:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | two different long random strings |
| `NEXT_PUBLIC_SITE_URL` | your public URL, e.g. `https://ajeneza-thierry.onrender.com` |
| `CLOUDINARY_URL` | from Cloudinary |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | first administrator (12+ character password) |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL` | optional: email alerts for contact messages |

Do **not** set `PORT`; Render provides it.

## 4. First run
Open the service's **Shell** tab on Render and run once:

```bash
npm run seed          # creates the admin and the starter content from the template
# or, admin only:
npm run create-admin
```

Then sign in at `https://<your-service>.onrender.com/admin`.

## 5. Custom domain
Render → your service → Settings → Custom Domains → add your domain and follow the DNS instructions. HTTPS certificates are issued automatically. Update `NEXT_PUBLIC_SITE_URL` and redeploy.

## Launch checklist
- [ ] Replace every `[Placeholder]` item and the sample article bodies in the admin.
- [ ] Replace or confirm the project and book entries (they are concepts from the template).
- [ ] Upload a professional portrait (Admin → Biography).
- [ ] Set OrLabs' official website and social links (Admin → Ventures).
- [ ] Review the privacy notice (`frontend/src/app/(site)/privacy/page.tsx`).
- [ ] Submit `/sitemap.xml` to Google Search Console.
- [ ] Confirm Atlas backups are on.

## Troubleshooting
- **Build fails with "tsc: not found" or missing Tailwind**: the build command must include `--include=dev`.
- **"Missing required environment variable JWT_ACCESS_SECRET"**: set both JWT secrets.
- **Images disappear after a deploy**: set `CLOUDINARY_URL`.
- **Free plan is slow on first request**: free Render services sleep when idle; the Starter plan stays awake.
