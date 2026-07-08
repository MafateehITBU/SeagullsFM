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

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ProgramFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [initialData, setInitialData] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [image, setImage] = useState(null);
  const [programDetailsImage, setProgramDetailsImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewDetailsImage, setPreviewDetailsImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    const fetchProgram = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/program");
        const program = (res.data.data || []).find((item) => item._id === id);

        if (!program) {
          toast.error("Program not found");
          navigate("/programs");
          return;
        }

        setInitialData(program);
        setTitle(program.title || "");
        setDescription(program.description || "");
        setDays(
          Array.isArray(program.days)
            ? program.days
            : program.day
              ? [program.day]
              : []
        );
        setStartTime(program.startTime || "");
        setEndTime(program.endTime || "");
        setPreview(program.image?.url || null);
        setPreviewDetailsImage(program.programDetailsImage?.url || null);
      } catch (error) {
        toast.error("Failed to load program");
        navigate("/programs");
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id, isEdit, navigate]);

  const handleDayChange = (day) => {
    setDays((prevDays) =>
      prevDays.includes(day)
        ? prevDays.filter((item) => item !== day)
        : [...prevDays, day]
    );
  };

  const isDirty = useMemo(() => {
    if (!isEdit) {
      return (
        title.trim() !== "" ||
        hasRichTextContent(description) ||
        days.length > 0 ||
        startTime.trim() !== "" ||
        endTime.trim() !== "" ||
        image !== null ||
        programDetailsImage !== null
      );
    }

    if (!initialData) return false;

    const initialDays = Array.isArray(initialData.days)
      ? initialData.days
      : initialData.day
        ? [initialData.day]
        : [];

    return (
      title !== (initialData.title || "") ||
      description !== (initialData.description || "") ||
      JSON.stringify([...days].sort()) !==
        JSON.stringify([...initialDays].sort()) ||
      startTime !== (initialData.startTime || "") ||
      endTime !== (initialData.endTime || "") ||
      image !== null ||
      programDetailsImage !== null
    );
  }, [
    days,
    description,
    endTime,
    image,
    initialData,
    isEdit,
    programDetailsImage,
    startTime,
    title,
  ]);

  const handleBack = useConfirmNavigateBack("/programs", isDirty);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!hasRichTextContent(description)) {
      newErrors.description = "Description is required";
    }
    if (days.length === 0) newErrors.days = "At least one day is required";
    if (!startTime.trim()) newErrors.startTime = "Start Time is required";
    if (!endTime.trim()) newErrors.endTime = "End Time is required";
    if (!isEdit && !image) newErrors.image = "Image is required";
    if (!isEdit && !programDetailsImage) {
      newErrors.programDetailsImage = "Program Details Image is required";
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
        if (title !== initialData.title) formData.append("title", title);
        if (description !== initialData.description) {
          formData.append("description", description);
        }

        const initialDays = Array.isArray(initialData.days)
          ? initialData.days
          : initialData.day
            ? [initialData.day]
            : [];
        const daysChanged =
          JSON.stringify([...days].sort()) !==
          JSON.stringify([...initialDays].sort());
        if (daysChanged) formData.append("days", JSON.stringify(days));

        if (startTime !== initialData.startTime) {
          formData.append("startTime", startTime);
        }
        if (endTime !== initialData.endTime) {
          formData.append("endTime", endTime);
        }
        if (image) formData.append("image", image);
        if (programDetailsImage) {
          formData.append("programDetailsImage", programDetailsImage);
        }

        await axiosInstance.put(`/program/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Program updated successfully");
      } else {
        formData.append("title", title);
        formData.append("description", description);
        formData.append("days", JSON.stringify(days));
        formData.append("startTime", startTime);
        formData.append("endTime", endTime);
        formData.append("channelId", user?.channelId);
        if (image) formData.append("image", image);
        if (programDetailsImage) {
          formData.append("programDetailsImage", programDetailsImage);
        }

        await axiosInstance.post("/program", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Program added successfully");
      }

      navigate("/programs");
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to ${isEdit ? "update" : "add"} program`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <Breadcrumb title={isEdit ? "Edit Program" : "Add Program"} />
        <div className="card">
          <div className="card-body text-center p-4">Loading...</div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <ToastContainer />
      <Breadcrumb title={isEdit ? "Edit Program" : "Add Program"} />
      <div className="card">
        <div className="card-body">
          <FormPageHeader
            title={isEdit ? "Edit Program" : "Add New Program"}
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
              <Form.Label>Days</Form.Label>
              <Row>
                {ALL_DAYS.map((day) => (
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
              {errors.days ? (
                <div className="invalid-feedback d-block">{errors.days}</div>
              ) : null}
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
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
                <Form.Group>
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

            {preview ? (
              <div className="mb-2">
                <Image
                  src={preview}
                  rounded
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              </div>
            ) : null}

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImage(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
                isInvalid={!!errors.image}
              />
              <Form.Control.Feedback type="invalid">
                {errors.image}
              </Form.Control.Feedback>
            </Form.Group>

            {previewDetailsImage ? (
              <div className="mb-2">
                <Image
                  src={previewDetailsImage}
                  rounded
                  style={{ width: "100px", height: "100px", objectFit: "cover" }}
                />
              </div>
            ) : null}

            <Form.Group className="mb-4">
              <Form.Label>Program Details Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProgramDetailsImage(file);
                  if (file) setPreviewDetailsImage(URL.createObjectURL(file));
                }}
                isInvalid={!!errors.programDetailsImage}
              />
              <Form.Control.Feedback type="invalid">
                {errors.programDetailsImage}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Adding..."
                  : isEdit
                    ? "Update Program"
                    : "Add Program"}
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

export default ProgramFormPage;
