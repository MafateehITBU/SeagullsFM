import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const AddAdminModal = ({ show, handleClose, fetchAdmins }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [channelId, setChannelId] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [channels, setChannels] = useState([]);

  const allPermissions = [
    "users",
    "static-info",
    "broadcasters",
    "programs",
    "news",
    "events",
    "advertisement",
    "interview-applicants",
    "uploaded-tracks",
  ];

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axiosInstance.get("/channel");
        setChannels(response.data.data);
      } catch (err) {
        console.error("Failed to fetch channels", err);
      }
    };

    fetchChannels();
  }, []);

  const handlePermissionChange = (perm) => {
    setPermissions((prev) => {
      if (prev.includes(perm)) {
        return prev.filter((p) => p !== perm);
      }
      return [...prev, perm];
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password || password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const phoneNumber = parsePhoneNumberFromString(phone);
      if (!phoneNumber || !phoneNumber.isValid()) {
        newErrors.phone = "Invalid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setImage(null);
    setChannelId("");
    setPermissions([]);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      const phoneNumber = parsePhoneNumberFromString(phone);
      formData.append("phoneNumber", phoneNumber.number);
      if (image) formData.append("image", image);
      formData.append("channelId", channelId);
      permissions.forEach((p) => formData.append("permissions[]", p));

      await axiosInstance.post("/admin/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Admin added successfully");
      fetchAdmins?.();
      resetForm();
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Add New Admin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
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
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Permissions</Form.Label>
            <Row>
              {allPermissions.map((perm) => (
                <Col md={4} key={perm} className="mb-2">
                  <Form.Check className="d-flex align-items-start">
                    <Form.Check.Input
                      type="checkbox"
                      value={perm}
                      checked={permissions.includes(perm)}
                      onChange={() => handlePermissionChange(perm)}
                      className="mt-1"
                    />
                    <Form.Check.Label className="ms-2">{perm}</Form.Check.Label>
                  </Form.Check>
                </Col>
              ))}
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

          <Form.Group className="mb-3">
            <Form.Label>Channel</Form.Label>
            <Form.Select
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            >
              <option value="">Select Channel</option>
              {channels.map((channel) => (
                <option key={channel._id} value={channel._id}>
                  {channel.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="text-center">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ width: "160px" }}
            >
              {isSubmitting ? "Adding Admin..." : "Add Admin"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddAdminModal;
