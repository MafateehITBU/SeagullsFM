import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const AddEventModal = ({ channelId, show, handleClose, fetchEvents }) => {
  const [type, setType] = useState("event");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!startDate.trim()) newErrors.startDate = "Start Date is required";
    if (!endDate.trim()) newErrors.endDate = "End Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setType("event");
    setTitle("");
    setDescription("");
    setAddress("");
    setStartDate("");
    setEndDate("");
    setImage(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("address", address);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("channelId", channelId);
      if (image) formData.append("image", image);

      await axiosInstance.post("/event", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Event added successfully");
      fetchEvents?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Add Event</Modal.Title>
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
            <Form.Label>Type</Form.Label>

            <div className="d-flex gap-4">
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  name="type"
                  id="type-event"
                  checked={type === "event"}
                  onChange={() => setType("event")}
                  className="me-2"
                />
                <Form.Label htmlFor="type-event" className="mb-0">
                  Event
                </Form.Label>
              </div>

              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  name="type"
                  id="type-partnership"
                  checked={type === "partnership"}
                  onChange={() => setType("partnership")}
                  className="me-2"
                />
                <Form.Label htmlFor="type-partnership" className="mb-0">
                  Partnership
                </Form.Label>
              </div>
            </div>
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
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">
              {errors.address}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  isInvalid={!!errors.startDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  isInvalid={!!errors.endDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.endDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Image (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: "160px" }}
            >
              {isSubmitting ? "Adding..." : "Add Event"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddEventModal;
