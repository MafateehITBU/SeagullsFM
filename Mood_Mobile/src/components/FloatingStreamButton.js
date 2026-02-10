import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLiveStream } from '../context/LiveStreamContext';
import { colors } from '../theme/colors';

/**
 * Small fixed yellow button to play/pause live stream. Shown only when currentRoute !== 'Home'.
 */
export default function FloatingStreamButton({ currentRoute }) {
  const { isPlaying, isLoading, toggle } = useLiveStream();

  if (currentRoute === 'Home') return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.button}
        onPress={toggle}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={colors.navbarText}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 999,
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.navbarBg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
