import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../../components/Navbar';
import BroadcastersSlider from '../../components/BroadcastersSlider';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const TICK_COLOR = '#00DCCC';

const LIST_ITEMS = [
  { text: 'Daily live shows ', char: '&', rest: ' curated playlists' },
  { text: 'Local ', char: '&', rest: ' international hosts' },
  { text: 'Mood-based programs for every vibe', char: null, rest: null },
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
          {LIST_ITEMS.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={TICK_COLOR}
                style={styles.tick}
              />
              <Text style={styles.listText}>
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

        {/* Meet Our Presenter section */}
        <View style={styles.meetSection}>
          <Text style={styles.meetTitle}>MEET OUR PRESENTER</Text>
          <Text style={styles.meetSubtitle}>
            Get to know the hosts who bring music,{'\n'}stories, and energy on air.
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
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tick: {
    marginRight: spacing.md,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
  },
  listChar: {
    fontFamily: 'System',
  },
  meetSection: {
    marginTop: spacing.xxl,
  },
  meetTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  meetSubtitle: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
});
