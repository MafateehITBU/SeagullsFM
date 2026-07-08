import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import RichTextEditor from "../../RichTextEditor";
import { hasRichTextContent } from "../../../utils/richTextUtils";
import { toast } from "react-toastify";

const AddNewsModal = ({ channelId, show, handleClose, fetchNews }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!hasRichTextContent(content)) newErrors.content = "Content is required";
    if (!images.length) newErrors.images = "At least one image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setImages([]);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      formData.append("channelId", channelId);
      
      images.forEach((imageFile) => {
        formData.append("images", imageFile);
      });

      await axiosInstance.post("/news", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("News added successfully");
      fetchNews?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add news");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Add News Article</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">
              {errors.description}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              invalid={!!errors.content}
              minHeight={320}
            />
            {errors.content ? (
              <div className="invalid-feedback d-block">{errors.content}</div>
            ) : null}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Images (multiple)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImages(files);
              }}
              isInvalid={!!errors.images}
            />
            <Form.Control.Feedback type="invalid">
              {errors.images}
            </Form.Control.Feedback>
            {images.length > 0 && (
              <div className="mt-2 d-flex flex-wrap gap-2">
                {images.map((file, i) => (
                  <div key={i} className="position-relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i + 1}`}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #dee2e6",
                      }}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 translate-middle"
                      style={{ padding: "0 4px", fontSize: 10 }}
                      onClick={() =>
                        setImages((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      aria-label="Remove image"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <small className="text-muted align-self-center">
                  {images.length} image{images.length !== 1 ? "s" : ""} selected
                </small>
              </div>
            )}
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: "160px" }}
            >
              {isSubmitting ? "Adding..." : "Add News Article"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddNewsModal;
