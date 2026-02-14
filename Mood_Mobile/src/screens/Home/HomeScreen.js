import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/Navbar';
import ProgramsSlider from '../../components/ProgramsSlider';
import NewsSlider from '../../components/NewsSlider';
import CTASection from '../../components/CTASection';
import { useLiveStream } from '../../context/LiveStreamContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';

// Set to true to show the News section on the home screen
const SHOW_NEWS_SECTION = false;

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(50)).current;
  const { isPlaying, isLoading, toggle } = useLiveStream();

  useEffect(() => {
    // Animate all components with staggered timing
    Animated.parallel([
      // Hero heading: fade in and slide up
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      // Button: fade in and slide up
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      // Image: slide in from the right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Animated.View
              style={[
                styles.headingContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.heroHeading}>WHERE MUSIC{'\n'}LIVES FOREVER</Text>
            </Animated.View>
            
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: buttonSlideAnim,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.singleButtonWrap}>
                <TouchableOpacity
                  style={styles.liveButton}
                  onPress={toggle}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.liveButtonContent}>
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={20}
                      color={colors.navbarBg}
                      style={styles.liveIcon}
                    />
                    <Text style={styles.liveButtonText}>{isPlaying ? 'Pause' : 'Live'}</Text>
                  </View>
                  {!isPlaying && (
                    <Image 
                      source={require('./assets/dot.png')} 
                      style={styles.dotImage}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
          
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Image 
              source={require('./assets/Heroimage.png')} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* Programs Section */}
        <ProgramsSlider />

        {/* News Section - hidden when SHOW_NEWS_SECTION is false */}
        {SHOW_NEWS_SECTION && <NewsSlider />}

        {/* CTA Section */}
        <CTASection />

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
    paddingTop: spacing.md,
    paddingBottom: spacing.sectionGap,
  },
  heroSection: {
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.sectionGap,
    minHeight: screenHeight * 0.7, // Take up most of the screen
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  headingContainer: {
    width: '100%',
    alignItems: 'center',
  },
  heroHeading: {
    fontSize: fontSizes.heroTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSizes.heroTitle + 10,
    letterSpacing: 2,
  },
  singleButtonWrap: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  liveButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.navbarBg,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  dotImage: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
  },
  liveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIcon: {
    marginRight: 6,
  },
  liveButtonText: {
    color: colors.navbarBg,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.black,
    fontFamily: fonts.secondaryBold,
  },
  imageContainer: {
    width: screenWidth,
    marginTop: spacing.lg,
  },
  heroImage: {
    width: screenWidth,
    height: 380,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  logoImage: {
    height: 100,
    width: 220,
  },
  frequencyImage: {
    height: 100,
    width: 220,
  },
  welcomeText: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

