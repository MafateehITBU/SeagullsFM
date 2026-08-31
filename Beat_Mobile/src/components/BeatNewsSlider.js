import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_CONFIG, BEAT_FM_CHANNEL_NAME } from '../config/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import TextWithSymbolFallback from './TextWithSymbolFallback';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.82;
const CARD_SPACING = 12;

export default function BeatNewsSlider() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/news`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const filtered = data.data.filter(
          (item) => item.channelId?.name === BEAT_FM_CHANNEL_NAME
        );
        setNews(filtered);
      }
    } catch (e) {
      console.warn('[BeatNews]', e.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current && index >= 0 && index < news.length) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + CARD_SPACING),
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.accentCyan} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.sectionKicker}>News</Text>
      <Text style={styles.sectionTitle}>Latest stories & highlights</Text>
      <Text style={styles.sectionSubtitle}>
        Updates from Beat FM and the world of music
      </Text>

      {news.length === 0 ? (
        <Text style={styles.emptyText}>Check back soon for the latest news.</Text>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
          >
            {news.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}
              >
                <View style={styles.imageWrap}>
                  {(item.images?.[0]?.url ?? item.image?.url) ? (
                    <Image
                      source={{ uri: item.images?.[0]?.url ?? item.image?.url }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]} />
                  )}
                </View>
                <View style={styles.cardBody}>
                  <TextWithSymbolFallback style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </TextWithSymbolFallback>
                  {item.description ? (
                    <TextWithSymbolFallback style={styles.cardDesc} numberOfLines={3}>
                      {item.description}
                    </TextWithSymbolFallback>
                  ) : null}
                  <Text style={styles.readMore}>Read more</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {news.length > 1 ? (
            <View style={styles.arrows}>
              <TouchableOpacity
                style={[styles.arrowBtn, currentIndex === 0 && styles.arrowDisabled]}
                onPress={() => scrollToIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={24} color={colors.accentCyan} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.arrowBtn,
                  currentIndex === news.length - 1 && styles.arrowDisabled,
                ]}
                onPress={() => scrollToIndex(currentIndex + 1)}
                disabled={currentIndex === news.length - 1}
              >
                <Ionicons name="chevron-forward" size={24} color={colors.accentCyan} />
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('News')}
          >
            <Text style={styles.viewAllText}>View all news</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  loadingWrap: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  sectionKicker: {
    fontFamily: fonts.gothamBlack,
    fontSize: 14,
    color: colors.accentCyan,
    letterSpacing: 4,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.gothamBlack,
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontFamily: fonts.gotham,
    fontSize: 15,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emptyText: {
    fontFamily: fonts.gotham,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_SPACING,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageWrap: {
    height: 180,
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#222',
  },
  cardBody: {
    padding: spacing.md,
  },
  cardTitle: {
    fontFamily: fonts.museoBold,
    fontSize: 20,
    color: colors.text,
    lineHeight: 26,
    marginBottom: spacing.sm,
  },
  cardDesc: {
    fontFamily: fonts.gotham,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  readMore: {
    fontFamily: fonts.gothamBold,
    fontSize: 13,
    color: colors.accentCyan,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  arrows: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: spacing.md,
  },
  arrowBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  viewAllBtn: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },
  viewAllText: {
    fontFamily: fonts.gothamBold,
    fontSize: 14,
    color: colors.accentCyan,
    letterSpacing: 0.5,
  },
});
