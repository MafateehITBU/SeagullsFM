import { Icon } from "@iconify/react";

export default function FormPageHeader({ title, onBack }) {
  return (
    <div className="d-flex align-items-center gap-3 mb-4">
      <button
        type="button"
        className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
        onClick={onBack}
      >
        <Icon icon="mdi:arrow-left" width={20} height={20} />
        Back
      </button>
      <h5 className="mb-0">{title}</h5>
    </div>
  );
}
