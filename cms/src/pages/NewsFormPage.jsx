import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import FormPageHeader from "../components/FormPageHeader";
import RichTextEditor from "../components/RichTextEditor";
import useConfirmNavigateBack from "../hooks/useConfirmNavigateBack";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";
import { hasRichTextContent } from "../utils/richTextUtils";

const NewsFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [initialData, setInitialData] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deletedPublicIds, setDeletedPublicIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingImages = initialData?.images || [];
  const keptImages = existingImages.filter(
    (img) => !deletedPublicIds.includes(img.public_id)
  );

  useEffect(() => {
    if (!isEdit) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/news");
        const newsItem = (res.data.data || []).find((item) => item._id === id);

        if (!newsItem) {
          toast.error("News article not found");
          navigate("/news");
          return;
        }

        setInitialData(newsItem);
        setTitle(newsItem.title || "");
        setDescription(newsItem.description || "");
        setContent(newsItem.content || "");
      } catch (error) {
        toast.error("Failed to load news article");
        navigate("/news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, isEdit, navigate]);

  const isDirty = useMemo(() => {
    if (!isEdit) {
      return (
        title.trim() !== "" ||
        description.trim() !== "" ||
        hasRichTextContent(content) ||
        images.length > 0
      );
    }

    if (!initialData) return false;

    return (
      title !== (initialData.title || "") ||
      description !== (initialData.description || "") ||
      content !== (initialData.content || "") ||
      newImages.length > 0 ||
      deletedPublicIds.length > 0
    );
  }, [
    content,
    deletedPublicIds.length,
    description,
    images.length,
    initialData,
    isEdit,
    newImages.length,
    title,
  ]);

  const handleBack = useConfirmNavigateBack("/news", isDirty);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!hasRichTextContent(content)) newErrors.content = "Content is required";
    if (!isEdit && images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    if (isEdit && keptImages.length === 0 && newImages.length === 0) {
      newErrors.images = "At least one image is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRemoveExisting = (publicId) => {
    setDeletedPublicIds((prev) =>
      prev.includes(publicId) ? prev : [...prev, publicId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      if (isEdit) {
        formData.append("title", title);
        formData.append("description", description);
        formData.append("content", content);
        if (deletedPublicIds.length > 0) {
          formData.append("deletedImages", JSON.stringify(deletedPublicIds));
        }
        newImages.forEach((file) => formData.append("images", file));

        await axiosInstance.put(`/news/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("News updated successfully");
      } else {
        formData.append("title", title);
        formData.append("description", description);
        formData.append("content", content);
        formData.append("channelId", user?.channelId);
        images.forEach((imageFile) => formData.append("images", imageFile));

        await axiosInstance.post("/news", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("News added successfully");
      }

      navigate("/news");
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} news`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <Breadcrumb title={isEdit ? "Edit News" : "Add News"} />
        <div className="card">
          <div className="card-body text-center p-4">Loading...</div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <ToastContainer />
      <Breadcrumb title={isEdit ? "Edit News" : "Add News"} />
      <div className="card">
        <div className="card-body">
          <FormPageHeader
            title={isEdit ? "Edit News Article" : "Add News Article"}
            onBack={handleBack}
          />

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

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                invalid={!!errors.content}
                minHeight={320}
              />
              {errors.content ? (
                <div className="invalid-feedback d-block">{errors.content}</div>
              ) : null}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Images</Form.Label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {isEdit
                  ? keptImages.map((img, index) => (
                      <div key={img.public_id || index} className="position-relative">
                        <img
                          src={img.url}
                          alt={`Existing ${index + 1}`}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 6,
                            border: "1px solid #dee2e6",
                          }}
                        />
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 translate-middle"
                          style={{ padding: "0 4px", fontSize: 10 }}
                          onClick={() => handleRemoveExisting(img.public_id)}
                          aria-label="Remove image"
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  : null}
                {(isEdit ? newImages : images).map((file, index) => (
                  <div key={`new-${index}`} className="position-relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New ${index + 1}`}
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #0d6efd",
                      }}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 translate-middle"
                      style={{ padding: "0 4px", fontSize: 10 }}
                      onClick={() => {
                        if (isEdit) {
                          setNewImages((prev) =>
                            prev.filter((_, idx) => idx !== index)
                          );
                        } else {
                          setImages((prev) =>
                            prev.filter((_, idx) => idx !== index)
                          );
                        }
                      }}
                      aria-label="Remove image"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (isEdit) {
                    setNewImages((prev) => [...prev, ...files]);
                  } else {
                    setImages((prev) => [...prev, ...files]);
                  }
                  e.target.value = "";
                }}
                isInvalid={!!errors.images}
              />
              <Form.Control.Feedback type="invalid">
                {errors.images}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Adding..."
                  : isEdit
                    ? "Update News"
                    : "Add News"}
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

export default NewsFormPage;
