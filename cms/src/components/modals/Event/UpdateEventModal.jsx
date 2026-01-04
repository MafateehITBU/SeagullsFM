import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const UpdateEventModal = ({ event, show, handleClose, fetchEvents }) => {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setType(event.type || "");
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStartDate(event.startDate ? event.startDate.slice(0, 16) : "");
      setEndDate(event.endDate ? event.endDate.slice(0, 16) : "");
      setAddress(event.address || "");
      setPreview(event.image?.url || null);
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (type !== event.type) formData.append("type", type);
      if (title !== event.title) formData.append("title", title);
      if (description !== event.description)
        formData.append("description", description);
      if (address !== event.address) formData.append("address", address);
      if (startDate !== event.startDate) formData.append("startDate", startDate);
      if (endDate !== event.endDate) formData.append("endDate", endDate);
      if (image) formData.append("image", image);

      await axiosInstance.put(`/event/${event._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Event updated successfully");
      fetchEvents?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Update Event</Modal.Title>
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
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

            <Row className="mb-3">
                <Col>
                    <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

          {preview && (
            <div className="mb-2 text-center">
              <Image
                src={preview}
                rounded
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Image (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: "200px" }}
            >
              {isSubmitting ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateEventModal;
