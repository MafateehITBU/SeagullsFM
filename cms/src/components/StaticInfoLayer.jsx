import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosConfig";
import { Icon } from "@iconify/react";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Static fields definition
const STATIC_FIELDS = [
  { key: "favIcon", label: "Fav Icon", type: "image" },
  { key: "aboutUS", label: "About Us", type: "textarea" },
  { key: "frequency", label: "Frequency", type: "text" },
  { key: "frequencyimg", label: "Frequency Image", type: "image" },
  { key: "metaTags", label: "Meta Tags", type: "text" },
  { key: "metaDescription", label: "Meta Description", type: "textarea" },
  { key: "phoneNumber", label: "Phone", type: "text" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Address", type: "textarea" },
];

const StaticInfoLayer = () => {
  const { user } = useAuth();

  const [staticInfo, setStaticInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [fileValue, setFileValue] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);

  /*  FETCH  */
  useEffect(() => {
    if (user?.channelId) fetchStaticInfo();
  }, [user?.channelId]);

  const fetchStaticInfo = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/staticinfo");

      const matched = res.data.data.find(
        (item) =>
          item.channelId &&
          (item.channelId._id === user.channelId ||
            item.channelId === user.channelId)
      );

      setStaticInfo(matched || null);
    } catch (err) {
      toast.error("Failed to load static information");
    } finally {
      setLoading(false);
    }
  };

  /*  EDIT  */
  const openEditModal = (fieldKey) => {
    setSelectedField(fieldKey);
    setFieldValue(staticInfo[fieldKey] || "");
    setFileValue(null);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();

      if (fileValue) {
        formData.append(selectedField, fileValue);
      } else {
        formData.append(selectedField, fieldValue);
      }

      await axiosInstance.put(`/staticinfo/${user.channelId}`, formData);

      toast.success("Updated successfully");
      setShowEditModal(false);
      fetchStaticInfo();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (!user?.channelId)
    return <div className="text-center p-4">No FM assigned</div>;
  if (!staticInfo)
    return <div className="text-center p-4">No static info found</div>;

  const selectedFieldConfig = STATIC_FIELDS.find(
    (f) => f.key === selectedField
  );


  return (
    <div className="card">
      <ToastContainer />

      <div className="card-header">
        <h5 className="mb-0">Static Information</h5>
      </div>

      <div className="card-body">
        {STATIC_FIELDS.map((field) => (
          <div
            key={field.key}
            className="d-flex align-items-center border-bottom py-3"
          >
            <div style={{ width: "20%" }}>
              <strong>{field.label}</strong>
            </div>

            <div style={{ width: "60%" }}>
              {field.type === "image" && staticInfo[field.key]?.url ? (
                <img
                  src={staticInfo[field.key].url}
                  alt={field.label}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    cursor: "pointer",
                    objectFit: "cover",
                  }}
                  onClick={() => setPreviewImage(staticInfo[field.key].url)}
                />
              ) : (
                <span>{staticInfo[field.key] || "-"}</span>
              )}
            </div>

            <div style={{ width: "20%", textAlign: "right" }}>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => openEditModal(field.key)}
              >
                <Icon icon="mdi:pencil" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/*  EDIT MODAL  */}
      {showEditModal && (
        <>
          <div className="modal fade show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Edit {selectedFieldConfig?.label}</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  />
                </div>

                <div className="modal-body">
                  {selectedFieldConfig?.type === "image" ? (
                    <>
                      {staticInfo[selectedField]?.url && (
                        <img
                          src={staticInfo[selectedField].url}
                          alt="current"
                          className="mb-3"
                          style={{ width: "100%", borderRadius: 8 }}
                        />
                      )}
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setFileValue(e.target.files[0])}
                      />
                    </>
                  ) : selectedFieldConfig?.type === "textarea" ? (
                    <textarea
                      className="form-control"
                      rows={5}
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={fieldValue}
                      onChange={(e) => setFieldValue(e.target.value)}
                    />
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}

      {/*IMAGE PREVIEW OVERLAY */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: 0,
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 32,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: "100%",
                borderRadius: 10,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticInfoLayer;
