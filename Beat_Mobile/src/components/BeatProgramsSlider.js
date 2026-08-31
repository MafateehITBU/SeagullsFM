import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BeatProgramArtwork from './BeatProgramArtwork';
import { renderProgramTitle } from '../utils/renderProgramTitle';
import { API_CONFIG, BEAT_FM_CHANNEL_NAME } from '../config/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 32;

const WEEKDAY_SET = new Set(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']);

function formatProgramDays(days) {
  if (!Array.isArray(days) || days.length === 0) return '—';
  const normalized = days.map((d) => String(d).trim().toLowerCase()).filter(Boolean);
  if (normalized.length === 5 && normalized.every((d) => WEEKDAY_SET.has(d))) {
    return 'Weekdays';
  }
  return days.join(', ');
}

function formatTimeForDisplay(time) {
  if (!time || typeof time !== 'string') return null;
  const [hoursRaw, minutesRaw] = time.split(':');
  const hours = Number.parseInt(hoursRaw, 10);
  if (Number.isNaN(hours)) return null;
  const minutes = Number.parseInt(minutesRaw ?? '0', 10);
  const safeMinutes = Number.isNaN(minutes) ? 0 : Math.min(59, Math.max(0, minutes));
  const twelveHour = hours % 12 || 12;
  return {
    time: `${twelveHour}:${String(safeMinutes).padStart(2, '0')}`,
    period: hours >= 12 ? 'PM' : 'AM',
  };
}

function formatProgramTime(startTime, endTime) {
  const start = formatTimeForDisplay(startTime);
  const end = formatTimeForDisplay(endTime);
  if (!start && !end) return '—';
  if (start && !end) return `${start.time} ${start.period}`;
  if (!start && end) return `${end.time} ${end.period}`;
  if (start.period === end.period) return `${start.time} - ${end.time} ${end.period}`;
  return `${start.time} ${start.period} - ${end.time} ${end.period}`;
}

export default function BeatProgramsSlider() {
  const navigation = useNavigation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [loading]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: -currentSlide * CARD_WIDTH,
      useNativeDriver: true,
      friction: 9,
      tension: 50,
    }).start();
  }, [currentSlide]);

  useEffect(() => {
    if (programs.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === programs.length - 1 ? 0 : prev + 1));
    }, 9000);
    return () => clearInterval(timer);
  }, [programs.length]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/program`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const filtered = data.data.filter(
          (p) => p.channelId?.name === BEAT_FM_CHANNEL_NAME && p.isActive !== false
        );
        setPrograms(filtered);
      }
    } catch (e) {
      console.warn('[BeatPrograms]', e.message);
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

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accentCyan} />
        <Text style={styles.loadingText}>Loading shows...</Text>
      </View>
    );
  }

  if (programs.length === 0) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>No programs available.</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
      <Image
        source={require('../../assets/img/home/bottom.png')}
        style={styles.bottomDecor}
        resizeMode="contain"
        pointerEvents="none"
      />

      <View style={styles.carouselOuter}>
        <Animated.View
          style={[styles.carouselTrack, { transform: [{ translateX: slideAnim }] }]}
        >
          {programs.map((program, idx) => (
            <TouchableOpacity
              key={program._id ?? idx}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProgramDetail', { programId: program._id })}
            >
              <BeatProgramArtwork
                imageUrl={program.image?.url}
                title={program.title}
                style={styles.artworkWrap}
              />

              <Text style={styles.mainShowTitle}>Main Show</Text>

              {renderProgramTitle(
                program.title,
                styles.programTitle,
                styles.programTitleBold
              )}
              <Text style={styles.programDays}>{formatProgramDays(program.days)}</Text>
              <Text style={styles.programTime}>
                {formatProgramTime(program.startTime, program.endTime)}
              </Text>
            </TouchableOpacity>
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

      {programs.length > 1 ? (
        <View style={styles.dots}>
          {programs.map((_, idx) => (
            <TouchableOpacity key={idx} onPress={() => setCurrentSlide(idx)}>
              <View style={[styles.dot, idx === currentSlide && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    position: 'relative',
  },
  bottomDecor: {
    position: 'absolute',
    right: -spacing.md,
    bottom: 0,
    width: screenWidth * 0.7,
    height: 180,
    opacity: 0.9,
    zIndex: 0,
  },
  loadingWrap: {
    padding: spacing.xl,
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontFamily: fonts.gotham,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  carouselOuter: {
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  carouselTrack: {
    flexDirection: 'row',
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  artworkWrap: {
    width: '70%',
    maxWidth: 320,
    marginBottom: spacing.md,
  },
  mainShowTitle: {
    fontFamily: fonts.gothamBlack,
    fontSize: 28,
    color: colors.accentCyan,
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  programTitle: {
    fontFamily: fonts.museo,
    fontSize: 22,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  programTitleBold: {
    fontFamily: fonts.museoBold,
    fontSize: 22,
    color: colors.text,
  },
  programDays: {
    fontFamily: fonts.gothamBold,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.md,
    letterSpacing: 0.5,
  },
  programTime: {
    fontFamily: fonts.gothamBlack,
    fontSize: 16,
    color: 'rgba(248,248,248,0.9)',
    marginTop: 4,
  },
  navBtnLeft: {
    position: 'absolute',
    left: 4,
    top: '35%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnRight: {
    position: 'absolute',
    right: 4,
    top: '35%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: {
    fontFamily: fonts.gothamBlack,
    fontSize: 28,
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
