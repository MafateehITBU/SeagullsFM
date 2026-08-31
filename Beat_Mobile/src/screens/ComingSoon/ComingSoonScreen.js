import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

const TITLES = {
  About: 'About Us',
  News: 'News',
  Presenters: 'Presenters',
  Login: 'Login',
  Events: 'Events',
  Broadcaster: 'Broadcaster',
  GetDiscovered: 'Get Discovered',
  ShowYourTalent: 'Show Your Talent',
  AdWithUs: 'Advertise With Us',
};

export default function ComingSoonScreen({ route }) {
  const title = TITLES[route?.name] || route?.params?.title || 'This Page';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    );
    float.start();

    const pulseBlobs = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(blob1, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(blob1, { toValue: 0.4, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(blob2, { toValue: 1, duration: 2800, useNativeDriver: true }),
          Animated.timing(blob2, { toValue: 0.3, duration: 2800, useNativeDriver: true }),
        ]),
      ])
    );
    pulseBlobs.start();

    return () => {
      float.stop();
      pulseBlobs.stop();
    };
  }, []);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <View style={styles.container}>
      <Navbar />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.blob, styles.blob1, { opacity: blob1 }]} />
        <Animated.View style={[styles.blob, styles.blob2, { opacity: blob2 }]} />

        <View style={styles.card}>
          <Text style={styles.kicker}>Beat FM</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            We are building something fresh and exciting. This page will be live very soon.
          </Text>

          <Animated.View style={{ transform: [{ translateY: floatY }] }}>
            <View style={styles.artWrap}>
              <Image
                source={require('../../../assets/img/home/b-color.png')}
                style={styles.art}
                resizeMode="contain"
              />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Coming Soon</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(9,216,192,0.2)',
    top: 40,
    left: -20,
  },
  blob2: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(28,134,255,0.2)',
    bottom: 80,
    right: -30,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: spacing.xl,
    alignItems: 'center',
  },
  kicker: {
    fontFamily: fonts.gothamBold,
    fontSize: 12,
    color: colors.accentCyan,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.gothamBlack,
    fontSize: 36,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.gotham,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: 320,
  },
  artWrap: {
    marginTop: spacing.xl,
    width: 260,
    alignItems: 'center',
  },
  art: {
    width: '100%',
    height: 220,
  },
  badge: {
    position: 'absolute',
    top: '40%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: fonts.gothamBold,
    fontSize: 11,
    color: colors.text,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
