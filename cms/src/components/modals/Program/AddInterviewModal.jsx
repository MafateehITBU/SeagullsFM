import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const AddInterviewModal = ({
  channelId,
  programId,
  show,
  handleClose,
  fetchInterviews,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!date.trim()) newErrors.date = "Date is required";
    if (!content) newErrors.content = "Video is required";
    else if (!content.type.startsWith("video/"))
      newErrors.content = "Only video files are allowed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setContent(null);
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
      formData.append("date", date);
      formData.append("channelId", channelId);
      formData.append("programId", programId);
      formData.append("content", content);

      await axiosInstance.post("/interview", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Interview added successfully");
      fetchInterviews?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Add Interview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Title */}
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

          {/* Description */}
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

          {/* Date */}
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              isInvalid={!!errors.date}
            />
            <Form.Control.Feedback type="invalid">
              {errors.date}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Video Upload */}
          <Form.Group className="mb-4">
            <Form.Label>Interview Video</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={(e) => setContent(e.target.files[0])}
              isInvalid={!!errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content}
            </Form.Control.Feedback>
            {content && (
              <div className="text-muted small mt-1">
                Selected: {content.name}
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
              {isSubmitting ? "Adding..." : "Add Interview"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddInterviewModal;
