import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { API_CONFIG, BEAT_FM_CHANNEL_NAME } from '../../config/api';
import TextWithSymbolFallback from '../../components/TextWithSymbolFallback';

const { width: screenWidth } = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.lg;
const CARD_GAP = spacing.md;
const INITIAL_VISIBLE = 6;
const LOAD_MORE_COUNT = 6;

const INTRO_LINES = [
  'Latest updates, Stories and highlights from the',
  'world of music',
];

function NewsCard({ item, onPress, index = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageUrl = item.images?.[0]?.url ?? item.image?.url;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 80 + index * 60,
      useNativeDriver: true,
    }).start();
  }, [index]);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardTextCol}>
        <TextWithSymbolFallback style={styles.cardTitle} numberOfLines={4}>
          {item.title}
        </TextWithSymbolFallback>
        <TouchableOpacity onPress={() => onPress(item._id)} activeOpacity={0.8}>
          <Text style={styles.learnMore}>LEARN MORE</Text>
        </TouchableOpacity>
      </View>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
      )}
    </Animated.View>
  );
}

export default function NewsScreen() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_CONFIG.baseURL}/news`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (cancelled) return;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          const filtered = json.data.filter(
            (item) => item.channelId?.name === BEAT_FM_CHANNEL_NAME
          );
          setNews(filtered);
        } else {
          setNews([]);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNews();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleNews = news.slice(0, visibleCount);
  const hasMore = news.length > visibleCount;

  const openDetail = (newsId) => {
    navigation.navigate('NewsDetail', { newsId });
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: heroFade, transform: [{ translateY: heroSlide }] },
          ]}
        >
          <Text style={styles.pageTitle}>NEWS</Text>
          <Text style={styles.intro}>
            {INTRO_LINES[0]}
            {'\n'}
            {INTRO_LINES[1]}
          </Text>
        </Animated.View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={colors.accentCyan} />
            <Text style={styles.stateText}>Loading news…</Text>
          </View>
        ) : null}

        {error ? (
          <Text style={styles.errorText}>Failed to load news.</Text>
        ) : null}

        {!loading && !error && news.length === 0 ? (
          <Text style={styles.stateText}>No news available.</Text>
        ) : null}

        {!loading && !error && news.length > 0 ? (
          <View style={styles.list}>
            {visibleNews.map((item, index) => (
              <NewsCard
                key={item._id}
                item={item}
                onPress={openDetail}
                index={index}
              />
            ))}
          </View>
        ) : null}

        {hasMore ? (
          <TouchableOpacity
            style={styles.showMoreBtn}
            onPress={() =>
              setVisibleCount((count) => Math.min(count + LOAD_MORE_COUNT, news.length))
            }
          >
            <Text style={styles.showMoreText}>SHOW MORE</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sectionGap,
  },
  header: {
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontFamily: fonts.museoBold,
    fontSize: 48,
    color: colors.text,
    letterSpacing: -1,
    lineHeight: 46,
  },
  intro: {
    fontFamily: fonts.gotham,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(248,248,248,0.9)',
    marginTop: spacing.md,
    maxWidth: screenWidth * 0.9,
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
  list: {
    gap: CARD_GAP,
  },
  card: {
    flexDirection: 'row',
    minHeight: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  cardTextCol: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: fonts.gothamBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#000000',
    letterSpacing: -0.3,
  },
  learnMore: {
    fontFamily: fonts.gothamBold,
    fontSize: 12,
    color: '#9fd4ff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  cardImage: {
    width: '50%',
    minHeight: CARD_HEIGHT,
  },
  cardImagePlaceholder: {
    backgroundColor: '#e5e5e5',
  },
  showMoreBtn: {
    alignSelf: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  showMoreText: {
    fontFamily: fonts.gothamBold,
    fontSize: 14,
    color: '#9fd4ff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
