import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
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
const SHOW_NEWS_SECTION = true;
// Set to true to show the Events section (CTA "ON-AIR & ON GROUND") on the home screen
const SHOW_EVENTS_SECTION = false;

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
                  <View style={styles.liveButtonLeft}>
                    <Text style={styles.liveButtonLeftText}>{isPlaying ? 'Pause' : 'Listen'}</Text>
                  </View>
                  <View style={styles.liveButtonRight}>
                    <Text style={styles.liveButtonRightText}>Live</Text>
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

        {/* Events Section (CTA) - hidden when SHOW_EVENTS_SECTION is false */}
        {SHOW_EVENTS_SECTION && <CTASection />}

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
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#FF1E00',
    borderRadius: 0,
    overflow: 'visible',
    position: 'relative',
    minWidth: 200,
  },
  liveButtonLeft: {
    backgroundColor: '#FF1E00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveButtonLeftText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondaryBold,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  liveButtonRight: {
    backgroundColor: colors.navbarText,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveButtonRightText: {
    color: colors.navbarBg,
    fontSize: 18,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondaryBold,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  dotImage: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 28,
    height: 28,
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

