import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Navbar from '../../components/Navbar';
import BroadcastersSlider from '../../components/BroadcastersSlider';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';

// Same copy as web; first line has green underline
const BULLET_LINES = [
  { text: 'Daily live shows ', char: '&', rest: ' curated playlists', underlined: true },
  { text: 'Local and International Hosts', underlined: false },
  { text: 'Mood ', char: '-', rest: ' based programs for every vibe', underlined: false },
];

export default function PresentersScreen() {
  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Presenters</Text>
        <Text style={styles.subtitle}>
          Discover the hosts and DJs who bring music, stories, and energy to mood.fm every day.
        </Text>

        <View style={styles.divider} />

        <View style={styles.list}>
          {BULLET_LINES.map((item, index) => (
            <View
              key={index}
              style={[styles.listRow, item.underlined && styles.listRowUnderline]}
            >
              <Text style={[styles.listText, item.underlined && styles.listTextGreen]}>
                {item.rest != null ? (
                  <>
                    {item.text}
                    <Text style={styles.listChar}>{item.char}</Text>
                    {item.rest}
                  </>
                ) : (
                  item.text
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* Meet Our Presenters - same as web */}
        <View style={styles.meetSection}>
          <Text style={styles.meetTitle}>MEET OUR PRESENTERS</Text>
          <Text style={styles.meetSubtitle}>
            Get to know the hosts who bring music, stories, <Text style={[styles.meetSubtitle, { fontFamily: fonts.systemFont }]}>&</Text> energy on air.
          </Text>
          <BroadcastersSlider />
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sectionGap,
  },
  title: {
    fontSize: fontSizes.h1,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.muted,
    marginVertical: spacing.lg,
    opacity: 0.6,
  },
  list: {
    marginTop: spacing.sm,
  },
  listRow: {
    marginBottom: spacing.lg,
  },
  listRowUnderline: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accentGreen,
    paddingBottom: spacing.xs,
    alignSelf: 'flex-start',
  },
  listText: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
  },
  listTextGreen: {
    color: colors.accentGreen,
  },
  listChar: {
    fontFamily: fonts.systemFont,
  },
  meetSection: {
    marginTop: spacing.xxl,
  },
  meetTitle: {
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  meetSubtitle: {
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
});
