import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';
import { fontSizes, fontWeights } from '../theme/typography';
import { API_CONFIG } from '../config/api';
import TextWithSymbolFallback from './TextWithSymbolFallback';

const { width: screenWidth } = Dimensions.get('window');

// Slider accent: Zaid = cyan, others = yellow (green is only in Presenters hero section)
const COLOR_ZAID = '#02D1C2';
const COLOR_OTHER = '#EBCD03';

function getAccentColor(name) {
  if (!name || typeof name !== 'string') return COLOR_OTHER;
  return name.toLowerCase().includes('zaid') ? COLOR_ZAID : COLOR_OTHER;
}

const SOCIAL_CONFIG = {
  ig: { icon: 'logo-instagram', url: (v) => `https://instagram.com/${v}` },
  FB: { icon: 'logo-facebook', url: (v) => `https://facebook.com/${v}` },
  YT: { icon: 'logo-youtube', url: (v) => `https://youtube.com/@${v}` },
};

function SocialIcons({ socialLinks, accentColor }) {
  if (!socialLinks || typeof socialLinks !== 'object') return null;
  const entries = Object.entries(socialLinks).filter(
    ([key, value]) => SOCIAL_CONFIG[key] && value && String(value).trim()
  );
  if (entries.length === 0) return null;
  return (
    <View style={styles.socialRow}>
      {entries.map(([key, value]) => {
        const config = SOCIAL_CONFIG[key];
        const url = config.url(value);
        return (
          <TouchableOpacity
            key={key}
            onPress={() => Linking.openURL(url)}
            style={[styles.socialButton, { borderColor: accentColor }]}
            activeOpacity={0.7}
          >
            <Ionicons name={config.icon} size={22} color={accentColor} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function BroadcastersSlider() {
  const [broadcasters, setBroadcasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(screenWidth);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const onLayout = (e) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchBroadcasters() {
      try {
        setLoading(true);
        const url = `${API_CONFIG.baseURL}/broadcaster`;
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
          setBroadcasters(moodFm);
        } else {
          setBroadcasters([]);
        }
      } catch (e) {
        if (!cancelled) setBroadcasters([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBroadcasters();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  }, [loading]);

  const onScroll = (e) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / containerWidth);
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navbarBg} />
      </View>
    );
  }

  if (broadcasters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No presenters yet</Text>
        <Text style={styles.emptyText}>Check back later.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper} onLayout={onLayout}>
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={[styles.scrollView, { width: containerWidth }]}
          contentContainerStyle={styles.scrollContent}
        >
          {broadcasters.map((broadcaster) => {
            const accentColor = getAccentColor(broadcaster.name);
            return (
              <View key={broadcaster._id} style={[styles.card, { width: containerWidth }]}>
              <View style={styles.imageWrap}>
                {broadcaster.image?.url ? (
                  <Image
                    source={{ uri: broadcaster.image.url }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]} />
                )}
                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
              </View>
              <View style={styles.body}>
                <TextWithSymbolFallback style={[styles.name, { color: accentColor }]}>
                  {broadcaster.name}
                </TextWithSymbolFallback>
                {broadcaster.description ? (
                  <TextWithSymbolFallback style={styles.description} numberOfLines={4}>
                    {broadcaster.description}
                  </TextWithSymbolFallback>
                ) : null}
                <SocialIcons socialLinks={broadcaster.socialLinks} accentColor={accentColor} />
              </View>
            </View>
          );
        })}
        </ScrollView>
        {broadcasters.length > 1 ? (
          <View style={styles.dots}>
            {broadcasters.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex && styles.dotActive,
                  i === currentIndex && {
                    backgroundColor: getAccentColor(broadcasters[i].name),
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.sectionGap,
    alignItems: 'center',
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: fontSizes.cardTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.muted,
  },
  scrollView: {},
  scrollContent: {
    alignItems: 'center',
  },
  card: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 320,
  },
  imagePlaceholder: {
    backgroundColor: colors.muted,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.9,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 12,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
