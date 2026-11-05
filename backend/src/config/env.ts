import "dotenv/config";

const env = process.env;
const isProd = env.NODE_ENV === "production";

function required(name: string, fallback?: string): string {
  const v = env[name] ?? fallback;
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  if (isProd && v.startsWith("change-me")) throw new Error(`${name} must be changed in production`);
  return v;
}

export const config = {
  isProd,
  isTest: env.NODE_ENV === "test",
  // Render (and most hosts) inject PORT; never hard-code it.
  port: Number(env.PORT ?? 3000),
  host: env.HOST ?? "0.0.0.0",
  databaseUrl: required("DATABASE_URL", isProd ? undefined : "postgresql://postgres:postgres@localhost:5432/ajeneza?schema=public"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET", isProd ? undefined : "change-me-access-dev"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", isProd ? undefined : "change-me-refresh-dev"),
  accessTtlSeconds: 15 * 60,
  refreshTtlSeconds: 7 * 24 * 60 * 60,
  // Only needed if another origin must call the API; the site itself is same-origin.
  corsOrigins: (env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  trustProxy: Number(env.TRUST_PROXY ?? (isProd ? 1 : 0)),
  cloudinaryUrl: env.CLOUDINARY_URL || "",
  uploadDir: env.UPLOAD_DIR ?? "uploads",
  maxUploadBytes: 10 * 1024 * 1024,
  smtp: {
    host: env.SMTP_HOST || "",
    port: Number(env.SMTP_PORT ?? 587),
    user: env.SMTP_USER || "",
    pass: env.SMTP_PASS || "",
    from: env.MAIL_FROM || "Website <no-reply@example.com>",
    notify: env.NOTIFY_EMAIL || "",
  },
};
