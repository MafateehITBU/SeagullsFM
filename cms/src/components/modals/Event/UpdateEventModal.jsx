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
  const [coverImage, setCoverImage] = useState(null);
  const [images, setImages] = useState([]);
  const [previewCoverImage, setPreviewCoverImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setType(event.type || "");
      setTitle(event.title || "");
      setDescription(event.description || "");
      setStartDate(event.startDate ? event.startDate.slice(0, 16) : "");
      setEndDate(event.endDate ? event.endDate.slice(0, 16) : "");
      setAddress(event.address || "");
      setPreviewCoverImage(event.coverImage?.url || null);
      setPreviewImages(event.images || []);
      setCoverImage(null);
      setImages([]);
      setImagesToDelete([]);
    }
  }, [event]);

  const handleRemoveExistingImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    const imageToRemove = previewImages[index];
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    // Track the image URL to delete (for existing images)
    if (imageToRemove && imageToRemove.url) {
      setImagesToDelete((prev) => [...prev, imageToRemove.url]);
    }
  };

  const handleRemoveNewImage = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

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
      
      // Append coverImage if new file is selected
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      // Append images array if new files are selected
      images.forEach((imageFile) => {
        formData.append("images", imageFile);
      });

      // Append deleted images URLs if any
      if (imagesToDelete.length > 0) {
        formData.append("deletedImages", JSON.stringify(imagesToDelete));
      }

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
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

          {previewCoverImage && (
            <div className="mb-2 text-center">
              <p className="mb-1"><small>Current Cover Image:</small></p>
              <Image
                src={previewCoverImage}
                rounded
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Cover Image (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setCoverImage(file);
                  setPreviewCoverImage(URL.createObjectURL(file));
                }
              }}
            />
          </Form.Group>

          {previewImages.length > 0 && (
            <div className="mb-3">
              <p className="mb-2"><small>Current Additional Images:</small></p>
              <div className="d-flex flex-wrap gap-2">
                {previewImages.map((img, index) => (
                  <div
                    key={img.public_id || img.url || index}
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <Image
                      src={img.url}
                      rounded
                      style={{ width: "80px", height: "80px", objectFit: "cover", pointerEvents: "none" }}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveExistingImage(e, index)}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        lineHeight: "1",
                        padding: 0,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        zIndex: 10,
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#c82333";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#dc3545";
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Additional Images (optional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setImages((prev) => [...prev, ...files]);
                e.target.value = ""; // Reset input to allow selecting same files again
              }}
            />
            {images.length > 0 && (
              <div className="mt-3">
                <p className="mb-2"><small>New Images to Upload:</small></p>
                <div className="d-flex flex-wrap gap-2">
                  {images.map((imageFile, index) => (
                    <div
                      key={`new-${index}-${imageFile.name}-${imageFile.size}`}
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <Image
                        src={URL.createObjectURL(imageFile)}
                        rounded
                        style={{ width: "80px", height: "80px", objectFit: "cover", pointerEvents: "none" }}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleRemoveNewImage(e, index)}
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold",
                          lineHeight: "1",
                          padding: 0,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          zIndex: 10,
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#c82333";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "#dc3545";
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
