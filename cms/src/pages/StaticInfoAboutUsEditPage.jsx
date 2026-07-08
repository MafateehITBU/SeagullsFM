import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import FormPageHeader from "../components/FormPageHeader";
import RichTextEditor from "../components/RichTextEditor";
import useConfirmNavigateBack from "../hooks/useConfirmNavigateBack";
import axiosInstance from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

const StaticInfoAboutUsEditPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [initialValue, setInitialValue] = useState("");
  const [aboutUs, setAboutUs] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchStaticInfo = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/staticinfo");
        const matched = (res.data.data || []).find(
          (item) =>
            item.channelId &&
            (item.channelId._id === user.channelId ||
              item.channelId === user.channelId)
        );

        const value = matched?.aboutUS || "";
        setInitialValue(value);
        setAboutUs(value);
      } catch (error) {
        toast.error("Failed to load About Us content");
        navigate("/static-info");
      } finally {
        setLoading(false);
      }
    };

    if (user?.channelId) fetchStaticInfo();
  }, [navigate, user?.channelId]);

  const isDirty = useMemo(
    () => aboutUs !== initialValue,
    [aboutUs, initialValue]
  );

  const handleBack = useConfirmNavigateBack("/static-info", isDirty);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("aboutUS", aboutUs);

      await axiosInstance.put(`/staticinfo/${user.channelId}`, formData);
      toast.success("About Us updated successfully");
      navigate("/static-info");
    } catch (error) {
      toast.error("Failed to update About Us");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <Breadcrumb title="Edit About Us" />
        <div className="card">
          <div className="card-body text-center p-4">Loading...</div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <ToastContainer />
      <Breadcrumb title="Edit About Us" />
      <div className="card">
        <div className="card-body">
          <FormPageHeader title="Edit About Us" onBack={handleBack} />

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>About Us</Form.Label>
              <RichTextEditor
                value={aboutUs}
                onChange={setAboutUs}
                minHeight={360}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
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

export default StaticInfoAboutUsEditPage;
