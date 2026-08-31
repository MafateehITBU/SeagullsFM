import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';
import { API_CONFIG } from '../../config/api';
import TextWithSymbolFallback from '../../components/TextWithSymbolFallback';

const { width: screenWidth } = Dimensions.get('window');
const SLIDER_HEIGHT = 280;

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getImageUrl(item) {
  if (!item) return null;
  if (typeof item === 'string') return item;
  return item.url || item.secure_url || null;
}

export default function EventDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    if (!eventId) {
      setError('No event ID');
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchEventDetail() {
      try {
        setLoading(true);
        setError(null);
        const url = `${API_CONFIG.baseURL}/event/${eventId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const json = await response.json();
        if (json.success && json.data) {
          setEvent(json.data);
        } else {
          setError('Event not found');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load');
          setEvent(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchEventDetail();
    return () => { cancelled = true; };
  }, [eventId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.navbarBg} />
        </View>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Event not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const rawImages = event.images || [];
  const sliderItems = rawImages.map(getImageUrl).filter(Boolean);

  const startStr = formatDate(event.startDate);
  const endStr = formatDate(event.endDate);

  const onSliderScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    setSliderIndex(index);
  };

  const renderSliderItem = ({ item }) => (
    <View style={styles.sliderSlide}>
      <Image source={{ uri: item }} style={styles.sliderImage} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sliderItems.length > 0 ? (
          <View style={styles.sliderWrap}>
            <FlatList
              data={sliderItems}
              renderItem={renderSliderItem}
              keyExtractor={(url, i) => url + i}
              horizontal
              pagingEnabled
              onScroll={onSliderScroll}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              style={styles.slider}
            />
            {sliderItems.length > 1 ? (
              <View style={styles.dots}>
                {sliderItems.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === sliderIndex && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.sliderWrap, styles.sliderPlaceholder]}>
            <Text style={styles.placeholderText}>No image</Text>
          </View>
        )}

        <View style={styles.body}>
          <TextWithSymbolFallback style={styles.title}>{event.title}</TextWithSymbolFallback>

          {(startStr || endStr) ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>When</Text>
              {startStr ? <TextWithSymbolFallback style={styles.cardText}>{startStr}</TextWithSymbolFallback> : null}
              {endStr ? <TextWithSymbolFallback style={[styles.cardText, styles.cardTextSecondary]}>{endStr}</TextWithSymbolFallback> : null}
            </View>
          ) : null}

          {event.address ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Where</Text>
              <View style={styles.cardTextRow}>
                <Ionicons name="location-outline" size={18} color={colors.muted} style={styles.cardIcon} />
                <TextWithSymbolFallback style={styles.cardText}>{event.address}</TextWithSymbolFallback>
              </View>
            </View>
          ) : null}

          {event.description ? (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>About</Text>
              <TextWithSymbolFallback style={styles.description}>{event.description}</TextWithSymbolFallback>
            </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navbarText,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.sectionGap,
  },
  sliderWrap: {
    width: screenWidth,
    height: SLIDER_HEIGHT,
    backgroundColor: colors.muted,
  },
  sliderPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.muted,
  },
  slider: {
    width: screenWidth,
    height: SLIDER_HEIGHT,
  },
  sliderSlide: {
    width: screenWidth,
    height: SLIDER_HEIGHT,
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
  },
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.buttonBg,
    width: 10,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 34,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondary,
    color: colors.accentCyan,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  cardTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    marginRight: 4,
  },
  cardText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 22,
    flex: 1,
  },
  cardTextSecondary: {
    color: colors.muted,
    marginTop: 2,
  },
  description: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
  },
});
