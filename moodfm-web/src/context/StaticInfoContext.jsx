import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const StaticInfoContext = createContext(null);

/** Channel name we use for this app – only MoodFM static info is used */
const MOOD_FM_CHANNEL = "MoodFM";

/**
 * Maps raw static info API item (one channel) to app shape.
 * API returns: frequencyimg { url }, downloadApp { AppStore, GooglePlay }, favIcon { url, width?, height? }, etc.
 */
function mapStaticInfoFromApi(item) {
  if (!item) return null;
  return {
    channelId: item.channelId?._id ?? null,
    channelName: item.channelId?.name ?? null,
    aboutUs: item.aboutUS ?? item.aboutUs ?? null,
    frequency: item.frequency ?? null,
    frequencyimg: item.frequencyimg?.url ?? null,
    address: item.address ?? null,
    appStore: item.downloadApp?.AppStore ?? null,
    googlePlay: item.downloadApp?.GooglePlay ?? null,
    email: item.email ?? null,
    phoneNumber: item.phoneNumber ?? null,
    favIcon: item.favIcon?.url ?? null,
    socialMediaLinks: item.socialMediaLinks ?? null,
    metaDescription: item.metaDescription ?? null,
    metaTags: item.metaTags ?? null,
  };
}

export const StaticInfoProvider = ({ children }) => {
  const [staticInfo, setStaticInfo] = useState({
    channelId: null,
    channelName: null,
    aboutUs: null,
    frequency: null,
    frequencyimg: null,
    address: null,
    appStore: null,
    googlePlay: null,
    email: null,
    phoneNumber: null,
    favIcon: null,
    socialMediaLinks: null,
    metaDescription: null,
    metaTags: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStaticInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/staticinfo");
        const list = response.data.data;
        const moodFMInfo = Array.isArray(list)
          ? list.find((info) => info.channelId?.name === MOOD_FM_CHANNEL)
          : null;
        setStaticInfo(mapStaticInfoFromApi(moodFMInfo) ?? null);
      } catch (err) {
        console.error("Error fetching static info:", err);
        setError(err);
        setStaticInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStaticInfo();
  }, []);

  const value = {
    staticInfo,
    loading,
    error,
    refetch: async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get("/staticinfo");
        const list = response.data.data;
        const moodFMInfo = Array.isArray(list)
          ? list.find((info) => info.channelId?.name === MOOD_FM_CHANNEL)
          : null;
        setStaticInfo(mapStaticInfoFromApi(moodFMInfo) ?? null);
      } catch (err) {
        console.error("Error refetching static info:", err);
        setError(err);
        setStaticInfo(null);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <StaticInfoContext.Provider value={value}>
      {children}
    </StaticInfoContext.Provider>
  );
};

export const useStaticInfo = () => {
  const context = useContext(StaticInfoContext);
  if (!context) {
    throw new Error("useStaticInfo must be used within a StaticInfoProvider");
  }
  return context;
};

