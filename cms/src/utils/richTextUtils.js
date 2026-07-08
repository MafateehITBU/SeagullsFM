export function stripRichText(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export function hasRichTextContent(html) {
  return stripRichText(html).length > 0;
}

export function previewRichText(html, maxLength = 120) {
  const text = stripRichText(html);
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}
