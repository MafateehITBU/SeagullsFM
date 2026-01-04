import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Image } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";

const UpdateBroadcasterModal = ({
  broadcaster,
  show,
  handleClose,
  fetchBroadcasters,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState({ ig: "", FB: "", YT: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (broadcaster) {
      setName(broadcaster.name || "");
      setDescription(broadcaster.description || "");
      setSocialLinks(broadcaster.socialLinks || { ig: "", FB: "", YT: "" });
      setPreview(broadcaster.image?.url || null);
    }
  }, [broadcaster]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (name !== broadcaster.name) formData.append("name", name);
      if (description !== broadcaster.description)
        formData.append("description", description);
      if (
        JSON.stringify(socialLinks) !== JSON.stringify(broadcaster.socialLinks)
      )
        formData.append("socialLinks", JSON.stringify(socialLinks));
      if (image) formData.append("image", image);

      await axiosInstance.put(`/broadcaster/${broadcaster._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Broadcaster updated successfully");
      fetchBroadcasters?.();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to update broadcaster"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Update Broadcaster</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              {isSubmitting ? "Updating..." : "Update Broadcaster"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateBroadcasterModal;
