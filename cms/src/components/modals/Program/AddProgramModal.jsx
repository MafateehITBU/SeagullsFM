import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const AddProgramModal = ({ channelId, show, handleClose, fetchPrograms }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!day.trim()) newErrors.day = "Day is required";
    if (!startTime.trim()) newErrors.startTime = "Start Time is required";
    if (!endTime.trim()) newErrors.endTime = "End Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDay("");
    setStartTime("");
    setEndTime("");
    setImage(null);
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
      formData.append("day", day);
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append("channelId", channelId);
      if (image) formData.append("image", image);

      await axiosInstance.post("/program", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Program added successfully");
      fetchPrograms?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Add Program</Modal.Title>
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

          {/* Drop down for the days of the week */}
          <Form.Group className="mb-3">
            <Form.Label>Day</Form.Label>
            <Form.Control
              as="select"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              isInvalid={!!errors.day}
            >
              <option value="">Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.day}
            </Form.Control.Feedback>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              {/* Drop Down for start time that consists of HH:MM */}
              <Form.Group className="mb-3">
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  isInvalid={!!errors.startTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.startTime}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              {/* Drop Down for end time that consists of HH:MM */}
              <Form.Group className="mb-3">
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  isInvalid={!!errors.endTime}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.endTime}
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
              {isSubmitting ? "Adding..." : "Add Program"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddProgramModal;
