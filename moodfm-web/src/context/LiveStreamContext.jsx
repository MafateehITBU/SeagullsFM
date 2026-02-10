import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const LIVE_STREAM_URL = "https://securestreams2.autopo.st:1241/live";

const LiveStreamContext = createContext(null);

export const LiveStreamProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(LIVE_STREAM_URL);
      audio.crossOrigin = "anonymous";
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("error", (e) => {
        console.error("Live stream error:", e);
        setIsPlaying(false);
      });
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Play failed:", err));
    }
  };

  const value = { isPlaying, togglePlay };
  return (
    <LiveStreamContext.Provider value={value}>
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = () => {
  const ctx = useContext(LiveStreamContext);
  if (!ctx) throw new Error("useLiveStream must be used within LiveStreamProvider");
  return ctx;
};
