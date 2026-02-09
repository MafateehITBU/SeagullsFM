import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";

const StaticInfoContext = createContext(null);

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
        
        // Filter to only get data where channelId.name === "MoodFM"
        const moodFMInfo = response.data.data?.find(
          (info) => info.channelId?.name === "MoodFM"
        );

        if (moodFMInfo) {
          setStaticInfo({
            channelId: moodFMInfo.channelId?._id,
            channelName: moodFMInfo.channelId?.name,
            aboutUs: moodFMInfo.aboutUS || moodFMInfo.aboutUs,
            frequency: moodFMInfo.frequency,
            frequencyimg: moodFMInfo.frequencyimg?.url,
            address: moodFMInfo.address,
            appStore: moodFMInfo.downloadApp?.AppStore,
            googlePlay: moodFMInfo.downloadApp?.GooglePlay,
            email: moodFMInfo.email,
            favIcon: moodFMInfo.favIcon?.url,
            metaDescription: moodFMInfo.metaDescription,
            metaTags: moodFMInfo.metaTags,
            phoneNumber: moodFMInfo.phoneNumber,
            socialMediaLinks: moodFMInfo.socialMediaLinks,
          });
        } else {
          setStaticInfo(null);
        }
      } catch (error) {
        console.error("Error fetching static info:", error);
        setError(error);
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
        
        const moodFMInfo = response.data.data?.find(
          (info) => info.channelId?.name === "MoodFM"
        );

        if (moodFMInfo) {
          setStaticInfo({
            channelId: moodFMInfo.channelId?._id,
            channelName: moodFMInfo.channelId?.name,
            aboutUs: moodFMInfo.aboutUS || moodFMInfo.aboutUs,
            frequency: moodFMInfo.frequency,
            frequencyimg: moodFMInfo.frequencyimg?.url,
            address: moodFMInfo.address,
            appStore: moodFMInfo.downloadApp?.AppStore,
            googlePlay: moodFMInfo.downloadApp?.GooglePlay,
            email: moodFMInfo.email,
            favIcon: moodFMInfo.favIcon?.url,
            metaDescription: moodFMInfo.metaDescription,
            metaTags: moodFMInfo.metaTags,
            phoneNumber: moodFMInfo.phoneNumber,
            socialMediaLinks: moodFMInfo.socialMediaLinks,
          });
        } else {
          setStaticInfo(null);
        }
      } catch (error) {
        console.error("Error refetching static info:", error);
        setError(error);
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

