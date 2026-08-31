import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import BeatCountUp from '../../components/BeatCountUp';
import BeatGradientText from '../../components/BeatGradientText';
import RichTextContent from '../../components/RichTextContent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { useStaticInfo } from '../../context/StaticInfoContext';

const STATS = [
  { end: 20, suffix: '+', label: 'years of music\nand culture' },
  { end: 350, suffix: 'k+', label: 'Monthly listeners' },
  { end: 20, suffix: '+', label: 'Shows and Segments' },
];

const WHO_WE_ARE_COPY =
  "Beat FM is Jordan's home for the biggest hits, freshest sounds, and most engaging radio personalities. Broadcasting from Amman to listeners across the Kingdom and beyond, we deliver a dynamic mix of contemporary music, entertainment, culture, and lifestyle content that keeps our audience connected and inspired. More than just a radio station, Beat FM is a platform for trendsetters, music lovers, and communities to come together through shared experiences, unforgettable events, and a passion for great music. Whether you're tuning in on-air, online, or through our app, Beat FM is your soundtrack to what's happening now.";

const MEDIA_KIT_URL = 'https://mybeat.fm/mediaKitBeat.pdf';
const ABOUT_IMAGE_ASPECT = 3127 / 2738;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ABOUT_IMAGE_MAX_WIDTH = screenWidth - spacing.lg * 2;
const ABOUT_IMAGE_MAX_HEIGHT = Math.min(screenHeight * 0.32, 260);

function getAboutImageSize() {
  let width = ABOUT_IMAGE_MAX_WIDTH;
  let height = width / ABOUT_IMAGE_ASPECT;

  if (height > ABOUT_IMAGE_MAX_HEIGHT) {
    height = ABOUT_IMAGE_MAX_HEIGHT;
    width = height * ABOUT_IMAGE_ASPECT;
  }

  return { width, height };
}

export default function AboutScreen() {
  const navigation = useNavigation();
  const { aboutUS } = useStaticInfo();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(48)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start();
  }, []);

  const aboutText =
    aboutUS?.trim() ||
    'Beat FM brings the biggest hits and freshest sounds to listeners across Jordan and beyond.';

  const aboutImageSize = getAboutImageSize();

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.titleSection}>
            <BeatGradientText style={styles.pageTitle}>
              ABOUT{'\n'}US
            </BeatGradientText>
          </View>

          <LinearGradient
            colors={['#2400de', '#1f23e3', '#137cee', '#08c3f7', '#01f5fe']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.introBand}
          >
            <RichTextContent html={aboutText} style={styles.introText} />
          </LinearGradient>

          <View style={styles.statsRow}>
            {STATS.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <BeatCountUp end={stat.end} suffix={stat.suffix} />
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.whoSection}>
          <Text style={styles.whoTitle}>WHO WE ARE</Text>
          <Text style={styles.whoText}>{WHO_WE_ARE_COPY}</Text>

          <View style={styles.ctaRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Presenters')}>
              <Text style={styles.ctaLink}>LEARN MORE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(MEDIA_KIT_URL)}>
              <Text style={styles.ctaLink}>DOWNLOAD MEDIA KIT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutImageWrap}>
            <Image
              source={require('./assets/web-12.png')}
              style={[
                styles.aboutImage,
                { width: aboutImageSize.width, height: aboutImageSize.height },
              ]}
              resizeMode="contain"
            />
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
    paddingBottom: spacing.xxl,
  },
  titleSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  pageTitle: {
    fontSize: 48,
    lineHeight: 44,
    textTransform: 'uppercase',
  },
  introBand: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  introText: {
    fontFamily: fonts.gothamBold,
    fontSize: 18,
    lineHeight: 28,
    color: colors.text,
    maxWidth: 600,
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: fonts.gotham,
    fontSize: 11,
    lineHeight: 15,
    color: colors.text,
    marginTop: 6,
    opacity: 0.9,
  },
  whoSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  whoTitle: {
    fontFamily: fonts.museoBold,
    fontSize: 40,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -1,
    lineHeight: 38,
  },
  whoText: {
    fontFamily: fonts.gotham,
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(248,248,248,0.9)',
    marginBottom: spacing.lg,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  ctaLink: {
    fontFamily: fonts.gothamBold,
    fontSize: 13,
    color: '#9fd4ff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  aboutImageWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  aboutImage: {
    borderRadius: 12,
  },
});
