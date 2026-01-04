import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const AddBroadcasterModal = ({
  channelId,
  show,
  handleClose,
  fetchBroadcasters,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  // 🔹 Social links state
  const [socialLinks, setSocialLinks] = useState({
    ig: "",
    FB: "",
    YT: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setSocialLinks({ ig: "", FB: "", YT: "" });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("channelId", channelId);
      if (image) formData.append("image", image);

      // 🔹 Append socialLinks as JSON string exactly like backend expects
      const socialLinksPayload = JSON.stringify({
        ig: socialLinks.ig || "",
        FB: socialLinks.FB || "",
        YT: socialLinks.YT || "",
      });

      formData.append("socialLinks", socialLinksPayload);

      await axiosInstance.post("/broadcaster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Broadcaster added successfully");
      fetchBroadcasters?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add broadcaster");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Add New Broadcaster</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
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

          {/* 🔹 Social Media Links */}
          <Form.Group className="mb-3">
            <Form.Label>Social Media Links</Form.Label>
            <Row className="g-2">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Instagram"
                  value={socialLinks.ig}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, ig: e.target.value })
                  }
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Facebook"
                  value={socialLinks.FB}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, FB: e.target.value })
                  }
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="YouTube"
                  value={socialLinks.YT}
                  onChange={(e) =>
                    setSocialLinks({ ...socialLinks, YT: e.target.value })
                  }
                />
              </Col>
            </Row>
          </Form.Group>

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
              {isSubmitting ? "Adding..." : "Add Broadcaster"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddBroadcasterModal;
