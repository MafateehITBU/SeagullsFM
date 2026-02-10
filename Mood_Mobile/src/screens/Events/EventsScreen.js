import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { API_CONFIG } from '../../config/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(screenHeight * 0.5, 420);
const BULLET_ITEMS = [
  'Live Concerts & DJ Nights',
  'Local & International Artists',
  'Weekly & Special Events',
];

const GRID_GAP = spacing.xs;
const GRID_PADDING = spacing.sm;
const CARD_SIZE = (screenWidth - GRID_PADDING * 2 - GRID_GAP) / 2;

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function EventCard({ item, onPress, cardWidth, index = 0 }) {
  const coverUrl = item.coverImage?.url || item.image?.url;
  const [cardHeight, setCardHeight] = useState(cardWidth);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (!coverUrl) return;
    Image.getSize(
      coverUrl,
      (width, height) => setCardHeight(cardWidth * (height / width)),
      () => {}
    );
  }, [coverUrl, cardWidth]);

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

  const height = coverUrl ? cardHeight : cardWidth;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={[styles.card, { width: cardWidth, height }]}
        onPress={() => onPress(item._id)}
        activeOpacity={0.9}
      >
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={styles.cardImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.cardImage, styles.cardPlaceholder]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function EventsScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
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
    async function fetchEvents() {
      try {
        setLoading(true);
        const url = `${API_CONFIG.baseURL}/event`;
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
          setEvents(moodFm);
        } else {
          setEvents([]);
        }
      } catch (e) {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  const openDetail = (eventId) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const rows = chunk(events, 2);

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* First section: hero with bg image */}
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
            <Text style={styles.heroTitle}>EVENTS</Text>
            <Text style={styles.heroSubtitle}>
              Live music, DJ nights, and unforgettable experiences by Mood FM.
            </Text>
            <View style={styles.bulletList}>
              {BULLET_ITEMS.map((item, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.navbarBg} style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
          </ImageBackground>
        </View>

        {/* Events grid */}
        <View style={styles.gridSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.navbarBg} />
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptyText}>Check back later for Mood FM events.</Text>
            </View>
          ) : (
            rows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((item, colIndex) => (
                  <EventCard
                    key={item._id}
                    item={item}
                    onPress={openDetail}
                    cardWidth={CARD_SIZE}
                    index={rowIndex * 2 + colIndex}
                  />
                ))}
                {row.length === 1 ? (
                  <View style={[styles.cardSpacer, { width: CARD_SIZE }]} />
                ) : null}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.sectionGap,
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
  heroSubtitle: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  bulletList: {
    paddingHorizontal: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bulletIcon: {
    marginRight: spacing.md,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 22,
  },
  gridSection: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: GRID_GAP,
  },
  card: {},
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    backgroundColor: colors.muted,
  },
  cardSpacer: {
    backgroundColor: 'transparent',
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
});
