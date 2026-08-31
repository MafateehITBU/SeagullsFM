import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG, BEAT_FM_CHANNEL_NAME } from '../config/api';

const StaticInfoContext = createContext(null);

export function StaticInfoProvider({ children }) {
  const [staticInfo, setStaticInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStaticInfo() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_CONFIG.baseURL}/staticinfo`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        if (cancelled) return;

        if (!json.success || !Array.isArray(json.data)) {
          setStaticInfo(null);
          return;
        }

        const beatFm = json.data.find(
          (item) => item.channelId && item.channelId.name === BEAT_FM_CHANNEL_NAME
        );
        setStaticInfo(beatFm || null);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setStaticInfo(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStaticInfo();
    return () => { cancelled = true; };
  }, []);

  const value = {
    staticInfo,
    loading,
    error,
    channelId: staticInfo?.channelId?._id ?? staticInfo?.channelId ?? null,
    socialMediaLinks: staticInfo?.socialMediaLinks ?? null,
    aboutUS: staticInfo?.aboutUs ?? staticInfo?.aboutUS ?? null,
    frequency: staticInfo?.frequency ?? null,
    frequencyimg: staticInfo?.frequencyimg ?? null,
    phoneNumber: staticInfo?.phoneNumber ?? null,
    email: staticInfo?.email ?? null,
    address: staticInfo?.address ?? null,
    appStore: staticInfo?.appStore ?? null,
    googlePlay: staticInfo?.googlePlay ?? null,
  };

  return (
    <StaticInfoContext.Provider value={value}>
      {children}
    </StaticInfoContext.Provider>
  );
}

export function useStaticInfo() {
  const ctx = useContext(StaticInfoContext);
  if (!ctx) throw new Error('useStaticInfo must be used within StaticInfoProvider');
  return ctx;
}
