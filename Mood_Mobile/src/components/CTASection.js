import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';
import { fontSizes, fontWeights } from '../theme/typography';

const { width: screenWidth } = Dimensions.get('window');

// Set to true to show the "Discover More" (Events) button
const SHOW_EVENTS_CTA = false;

export default function CTASection() {
  const navigation = useNavigation();
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const imageSlideAnim = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    // Animate section when it mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      // Animate image sliding in from the right
      Animated.timing(imageSlideAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      {/* CTA Image - slides in from right */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [{ translateX: imageSlideAnim }],
          },
        ]}
      >
        <Image 
          source={require('../screens/Home/assets/CTAHome.png')} 
          style={styles.ctaImage}
          resizeMode="cover"
        />
      </Animated.View>
      
      <Text style={styles.mainTitle}>
        ON<Text style={styles.specialChar}>-</Text>AIR <Text style={styles.specialChar}>&</Text> ON GROUND
      </Text>
      <Text style={styles.subtitle}>OUR SIGNATARE EVENTS</Text>
      
      <Text style={styles.description}>
        Music. Energy. Real Moments experience mood fm Live from DJ Sets and concertto special pop-up eventsthat connect the music with the crowd.
      </Text>
      
      {SHOW_EVENTS_CTA && (
        <TouchableOpacity
          style={styles.discoverButton}
          onPress={() => navigation.navigate('Events')}
        >
          <Text style={styles.discoverButtonText}>Discover More</Text>
        </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  specialChar: {
    fontFamily: fonts.systemFont,
  },
  subtitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  discoverButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.navbarBg,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    marginTop: spacing.sm,
  },
  discoverButtonText: {
    color: colors.navbarBg,
    fontSize: fontSizes.body,
    fontWeight: fontWeights.black,
    fontFamily: fonts.secondaryBold,
  },
  imageContainer: {
    width: screenWidth,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  ctaImage: {
    width: screenWidth,
    height: 380,
  },
});
