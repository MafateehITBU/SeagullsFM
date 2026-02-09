/**
 * Static info for MoodFM channel from /api/staticinfo.
 * Fetches once on mount, filters for channelId.name === 'MoodFM', stores in context.
 *
 * Usage: const { staticInfo, socialMediaLinks, aboutUS, frequency, downloadApp, ... } = useStaticInfo();
 * Use wherever needed: About screen, footer, app store links, contact, etc.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

const MOOD_FM_CHANNEL = 'MoodFM';

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
        const url = `${API_CONFIG.baseURL}/staticinfo`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const json = await response.json();
        if (cancelled) return;

        if (!json.success || !Array.isArray(json.data)) {
          setStaticInfo(null);
          return;
        }

        const moodFm = json.data.find(
          (item) => item.channelId && item.channelId.name === MOOD_FM_CHANNEL
        );
        setStaticInfo(moodFm || null);
      } catch (e) {
        if (!cancelled) {
          setError(e);
          setStaticInfo(null);
          console.warn('[StaticInfo] Failed to fetch:', e.message);
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
    // Convenience getters for MoodFM-only data
    socialMediaLinks: staticInfo?.socialMediaLinks ?? null,
    downloadApp: staticInfo?.downloadApp ?? null,
    aboutUS: staticInfo?.aboutUS ?? null,
    frequency: staticInfo?.frequency ?? null,
    frequencyimg: staticInfo?.frequencyimg ?? null,
    favIcon: staticInfo?.favIcon ?? null,
    phoneNumber: staticInfo?.phoneNumber ?? null,
    email: staticInfo?.email ?? null,
    address: staticInfo?.address ?? null,
    metaTags: staticInfo?.metaTags ?? null,
    metaDescription: staticInfo?.metaDescription ?? null,
  };

  return (
    <StaticInfoContext.Provider value={value}>
      {children}
    </StaticInfoContext.Provider>
  );
}

export function useStaticInfo() {
  const ctx = useContext(StaticInfoContext);
  if (!ctx) {
    throw new Error('useStaticInfo must be used within StaticInfoProvider');
  }
  return ctx;
}
