import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
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
import { API_CONFIG } from '../../config/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(screenHeight * 0.5, 380);
const CARD_GAP = spacing.md;
const HORIZONTAL_PADDING = spacing.lg;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function NewsCard({ item, onPress, cardWidth, index = 0 }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100 + index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: 100 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        onPress={() => onPress(item._id)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {item.image?.url ? (
            <Image
              source={{ uri: item.image.url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => onPress(item._id)}
          >
            <Text style={styles.readMoreButtonText}>Read More</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NewsScreen() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 600,
        delay: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 600,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchNews() {
      try {
        setLoading(true);
        const url = `${API_CONFIG.baseURL}/news`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (cancelled) return;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          const moodFm = json.data.filter(
            (item) => item.channelId && item.channelId.name === 'MoodFM'
          );
          setNews(moodFm);
        } else {
          setNews([]);
        }
      } catch (e) {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNews();
    return () => { cancelled = true; };
  }, []);

  const openDetail = (newsId) => {
    navigation.navigate('NewsDetail', { newsId });
  };

  const rows = chunk(news, 2);

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section with bg image - same style as Events */}
        <View style={[styles.heroSectionWrap, { height: HERO_HEIGHT }]}>
          <ImageBackground
            source={require('./assets/bg.png')}
            style={styles.heroSection}
            resizeMode="cover"
          >
            <View style={styles.heroOverlayFull} />
            <Animated.View
            style={[
              styles.heroOverlay,
              {
                opacity: heroFade,
                transform: [{ translateY: heroSlide }],
              },
            ]}
          >
            <Text style={styles.heroTitle}>
              NEWS <Text style={styles.heroTitleChar}>&</Text> UPDATES
            </Text>
            <Text style={styles.heroSubtitle}>
              Music news, artist stories, and what's happening at Mood FM.
            </Text>
          </Animated.View>
          </ImageBackground>
        </View>

        {/* News grid */}
        <View style={styles.gridSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.navbarBg} />
            </View>
          ) : news.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No news yet</Text>
              <Text style={styles.emptyText}>Check back later for updates.</Text>
            </View>
          ) : (
            rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((item, colIndex) => (
                <NewsCard
                  key={item._id}
                  item={item}
                  onPress={openDetail}
                  cardWidth={CARD_WIDTH}
                  index={rowIndex * 2 + colIndex}
                />
              ))}
              {row.length === 1 ? <View style={[styles.card, styles.cardSpacer, { width: CARD_WIDTH }]} /> : null}
            </View>
          ))
          )}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.sectionGap,
    alignItems: 'center',
  },
  heroSectionWrap: {
    width: '100%',
  },
  heroSection: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  heroOverlayFull: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(44, 44, 44, 0.6)',
  },
  heroOverlay: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    paddingTop: spacing.xxl,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  heroTitleChar: {
    fontFamily: 'System',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.sm,
  },
  gridSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    minHeight: 340,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: colors.muted,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: colors.muted,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    minHeight: 160,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.navbarText,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: fonts.secondary,
    color: colors.muted,
    lineHeight: 18,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  readMoreButton: {
    marginTop: spacing.xs,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#33CC66',
    borderRadius: 6,
    alignSelf: 'center',
  },
  readMoreButtonText: {
    color: '#33CC66',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'Gobold-Bold',
  },
  cardSpacer: {
    backgroundColor: 'transparent',
    alignSelf: 'stretch',
  },
});
