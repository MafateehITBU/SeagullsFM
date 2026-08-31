import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import Navbar from '../../components/Navbar';
import BeatProgramsSlider from '../../components/BeatProgramsSlider';
import BeatNewsSlider from '../../components/BeatNewsSlider';
import { useLiveStream } from '../../context/LiveStreamContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const { isPlaying, isLoading, toggle } = useLiveStream();
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(40)).current;
  const buttonSlide = useRef(new Animated.Value(60)).current;
  const programsFade = useRef(new Animated.Value(0)).current;
  const newsFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(heroSlide, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(buttonSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(programsFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(newsFade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Image
            source={require('../../../assets/img/home/hero-bg.png')}
            style={styles.heroBg}
            resizeMode="cover"
          />
          <Animated.View
            style={[
              styles.heroContent,
              { opacity: heroFade, transform: [{ translateY: heroSlide }] },
            ]}
          >
            <Text style={styles.heroCopy}>
              turn it up.{'\n'}feel the{'\n'}
              <Text style={styles.heroBeat}>beat.</Text>
            </Text>
            <Image
              source={require('../../../assets/img/Frequency.png')}
              style={styles.frequencyImg}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={[styles.listenWrap, { transform: [{ translateY: buttonSlide }] }]}
          >
            <TouchableOpacity
              style={styles.listenButton}
              onPress={toggle}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <View style={styles.listenLeft}>
                <Text style={styles.listenLeftText}>
                  {isLoading ? '...' : isPlaying ? 'PAUSE' : 'LISTEN'}
                </Text>
              </View>
              <View style={styles.listenRight}>
                <Text style={styles.listenRightText}>LIVE</Text>
                <Animated.Image
                  source={require('../../../assets/img/home/b-white.png')}
                  style={[styles.playIcon, { transform: [{ scale: pulseAnim }] }]}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View style={{ opacity: programsFade }}>
          <BeatProgramsSlider />
        </Animated.View>

        <Animated.View style={{ opacity: newsFade }}>
          <BeatNewsSlider />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    width: screenWidth,
    opacity: 0.35,
  },
  heroContent: {
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 200,
  },
  heroCopy: {
    flex: 1,
    fontFamily: fonts.gothamBlack,
    fontSize: 38,
    lineHeight: 34,
    color: colors.text,
    letterSpacing: -1.5,
    textTransform: 'lowercase',
  },
  heroBeat: {
    fontFamily: fonts.gothamBlack,
    color: '#ff3fff',
  },
  frequencyImg: {
    width: 120,
    height: 80,
    marginLeft: spacing.sm,
  },
  listenWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  listenButton: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    borderRadius: 4,
    overflow: 'hidden',
  },
  listenLeft: {
    flex: 0.62,
    backgroundColor: colors.listenPink,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  listenLeftText: {
    fontFamily: fonts.gothamBlack,
    fontSize: 28,
    color: '#000',
    letterSpacing: -1.5,
    textTransform: 'uppercase',
  },
  listenRight: {
    flex: 0.38,
    backgroundColor: colors.liveBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  listenRightText: {
    fontFamily: fonts.gothamBlack,
    fontSize: 28,
    color: colors.text,
    letterSpacing: -1.5,
    textTransform: 'uppercase',
  },
  playIcon: {
    width: 36,
    height: 36,
  },
});
