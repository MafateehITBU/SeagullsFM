import { Modal, Button } from "react-bootstrap";
import RichTextContent from "./RichTextContent";

export default function RichTextViewModal({ show, onHide, title, html }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="cms-rich-text-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="h5">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RichTextContent html={html} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
