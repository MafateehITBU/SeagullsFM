import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';
import { fontSizes, fontWeights } from '../theme/typography';
import { API_CONFIG } from '../config/api';
import TextWithSymbolFallback from './TextWithSymbolFallback';

const { width: screenWidth } = Dimensions.get('window');

// Programs section border/btn: Moe = cyan, Zaid (others) = red (swapped)
const COLOR_MOE = '#00DCCC';
const COLOR_DEFAULT = '#FF0000';

function getProgramAccentColor(title) {
  if (!title || typeof title !== 'string') return COLOR_DEFAULT;
  return title.toUpperCase().includes('MOE') ? COLOR_MOE : COLOR_DEFAULT;
}

export default function ProgramsSlider() {
  const navigation = useNavigation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);
  const isScrollingRef = useRef(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    // Animate section when programs are loaded
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

  useEffect(() => {
    if (programs.length > 1) {
      startAutoScroll();
      return () => {
        stopAutoScroll();
      };
    }
  }, [programs]);

  const fetchPrograms = async () => {
    try {
      const url = `${API_CONFIG.baseURL}/program`;
      console.log('Fetching programs from:', url);
      
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
        // Filter: only MoodFM channel and active programs
        const filteredPrograms = data.data.filter((program) => {
          // Check if channelId exists and name is exactly "MoodFM"
          const isMoodFM = 
            program.channelId && 
            program.channelId.name === 'MoodFM';
          
          // Check if program is active (default to true if not specified)
          const isActive = program.isActive !== false;
          
          return isMoodFM && isActive;
        });
        
        console.log(`Total programs: ${data.data.length}, MoodFM active: ${filteredPrograms.length}`);
        console.log('Filtered programs:', filteredPrograms.map(p => ({ title: p.title, channel: p.channelId?.name, active: p.isActive })));
        
        setPrograms(filteredPrograms);
      } else {
        console.warn('No programs data in response or invalid format');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        baseURL: API_CONFIG.baseURL,
        fullURL: `${API_CONFIG.baseURL}/program`,
      });
      
      // Provide helpful error message
      if (error.message === 'Network request failed' || error.name === 'AbortError') {
        console.warn('Network Error: Make sure:');
        console.warn('1. Backend server is running on port 5001');
        console.warn('2. For physical devices, use your computer IP instead of localhost');
        console.warn('3. Device and computer are on the same network');
        console.warn(`Current API URL: ${API_CONFIG.baseURL}`);
      }
      
      // Set empty array on error so component doesn't break
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const startAutoScroll = () => {
    if (programs.length <= 1) return;
    
    stopAutoScroll(); // Clear any existing interval
    
    intervalRef.current = setInterval(() => {
      if (!isScrollingRef.current) {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % programs.length;
          
          // Scroll to next program
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: nextIndex * screenWidth,
              animated: true,
            });
          }
          
          return nextIndex;
        });
      }
    }, 5000); // Change slide every 5 seconds
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleScrollBeginDrag = () => {
    isScrollingRef.current = true;
    stopAutoScroll();
  };

  const handleScrollEndDrag = () => {
    // Resume auto-scroll after 3 seconds of no manual scrolling
    setTimeout(() => {
      isScrollingRef.current = false;
      if (programs.length > 1) {
        startAutoScroll();
      }
    }, 3000);
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    setCurrentIndex(index);
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
      <Text style={styles.sectionTitle}>Our Programs</Text>
      <Text style={styles.sectionSubtitle}>Discover our amazing radio programs</Text>
      
      {programs.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No Programs Available</Text>
          <Text style={styles.emptyStateText}>
            Check back soon for exciting new programs!
          </Text>
        </View>
      ) : (
        <>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {programs.map((program, index) => {
          const accentColor = getProgramAccentColor(program.title);
          return (
            <View key={program._id} style={styles.programCard}>
              {/* Image at the top - fixed size with accent frame */}
              <View style={[styles.imageWrapper, { borderWidth: 3, borderColor: accentColor }]}>
                <Image
                  source={{ uri: program.image?.url }}
                  style={styles.programImage}
                  resizeMode="cover"
                />
              </View>

              {/* Details below image */}
              <View style={styles.detailsContainer}>
                <TextWithSymbolFallback style={[styles.programTitle, { color: accentColor }]} numberOfLines={2}>{program.title}</TextWithSymbolFallback>
                <TextWithSymbolFallback style={styles.programDescription} numberOfLines={3}>{program.description}</TextWithSymbolFallback>
                <TouchableOpacity
                  style={[styles.viewDetailsButton, { backgroundColor: accentColor }]}
                  onPress={() => navigation.navigate('ProgramDetail', { programId: program._id, accentColor })}
                >
                  <Text style={styles.viewDetailsButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Dots indicator */}
      {programs.length > 1 && (
        <View style={styles.dotsContainer}>
          {programs.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
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
  programCard: {
    width: screenWidth,
    minHeight: 520,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  imageWrapper: {
    width: '100%',
    height: 300,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderRadius: 16,
  },
  programImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  detailsContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  programTitle: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  programDescription: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
    opacity: 0.9,
  },
  viewDetailsButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  viewDetailsButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.bodySm,
    fontWeight: fontWeights.black,
    fontFamily: fonts.secondaryBold,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  activeDot: {
    backgroundColor: colors.navbarBg,
    width: 12,
    height: 12,
    borderRadius: 6,
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
