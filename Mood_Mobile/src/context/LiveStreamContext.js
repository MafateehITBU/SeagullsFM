/**
 * Single live stream instance for the app. Prevents double play and keeps
 * stream playing across screens. Use for Home hero button and floating button on other pages.
 */
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Audio } from 'expo-av';

const LIVE_STREAM_URL = 'https://securestreams2.autopo.st:1241/live';

const LiveStreamContext = createContext(null);

export function LiveStreamProvider({ children }) {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const toggle = async () => {
    if (isLoading) return;
    try {
      if (isPlaying) {
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setIsPlaying(false);
        return;
      }
      if (soundRef.current) {
        setIsLoading(true);
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } else {
        setIsLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri: LIVE_STREAM_URL },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);
      }
    } catch (_) {
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const value = { isPlaying, isLoading, toggle };

  return (
    <LiveStreamContext.Provider value={value}>
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const ctx = useContext(LiveStreamContext);
  if (!ctx) throw new Error('useLiveStream must be used within LiveStreamProvider');
  return ctx;
}
