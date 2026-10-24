/**
 * Public news URLs use a title slug. The database id is never part of the slug.
 * Duplicate titles get a deterministic suffix based on publish order.
 */

export function slugifyTitle(title) {
  const cleaned = String(title || "")
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "news";
}

export function slugMapForArticles(articles) {
  const sorted = [...articles].sort((a, b) => {
    const time = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (time !== 0) return time;
    return String(a._id).localeCompare(String(b._id));
  });
  const counts = new Map();
  const slugById = new Map();

  for (const article of sorted) {
    const base = slugifyTitle(article.title);
    const seen = counts.get(base) || 0;
    counts.set(base, seen + 1);
    const slug = seen === 0 ? base : `${base}-${seen + 1}`;
    slugById.set(String(article._id), slug);
  }

  return slugById;
}
