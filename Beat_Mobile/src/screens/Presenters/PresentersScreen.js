import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Navbar from '../../components/Navbar';
import BeatProgramArtwork from '../../components/BeatProgramArtwork';
import BeatGradientText from '../../components/BeatGradientText';
import TextWithSymbolFallback from '../../components/TextWithSymbolFallback';
import RichTextContent from '../../components/RichTextContent';
import { renderProgramTitle } from '../../utils/renderProgramTitle';
import { API_CONFIG, BEAT_FM_CHANNEL_NAME } from '../../config/api';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;

export default function PresentersScreen() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
    fetchPrograms();
  }, []);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -currentSlide * CARD_WIDTH,
      useNativeDriver: true,
      friction: 9,
      tension: 50,
    }).start();
  }, [currentSlide]);

  useEffect(() => {
    if (currentSlide > programs.length - 1) setCurrentSlide(0);
  }, [programs, currentSlide]);

  useEffect(() => {
    if (programs.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === programs.length - 1 ? 0 : prev + 1));
    }, 9000);
    return () => clearInterval(timer);
  }, [programs.length]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseURL}/program`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const filtered = (data.data ?? []).filter(
        (p) => p.channelId?.name === BEAT_FM_CHANNEL_NAME && p.isActive !== false
      );
      setPrograms(filtered);
    } catch (e) {
      setError(e);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? programs.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === programs.length - 1 ? 0 : prev + 1));
  };

  const currentProgram = programs[currentSlide];

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: heroFade, transform: [{ translateY: heroSlide }] },
          ]}
        >
          <BeatGradientText style={styles.heroTitle}>
            Meet{'\n'}Our{'\n'}Presenters
          </BeatGradientText>
          <Image
            source={require('./assets/web-13.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        <View style={styles.programsSection}>
          {loading ? (
            <View style={styles.stateWrap}>
              <ActivityIndicator color={colors.accentCyan} />
              <Text style={styles.stateText}>Loading programs…</Text>
            </View>
          ) : null}

          {error ? (
            <Text style={styles.errorText}>Failed to load programs.</Text>
          ) : null}

          {!loading && !error && programs.length === 0 ? (
            <Text style={styles.stateText}>No programs available.</Text>
          ) : null}

          {!loading && !error && programs.length > 0 ? (
            <>
              <View style={styles.carouselOuter}>
                <Animated.View
                  style={[styles.carouselTrack, { transform: [{ translateX: slideAnim }] }]}
                >
                  {programs.map((program, idx) => (
                    <View key={program._id ?? idx} style={styles.card}>
                      <BeatProgramArtwork
                        imageUrl={program.image?.url}
                        title={program.title}
                        style={styles.artwork}
                      />
                    </View>
                  ))}
                </Animated.View>

                {programs.length > 1 ? (
                  <>
                    <TouchableOpacity style={styles.navBtnLeft} onPress={handlePrev}>
                      <Text style={styles.navBtnText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navBtnRight} onPress={handleNext}>
                      <Text style={styles.navBtnText}>›</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
              </View>

              <View style={styles.programInfo}>
                {renderProgramTitle(
                  currentProgram?.title,
                  styles.programTitle,
                  styles.programTitleBold
                )}
                {currentProgram?.description ? (
                  <RichTextContent
                    html={currentProgram.description}
                    style={styles.programDescription}
                  />
                ) : null}
              </View>

              {programs.length > 1 ? (
                <View style={styles.dots}>
                  {programs.map((program, idx) => (
                    <TouchableOpacity key={program._id ?? idx} onPress={() => setCurrentSlide(idx)}>
                      <View style={[styles.dot, idx === currentSlide && styles.dotActive]} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
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
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  heroTitle: {
    fontSize: 44,
    lineHeight: 40,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  heroImage: {
    width: Math.min(screenWidth * 0.45, 200),
    height: Math.min(screenWidth * 0.55, 240),
    flexShrink: 0,
  },
  programsSection: {
    paddingHorizontal: spacing.md,
  },
  stateWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  stateText: {
    fontFamily: fonts.gotham,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.gotham,
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  carouselOuter: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 24,
  },
  carouselTrack: {
    flexDirection: 'row',
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  artwork: {
    width: '70%',
    maxWidth: 320,
  },
  programInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  programTitle: {
    fontFamily: fonts.gothamBlack,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  programTitleBold: {
    fontFamily: fonts.gothamBold,
    fontSize: 24,
    color: colors.text,
  },
  programDescription: {
    fontFamily: fonts.gotham,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(248,248,248,0.9)',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  navBtnLeft: {
    position: 'absolute',
    left: 8,
    top: '40%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnRight: {
    position: 'absolute',
    right: 8,
    top: '40%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontFamily: fonts.gothamBlack,
    fontSize: 24,
    color: colors.accentCyan,
    marginTop: -2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.accentCyan,
  },
});
