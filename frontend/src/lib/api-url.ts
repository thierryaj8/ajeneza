const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export const isSameOriginApi = !apiOrigin;

export function apiUrl(path: string) {
  return `${apiOrigin}/api/v1${path}`;
}
