import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axiosInstance from "../../../axiosConfig";
import { toast } from "react-toastify";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const UpdateAdminModal = ({ show, handleClose, admin, fetchAdmins }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [image, setImage] = useState(null);
  const [channelId, setChannelId] = useState("");
  const [errors, setErrors] = useState({});

  const [channels, setChannels] = useState([]);

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

  useEffect(() => {
    if (admin) {
      setName(admin.name || "");
      setEmail(admin.email || "");
      setPhoneNumber(admin.phoneNumber || "");
      setImage(null); // Don't prefill image input
      setChannelId(
        typeof admin.channelId === "object"
          ? admin.channelId._id
          : admin.channelId
      );
    }
  }, [admin]);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!phoneNumber.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const formattedPhoneNumber = parsePhoneNumberFromString(phoneNumber);
      if (!formattedPhoneNumber || !formattedPhoneNumber.isValid()) {
        newErrors.phone = "Invalid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      const formattedPhoneNumber = parsePhoneNumberFromString(phoneNumber);
      formData.append("phoneNumber", formattedPhoneNumber.number);
      formData.append("channelId", channelId);
      if (image) formData.append("image", image);

      await axiosInstance.put(`/admin/${admin._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Admin updated successfully");
      fetchAdmins();
      handleClose();
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error(error.response?.data?.message || "Failed to update admin");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Update Admin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="d-flex flex-column">
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isInvalid={!!errors.name}
              placeholder="Enter admin name"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!!errors.email}
              placeholder="Enter email"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="phoneNumber" className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              isInvalid={!!errors.phoneNumber}
              placeholder="Enter phone number"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phoneNumber}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="channel" className="mb-3">
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

          <Form.Group controlId="image" className="mb-3">
            <Form.Label>Profile Image</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="align-self-center mt-3"
            style={{ width: "160px" }}
          >
            Update Admin
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateAdminModal;
