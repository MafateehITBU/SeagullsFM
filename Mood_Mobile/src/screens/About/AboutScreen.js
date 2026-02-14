import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions, Animated, TouchableOpacity } from 'react-native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';
import { useStaticInfo } from '../../context/StaticInfoContext';

const { width: screenWidth } = Dimensions.get('window');

// value = number to count to, suffix = e.g. '+' or 'k+' (rendered in System font so + displays)
const STATS = [
  { value: 20, suffix: '+', label: 'years of music and culture' },
  { value: 5, suffix: 'k+', label: 'Monthly listeners' },
  { value: 100, suffix: '+', label: 'Shows and DJs' },
];

export default function AboutScreen() {
  const { aboutUS } = useStaticInfo();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headingSlideAnim = useRef(new Animated.Value(50)).current;

  const animValues = useRef(STATS.map(() => new Animated.Value(0))).current;
  const [displayValues, setDisplayValues] = useState(STATS.map(() => 0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(headingSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const listeners = animValues.map((anim, index) => {
      const target = STATS[index].value;
      return anim.addListener(({ value }) => {
        setDisplayValues((prev) => {
          const next = [...prev];
          next[index] = Math.round(value);
          return next;
        });
      });
    });

    Animated.stagger(100, animValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: STATS[index].value,
        duration: 1800,
        delay: 400,
        useNativeDriver: false,
      })
    )).start();

    return () => {
      animValues.forEach((anim, i) => anim.removeListener(listeners[i]));
    };
  }, []);

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - header only */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Animated.View
              style={[
                styles.headingContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: headingSlideAnim,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.heroHeading}>ABOUT US</Text>
            </Animated.View>
          </View>
        </View>

        {/* About text from static info */}
        <View style={styles.aboutBlock}>
          <Text style={styles.aboutText}>
            {aboutUS || 'We are a leading radio station providing quality content and entertainment.'}
          </Text>
        </View>

        {/* Divider between text and numbers */}
        <View style={styles.sectionDivider} />

        {/* Stats row - three numbers on same line, with increment animation */}
        <View style={styles.statsRow}>
          {STATS.map((item, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statNumberRow}>
                <Text style={styles.statNumber}>{displayValues[index]}</Text>
                <Text style={styles.statNumberSuffix}>{item.suffix}</Text>
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Hero image under the numbers */}
        <View style={styles.heroImageSection}>
          <Animated.View
            style={[
              styles.imageContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Image
              source={require('./assets/hero.png')}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* Who We Are */}
        <View style={styles.whoWeAreSection}>
          <Text style={styles.whoWeAreTitle}>Who We Are</Text>
          <Text style={styles.whoWeAreParagraph}>
            Mood FM was established in June 2004 and is Jordan's premiere adult and contemporary English radio station.
          </Text>
          <Text style={styles.whoWeAreParagraph}>
            Mood FM broadcasts the finest selection of music from legendary artists who have stood the test of time. Its diverse music format includes songs from the 80's, 90's, 00's and today's latest hits.
          </Text>
          <Text style={styles.whoWeAreParagraph}>
            Our daily aim is to take listeners on a musical journey, evoking memories and emotions.
          </Text>
          <View style={styles.whoWeAreButtons}>
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={() => {}}
            >
              <Text style={styles.learnMoreButtonText}>Learn More</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mediaKitButton}
              onPress={() => {}}
            >
              <Text style={styles.mediaKitButtonText}>Download Media Kit</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sectionGap,
    paddingHorizontal: 0,
  },
  heroSection: {
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  imageContainer: {
    width: screenWidth,
  },
  heroImage: {
    width: screenWidth,
    height: 220,
  },
  heroContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
    letterSpacing: 2,
  },
  aboutBlock: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sectionGap,
  },
  aboutText: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.muted,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sectionGap,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  statNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  statNumber: {
    fontSize: fontSizes.heroTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.statsOrange,
  },
  statNumberSuffix: {
    fontSize: fontSizes.heroTitle,
    fontWeight: fontWeights.black,
    color: colors.statsOrange,
    fontFamily: fonts.systemFont,
  },
  statLabel: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.9,
  },
  heroImageSection: {
    width: '100%',
    marginBottom: spacing.sectionGap,
  },
  whoWeAreSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sectionGap,
  },
  whoWeAreTitle: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  whoWeAreParagraph: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: spacing.md,
  },
  whoWeAreButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  learnMoreButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.statsOrange,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learnMoreButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondaryBold,
    color: '#FFFFFF',
  },
  mediaKitButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.statsOrange,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaKitButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondaryBold,
    color: colors.statsOrange,
  },
});
