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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { API_CONFIG } from '../../config/api';

const { width: screenWidth } = Dimensions.get('window');

export default function NewsDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { newsId } = route.params || {};
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!newsId) {
      setError('No news ID');
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchNewsDetail() {
      try {
        setLoading(true);
        setError(null);
        const url = `${API_CONFIG.baseURL}/news/${newsId}`;
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
          setNews(json.data);
        } else {
          setError('News not found');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load');
          setNews(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNewsDetail();
    return () => { cancelled = true; };
  }, [newsId]);

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

  if (error || !news) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'News not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const publishedDate = news.publishedAt
    ? new Date(news.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {news.image?.url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: news.image.url }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.title}>{news.title}</Text>
          {publishedDate ? (
            <Text style={styles.date}>{publishedDate}</Text>
          ) : null}
          {news.description ? (
            <Text style={styles.description}>{news.description}</Text>
          ) : null}
          {news.content ? (
            <Text style={styles.content}>{news.content}</Text>
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
    backgroundColor: colors.navbarBg,
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
  imageContainer: {
    width: screenWidth,
    height: 260,
    backgroundColor: colors.muted,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 34,
  },
  date: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  content: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
  },
});
