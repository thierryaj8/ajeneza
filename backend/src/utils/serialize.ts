export function toApi(value: any): any {
  if (Array.isArray(value)) return value.map(toApi);
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  const out: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) {
    if (key === "id") out._id = item;
    else if (key === "tags" && Array.isArray(item)) out.tags = item.map((edge: any) => toApi(edge.tag ?? edge));
    else if (key === "projects" && Array.isArray(item)) out.projects = item.map((edge: any) => toApi(edge.project ?? edge));
    else if (["categoryId", "authorId", "articleId", "userId"].includes(key)) continue;
    else out[key] = toApi(item);
  }
  if (value.categoryId && !value.category) out.category = value.categoryId;
  if (value.authorId && !value.author) out.author = value.authorId;
  if (value.articleId && !value.article) out.article = value.articleId;
  if (value.userId && !value.user) out.user = value.userId;
  return out;
}