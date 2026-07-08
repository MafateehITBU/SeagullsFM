import { hasRichTextContent } from "../utils/richTextUtils";

export default function RichTextViewButton({ value, onView, label = "View" }) {
  if (!hasRichTextContent(value)) {
    return <span className="text-muted">-</span>;
  }

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-primary"
      onClick={() => onView(value)}
    >
      {label}
    </button>
  );
}
