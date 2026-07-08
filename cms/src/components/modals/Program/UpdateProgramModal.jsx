import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import RichTextEditor from "../../RichTextEditor";
import { toast } from "react-toastify";

const UpdateProgramModal = ({ program, show, handleClose, fetchPrograms }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [programDetailsImage, setProgramDetailsImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewDetailsImage, setPreviewDetailsImage] = useState(null);
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

  useEffect(() => {
    if (program) {
      setTitle(program.title || "");
      setDescription(program.description || "");
      setDays(Array.isArray(program.days) ? program.days : program.day ? [program.day] : []);
      setStartTime(program.startTime || "");
      setEndTime(program.endTime || "");
      setPreview(program.image?.url || null);
      setPreviewDetailsImage(program.programDetailsImage?.url || null);
      setImage(null);
      setProgramDetailsImage(null);
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
      
      // Check if days have changed
      const currentDays = Array.isArray(program.days) ? program.days : program.day ? [program.day] : [];
      const daysChanged = JSON.stringify([...days].sort()) !== JSON.stringify([...currentDays].sort());
      if (daysChanged) {
        formData.append("days", JSON.stringify(days));
      }
      
      if (startTime !== program.startTime)
        formData.append("startTime", startTime);
      if (endTime !== program.endTime) formData.append("endTime", endTime);
      if (image) formData.append("image", image);
      if (programDetailsImage) formData.append("programDetailsImage", programDetailsImage);

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
            <RichTextEditor value={description} onChange={setDescription} />
          </Form.Group>

          {/* Checkboxes for the days of the week */}
          <Form.Group controlId="days" className="mb-3">
            <Form.Label>Days</Form.Label>
            <div className="container-fluid">
              <div className="row">
                {allDays.map((day, index) => (
                  <div key={day} className="col-md-4 mb-2">
                    {" "}
                    {/* 3 per row */}
                    <Form.Check className="d-flex align-items-start">
                      <Form.Check.Input
                        type="checkbox"
                        value={day}
                        checked={days.includes(day)}
                        onChange={() => handleDayChange(day)}
                        className="mt-1"
                      />
                      <Form.Check.Label>{day}</Form.Check.Label>
                    </Form.Check>
                  </div>
                ))}
              </div>
            </div>
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
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                setImage(e.target.files[0]);
                setPreview(URL.createObjectURL(e.target.files[0]));
              }}
            />
          </Form.Group>

          {previewDetailsImage && (
            <div className="mb-2 text-center">
              <Image
                src={previewDetailsImage}
                rounded
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Program Details Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                setProgramDetailsImage(e.target.files[0]);
                setPreviewDetailsImage(URL.createObjectURL(e.target.files[0]));
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
