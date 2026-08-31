import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

const LIVE_STREAM_URL = 'https://securestreams2.autopo.st:1242/live';

const LiveStreamContext = createContext(null);

async function configureBackgroundAudio() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export function LiveStreamProvider({ children }) {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    configureBackgroundAudio().catch(() => {});
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
        if (soundRef.current) await soundRef.current.pauseAsync();
        setIsPlaying(false);
        return;
      }
      setIsLoading(true);
      await configureBackgroundAudio();
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: LIVE_STREAM_URL },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LiveStreamContext.Provider value={{ isPlaying, isLoading, toggle }}>
      {children}
    </LiveStreamContext.Provider>
  );
}

export function useLiveStream() {
  const ctx = useContext(LiveStreamContext);
  if (!ctx) throw new Error('useLiveStream must be used within LiveStreamProvider');
  return ctx;
}
