import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form, Row, Col, Image } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import FormPageHeader from "../components/FormPageHeader";
import RichTextEditor from "../components/RichTextEditor";
import useConfirmNavigateBack from "../hooks/useConfirmNavigateBack";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";
import { hasRichTextContent } from "../utils/richTextUtils";

const BroadcasterFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [initialData, setInitialData] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState({ ig: "", FB: "", YT: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchBroadcaster = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/broadcaster");
        const broadcaster = (res.data.data || []).find((item) => item._id === id);

        if (!broadcaster) {
          toast.error("Broadcaster not found");
          navigate("/broadcasters");
          return;
        }

        setInitialData(broadcaster);
        setName(broadcaster.name || "");
        setDescription(broadcaster.description || "");
        setSocialLinks(broadcaster.socialLinks || { ig: "", FB: "", YT: "" });
        setPreview(broadcaster.image?.url || null);
      } catch (error) {
        toast.error("Failed to load broadcaster");
        navigate("/broadcasters");
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcaster();
  }, [id, isEdit, navigate]);

  const isDirty = useMemo(() => {
    if (!isEdit) {
      return (
        name.trim() !== "" ||
        hasRichTextContent(description) ||
        socialLinks.ig.trim() !== "" ||
        socialLinks.FB.trim() !== "" ||
        socialLinks.YT.trim() !== "" ||
        image !== null
      );
    }

    if (!initialData) return false;

    return (
      name !== (initialData.name || "") ||
      description !== (initialData.description || "") ||
      JSON.stringify(socialLinks) !==
        JSON.stringify(initialData.socialLinks || { ig: "", FB: "", YT: "" }) ||
      image !== null
    );
  }, [description, image, initialData, isEdit, name, socialLinks]);

  const handleBack = useConfirmNavigateBack("/broadcasters", isDirty);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!hasRichTextContent(description)) {
      newErrors.description = "Description is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (isEdit) {
        if (name !== initialData.name) formData.append("name", name);
        if (description !== initialData.description) {
          formData.append("description", description);
        }
        if (
          JSON.stringify(socialLinks) !==
          JSON.stringify(initialData.socialLinks || { ig: "", FB: "", YT: "" })
        ) {
          formData.append("socialLinks", JSON.stringify(socialLinks));
        }
        if (image) formData.append("image", image);

        await axiosInstance.put(`/broadcaster/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Broadcaster updated successfully");
      } else {
        formData.append("name", name);
        formData.append("description", description);
        formData.append("channelId", user?.channelId);
        if (image) formData.append("image", image);
        formData.append(
          "socialLinks",
          JSON.stringify({
            ig: socialLinks.ig || "",
            FB: socialLinks.FB || "",
            YT: socialLinks.YT || "",
          })
        );

        await axiosInstance.post("/broadcaster", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Broadcaster added successfully");
      }

      navigate("/broadcasters");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "add"} broadcaster`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <Breadcrumb title={isEdit ? "Edit Broadcaster" : "Add Broadcaster"} />
        <div className="card">
          <div className="card-body text-center p-4">Loading...</div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <ToastContainer />
      <Breadcrumb title={isEdit ? "Edit Broadcaster" : "Add Broadcaster"} />
      <div className="card">
        <div className="card-body">
          <FormPageHeader
            title={isEdit ? "Edit Broadcaster" : "Add New Broadcaster"}
            onBack={handleBack}
          />

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
              <RichTextEditor
                value={description}
                onChange={setDescription}
                invalid={!!errors.description}
              />
              {errors.description ? (
                <div className="invalid-feedback d-block">
                  {errors.description}
                </div>
              ) : null}
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

            {preview ? (
              <div className="mb-2">
                <Image
                  src={preview}
                  rounded
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              </div>
            ) : null}

            <Form.Group className="mb-4">
              <Form.Label>Image (optional)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImage(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Adding..."
                  : isEdit
                    ? "Update Broadcaster"
                    : "Add Broadcaster"}
              </Button>
              <Button type="button" variant="secondary" onClick={handleBack}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </MasterLayout>
  );
};

export default BroadcasterFormPage;
