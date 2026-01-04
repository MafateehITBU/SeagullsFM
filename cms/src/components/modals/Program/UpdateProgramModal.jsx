import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const UpdateProgramModal = ({ program, show, handleClose, fetchPrograms }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (program) {
      setTitle(program.title || "");
      setDescription(program.description || "");
      setDay(program.day || "");
      setStartTime(program.startTime || "");
      setEndTime(program.endTime || "");
      setPreview(program.image?.url || null);
      setImage(null);
    }
  }, [program]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!program) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (title !== program.title) formData.append("title", title);
      if (description !== program.description)
        formData.append("description", description);
      if (day !== program.day) formData.append("day", day);
      if (startTime !== program.startTime)
        formData.append("startTime", startTime);
      if (endTime !== program.endTime) formData.append("endTime", endTime);
      if (image) formData.append("image", image);

      await axiosInstance.put(`/program/${program._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Program updated successfully");
      fetchPrograms?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update program");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Update Program</Modal.Title>
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
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Day</Form.Label>
            <Form.Control
              as="select"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">Select a day</option>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
              {isSubmitting ? "Updating..." : "Update Program"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateProgramModal;
