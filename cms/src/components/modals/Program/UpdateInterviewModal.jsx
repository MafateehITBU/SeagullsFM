import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const UpdateInterviewModal = ({
  show,
  handleClose,
  interview,
  fetchInterviews,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill when interview changes
  useEffect(() => {
    if (interview) {
      setTitle(interview.title || "");
      setDescription(interview.description || "");
      setDate(interview.date?.split("T")[0] || "");
      setContent(null);
      setErrors({});
    }
  }, [interview]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!date.trim()) newErrors.date = "Date is required";
    if (content && !content.type.startsWith("video/"))
      newErrors.content = "Only video files are allowed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getChangedFields = () => {
    const formData = new FormData();

    if (title !== interview.title) formData.append("title", title);
    if (description !== interview.description)
      formData.append("description", description);
    if (date !== interview.date?.split("T")[0]) formData.append("date", date);
    if (content) formData.append("content", content);

    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = getChangedFields();

    if ([...formData.entries()].length === 0) {
      toast.info("No changes to update");
      return;
    }

    setIsSubmitting(true);

    try {
      await axiosInstance.put(`/interview/${interview._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Interview updated successfully");
      fetchInterviews?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Update Interview</Modal.Title>
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

          {/* Replace Video */}
          <Form.Group className="mb-4">
            <Form.Label>Replace Video (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={(e) => setContent(e.target.files[0])}
              isInvalid={!!errors.content}
            />
            <Form.Control.Feedback type="invalid">
              {errors.content}
            </Form.Control.Feedback>

            {interview?.content?.url && !content && (
              <div className="text-muted small mt-2">
                Current video exists. Uploading a file will replace it.
              </div>
            )}

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
              style={{ width: "180px" }}
            >
              {isSubmitting ? "Updating..." : "Update Interview"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateInterviewModal;
