import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import RichTextEditor from "../../RichTextEditor";
import { toast } from "react-toastify";

const UpdateNewsModal = ({ news, show, handleClose, fetchNews }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [deletedPublicIds, setDeletedPublicIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingImages = news?.images || [];
  const keptImages = existingImages.filter((img) => !deletedPublicIds.includes(img.public_id));

  useEffect(() => {
    if (news) {
      setTitle(news.title || "");
      setDescription(news.description || "");
      setContent(news.content || "");
      setNewImages([]);
      setDeletedPublicIds([]);
    }
  }, [news]);

  const handleRemoveExisting = (publicId) => {
    setDeletedPublicIds((prev) => (prev.includes(publicId) ? prev : [...prev, publicId]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", content);
      if (deletedPublicIds.length > 0) {
        formData.append("deletedImages", JSON.stringify(deletedPublicIds));
      }
      newImages.forEach((file) => formData.append("images", file));

      await axiosInstance.put(`/news/${news._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("News updated successfully");
      fetchNews?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update news");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Update news</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content</Form.Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              minHeight={320}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Images</Form.Label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {keptImages.map((img, i) => (
                <div key={img.public_id || i} className="position-relative">
                  <img
                    src={img.url}
                    alt={`Existing ${i + 1}`}
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
                    onClick={() => handleRemoveExisting(img.public_id)}
                    aria-label="Remove image"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {newImages.map((file, i) => (
                <div key={`new-${i}`} className="position-relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${i + 1}`}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "cover",
                      borderRadius: 6,
                      border: "1px solid #0d6efd",
                    }}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="position-absolute top-0 end-0 translate-middle"
                    style={{ padding: "0 4px", fontSize: 10 }}
                    onClick={() =>
                      setNewImages((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    aria-label="Remove new image"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewImages((prev) => [...prev, ...files]);
              }}
            />
            <Form.Text className="text-muted">
              Remove existing with ×. New files are added to the current images.
            </Form.Text>
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: "200px" }}
            >
              {isSubmitting ? "Updating..." : "Update news"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateNewsModal;
