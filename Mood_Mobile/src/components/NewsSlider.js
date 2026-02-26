import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';
import { fontSizes, fontWeights } from '../theme/typography';
import TextWithSymbolFallback from './TextWithSymbolFallback';
import { API_CONFIG } from '../config/api';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85; // Card takes 85% of screen width
const CARD_SPACING = spacing.md;

export default function NewsSlider() {
  const navigation = useNavigation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    // Animate section when news are loaded
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const fetchNews = async () => {
    try {
      const url = `${API_CONFIG.baseURL}/news`;
      console.log('Fetching news from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        // Filter: only MoodFM channel news
        const filteredNews = data.data.filter((item) => {
          const isMoodFM = 
            item.channelId && 
            item.channelId.name === 'MoodFM';
          
          return isMoodFM;
        });
        
        console.log(`Total news: ${data.data.length}, MoodFM: ${filteredNews.length}`);
        setNews(filteredNews);
      } else {
        console.warn('No news data in response or invalid format');
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
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

  const goToPrevious = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < news.length - 1) {
      scrollToIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navbarBg} />
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>News</Text>
      <Text style={styles.sectionSubtitle}>
        Latest updates, Stories and highlights{'\n'}from the world of music
      </Text>
      
      {news.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No News Available</Text>
          <Text style={styles.emptyStateText}>
            Check back soon for the latest updates!
          </Text>
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            style={styles.scrollView}
          >
            {news.map((item, index) => (
              <View key={item._id} style={styles.newsCard}>
                {/* Image at the top - fixed height so card size is consistent */}
                <View style={styles.newsImageContainer}>
                  {(item.images?.[0]?.url ?? item.image?.url) ? (
                    <Image
                      source={{ uri: item.images?.[0]?.url ?? item.image?.url }}
                      style={styles.newsImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.newsImage, styles.newsImagePlaceholder]} />
                  )}
                </View>
                
                {/* Title on white background */}
                <View style={styles.titleContainer}>
                  <TextWithSymbolFallback style={styles.newsTitle} numberOfLines={2}>
                    {item.title}
                  </TextWithSymbolFallback>
                  {item.description && (
                    <TextWithSymbolFallback style={styles.newsDescription} numberOfLines={3}>
                      {item.description}
                    </TextWithSymbolFallback>
                  )}
                  
                  {/* Read More Button inside card - opens news detail */}
                  <TouchableOpacity
                    style={styles.readMoreButton}
                    onPress={() => navigation.navigate('NewsDetail', { newsId: item._id })}
                  >
                    <Text style={styles.readMoreButtonText}>Read More</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Navigation Arrows */}
          {news.length > 1 && (
            <View style={styles.arrowsContainer}>
              <TouchableOpacity
                style={[styles.arrowButton, currentIndex === 0 && styles.arrowButtonDisabled]}
                onPress={goToPrevious}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={28} color={colors.navbarText} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.arrowButton, currentIndex === news.length - 1 && styles.arrowButtonDisabled]}
                onPress={goToNext}
                disabled={currentIndex === news.length - 1}
              >
                <Ionicons name="chevron-forward" size={28} color={colors.navbarText} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 0,
    marginBottom: spacing.sectionGap,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sectionSubtitle: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  scrollView: {
    width: screenWidth,
  },
  scrollContent: {
    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
    paddingVertical: spacing.md,
  },
  newsCard: {
    width: CARD_WIDTH,
    minHeight: 420,
    marginRight: CARD_SPACING,
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.muted,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsImagePlaceholder: {
    backgroundColor: colors.muted,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    minHeight: 180,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  newsTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.navbarText,
    marginBottom: spacing.sm,
  },
  newsDescription: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#33CC66',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  readMoreButtonText: {
    color: '#33CC66',
    fontSize: fontSizes.bodySm,
    fontWeight: fontWeights.black,
    fontFamily: fonts.secondaryBold,
  },
  arrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  arrowButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.navbarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  arrowText: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.bold,
    color: colors.navbarText,
  },
  emptyStateContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyStateTitle: {
    fontSize: fontSizes.h3,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
});
