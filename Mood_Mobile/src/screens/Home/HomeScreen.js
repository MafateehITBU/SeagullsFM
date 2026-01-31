import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Navbar from '../../components/Navbar';
import ProgramsSlider from '../../components/ProgramsSlider';
import NewsSlider from '../../components/NewsSlider';
import CTASection from '../../components/CTASection';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(50)).current;

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
              <View style={styles.splitButton}>
                <TouchableOpacity style={styles.listenButtonLeft}>
                  <Text style={styles.listenButtonText}>Listen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.listenButtonRight}>
                  <Text style={styles.liveButtonText}>Live</Text>
                  <Image 
                    source={require('./assets/dot.png')} 
                    style={styles.dotImage}
                  />
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

        {/* News Section */}
        <NewsSlider />

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
    fontSize: 42,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 52,
    letterSpacing: 2,
  },
  splitButton: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    minWidth: 200,
  },
  listenButtonLeft: {
    flex: 1,
    backgroundColor: colors.navbarBg, // Yellow background
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenButtonRight: {
    flex: 1,
    backgroundColor: colors.background, // Dark background
    borderWidth: 2,
    borderColor: colors.navbarBg, // Yellow border
    borderTopRightRadius: 24, // Only top right corner
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible', // Allow dot to extend beyond border
  },
  dotImage: {
    position: 'absolute',
    top: -5, // Position at border and extend out
    right: -5, // Position at border and extend out
    width: 20,
    height: 20,
  },
  listenButtonText: {
    color: colors.navbarText, // Dark text
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Gobold-Bold',
  },
  liveButtonText: {
    color: colors.navbarBg, // Yellow text
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Gobold-Bold',
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
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

