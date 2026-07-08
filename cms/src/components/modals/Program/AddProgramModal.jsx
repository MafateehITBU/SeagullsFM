import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import RichTextEditor from "../../RichTextEditor";
import { hasRichTextContent } from "../../../utils/richTextUtils";
import { toast } from "react-toastify";

const AddProgramModal = ({ channelId, show, handleClose, fetchPrograms }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [programDetailsImage, setProgramDetailsImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleDayChange = (day) => {
    setDays((prevDays) => {
      if (prevDays.includes(day)) {
        // Remove day if already selected
        return prevDays.filter((d) => d !== day);
      } else {
        // Add day if not selected
        return [...prevDays, day];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!hasRichTextContent(description)) newErrors.description = "Description is required";
    if (days.length === 0) newErrors.days = "At least one day is required";
    if (!startTime.trim()) newErrors.startTime = "Start Time is required";
    if (!endTime.trim()) newErrors.endTime = "End Time is required";
    if (!programDetailsImage) newErrors.programDetailsImage = "Program Details Image is required";
    if (!image) newErrors.image = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDays([]);
    setStartTime("");
    setEndTime("");
    setImage(null);
    setProgramDetailsImage(null);
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
      // Send days as JSON array string
      formData.append("days", JSON.stringify(days));
      formData.append("startTime", startTime);
      formData.append("endTime", endTime);
      formData.append("channelId", channelId);
      if (image) formData.append("image", image);
      if (programDetailsImage) formData.append("programDetailsImage", programDetailsImage);
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
            <RichTextEditor
              value={description}
              onChange={setDescription}
              invalid={!!errors.description}
            />
            {errors.description ? (
              <div className="invalid-feedback d-block">{errors.description}</div>
            ) : null}
          </Form.Group>

          {/* Checkboxes for the days of the week */}
          <Form.Group className="mb-3">
            <Form.Label>Days</Form.Label>
            <Row>
              {allDays.map((day) => (
                <Col md={4} key={day} className="mb-2">
                  <Form.Check className="d-flex align-items-start">
                    <Form.Check.Input
                      type="checkbox"
                      value={day}
                      checked={days.includes(day)}
                      onChange={() => handleDayChange(day)}
                      className="mt-1"
                    />
                    <Form.Check.Label className="ms-2">{day}</Form.Check.Label>
                  </Form.Check>
                </Col>
              ))}
            </Row>
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
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Program Details Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setProgramDetailsImage(e.target.files[0])}
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
