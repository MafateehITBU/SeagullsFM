import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { API_CONFIG } from '../../config/api';

const { width: screenWidth } = Dimensions.get('window');
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

function NewsCard({ item, onPress, cardWidth }) {
  return (
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
  );
}

export default function NewsScreen() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <Text style={styles.title}>News <Text style={styles.titleChar}>&</Text> Updates</Text>
        <Text style={styles.subtitle}>
          Music news, artist stories, and what's happening at Mood FM.
        </Text>

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
              {row.map((item) => (
                <NewsCard
                  key={item._id}
                  item={item}
                  onPress={openDetail}
                  cardWidth={CARD_WIDTH}
                />
              ))}
              {row.length === 1 ? <View style={[styles.card, styles.cardSpacer, { width: CARD_WIDTH }]} /> : null}
            </View>
          ))
        )}
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
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: spacing.sectionGap,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  titleChar: {
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
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
