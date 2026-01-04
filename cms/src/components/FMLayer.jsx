import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";

const FMLayer = () => {
  const [fms, setFms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { setChannelId } = useAuth();

  useEffect(() => {
    fetchFms();
  }, []);

  const fetchFms = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/channel");
      setFms(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching FM stations:", error);
      toast.error("Failed to fetch FM stations");
      setLoading(false);
    }
  };

  const handleFmSelect = (fmId) => {
    setChannelId(fmId);
    navigate("/");
  };

  return (
    <section className="fm-layer">
      <ToastContainer />

      <div className="fm-container">
        <h2 className="fm-title">Choose an FM Station</h2>

        {loading ? (
          <div className="fm-loader">
            <div className="fm-loader-circle" />
            <span className="fm-loader-text">Loading FM Stations</span>
          </div>
        ) : (
          <div className="fm-grid">
            {fms.map((fm) => (
              <div
                key={fm._id}
                className="fm-card"
                onClick={() => handleFmSelect(fm._id)}
              >
                <Icon icon="mdi:radio-tower" className="fm-icon" />
                <span className="fm-name">{fm.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FMLayer;
