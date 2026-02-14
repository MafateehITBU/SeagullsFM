import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Linking,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';
import { API_CONFIG } from '../../config/api';
import TextWithSymbolFallback from '../../components/TextWithSymbolFallback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(screenHeight * 0.45);

function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes || '00'} ${ampm}`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProgramDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { programId, accentColor: paramAccentColor } = route.params || {};
  const accentColor = paramAccentColor || colors.navbarBg;
  const buttonTextColor = accentColor === colors.navbarBg ? colors.navbarText : '#FFFFFF';
  const [program, setProgram] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!programId) {
      setError('No program ID');
      setLoadingProgram(false);
      return;
    }
    let cancelled = false;
    async function fetchProgram() {
      try {
        setLoadingProgram(true);
        setError(null);
        const url = `${API_CONFIG.baseURL}/program/${programId}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (cancelled) return;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (json.success && json.data) {
          setProgram(json.data);
        } else {
          setError('Program not found');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || 'Failed to load');
          setProgram(null);
        }
      } finally {
        if (!cancelled) setLoadingProgram(false);
      }
    }
    fetchProgram();
    return () => { cancelled = true; };
  }, [programId]);

  useEffect(() => {
    let cancelled = false;
    async function fetchInterviews() {
      try {
        setLoadingInterviews(true);
        const url = `${API_CONFIG.baseURL}/interview`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (cancelled) return;
        if (!response.ok) return;
        const json = await response.json();
        if (json.success && json.data && Array.isArray(json.data)) {
          const programObjectId = programId;
          const filtered = json.data.filter(
            (interview) =>
              (interview.programId?._id || interview.programId) === programObjectId
          );
          setInterviews(filtered);
        }
      } catch (e) {
        if (!cancelled) setInterviews([]);
      } finally {
        if (!cancelled) setLoadingInterviews(false);
      }
    }
    fetchInterviews();
    return () => { cancelled = true; };
  }, [programId]);

  const loading = loadingProgram;
  const programImageUrl =
    program?.programDetailsImage?.url || program?.image?.url;
  const daysStr =
    program?.days && Array.isArray(program.days)
      ? program.days.join(', ')
      : program?.day || '';

  const filteredInterviews = useMemo(() => {
    let list = [...interviews];
    if (selectedDate) {
      const selectedStr = selectedDate.toISOString().split('T')[0];
      list = list.filter((interview) => {
        const d = interview.date || interview.createdAt;
        if (!d) return false;
        const interviewStr = new Date(d).toISOString().split('T')[0];
        return interviewStr === selectedStr;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (interview) =>
          (interview.title && interview.title.toLowerCase().includes(q)) ||
          (interview.description && interview.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [interviews, selectedDate, searchQuery]);

  const onDatePickerChange = (event, date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && date) setSelectedDate(date);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </View>
    );
  }

  if (error || !program) {
    return (
      <View style={styles.container}>
        <Navbar />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Program not found'}</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: accentColor }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: buttonTextColor }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Navbar />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {programImageUrl ? (
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: programImageUrl }}
              style={styles.programImage}
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View style={styles.body}>
          <TextWithSymbolFallback style={styles.title}>{program.title}</TextWithSymbolFallback>
          {program.description ? (
            <TextWithSymbolFallback style={styles.description}>{program.description}</TextWithSymbolFallback>
          ) : null}

          <View style={styles.card}>
            <Text style={[styles.cardLabel, { color: accentColor }]}>Days</Text>
            <TextWithSymbolFallback style={styles.cardText}>{daysStr || '—'}</TextWithSymbolFallback>
          </View>
          <View style={styles.card}>
            <Text style={[styles.cardLabel, { color: accentColor }]}>Time</Text>
            <TextWithSymbolFallback style={styles.cardText}>
              {formatTime(program.startTime)} – {formatTime(program.endTime)}
            </TextWithSymbolFallback>
          </View>
          {daysStr ? (
            <View style={styles.card}>
              <Text style={[styles.cardLabel, { color: accentColor }]}>Frequency</Text>
              <TextWithSymbolFallback style={styles.cardText}>Every {daysStr}</TextWithSymbolFallback>
            </View>
          ) : null}
        </View>

        <View style={styles.interviewSection}>
          <Text style={styles.sectionTitle}>Interviews</Text>
          <Text style={styles.sectionSubtitle}>
            Exclusive conversations with artists and voices from the music scene.
          </Text>

          <View style={styles.searchBarWrap}>
            <Ionicons name="search" size={20} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or description"
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.searchClear}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={colors.muted} />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.calendarButton, { backgroundColor: accentColor }]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={20} color={buttonTextColor} style={styles.calendarIcon} />
              <Text style={[styles.calendarButtonText, { color: buttonTextColor }]}>Calendar</Text>
            </TouchableOpacity>
            {selectedDate ? (
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => setSelectedDate(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.clearDateButtonText}>Clear filter</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {selectedDate ? (
            <View style={styles.selectedDateChip}>
              <Text style={styles.selectedDateLabel}>{formatDate(selectedDate)}</Text>
            </View>
          ) : null}

          {showDatePicker && (
            <>
              {Platform.OS === 'ios' ? (
                <Modal transparent animationType="slide">
                  <TouchableOpacity
                    style={styles.datePickerOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDatePicker(false)}
                  />
                  <View style={styles.datePickerModal}>
                    <View style={styles.datePickerActions}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.datePickerCancel}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.datePickerDone, { color: accentColor }]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={selectedDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={onDatePickerChange}
                    />
                  </View>
                </Modal>
              ) : (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={onDatePickerChange}
                />
              )}
            </>
          )}

          {loadingInterviews ? (
            <ActivityIndicator size="small" color={accentColor} style={styles.loader} />
          ) : filteredInterviews.length === 0 ? (
            <Text style={styles.noInterviews}>
              {interviews.length === 0
                ? 'No interviews yet.'
                : 'No interviews match your search or filters.'}
            </Text>
          ) : (
            filteredInterviews.map((interview) => (
              <View key={interview._id} style={styles.interviewCard}>
                <View style={styles.interviewCardContent}>
                  <TextWithSymbolFallback style={styles.interviewTitle}>{interview.title}</TextWithSymbolFallback>
                  {interview.description ? (
                    <TextWithSymbolFallback style={styles.interviewDescription} numberOfLines={3}>
                      {interview.description}
                    </TextWithSymbolFallback>
                  ) : null}
                  <Text style={[styles.interviewDate, { color: accentColor }]}>
                    {formatDate(interview.date || interview.createdAt)}
                  </Text>
                  {interview.content?.url ? (
                    <TouchableOpacity
                      style={[styles.watchButton, { backgroundColor: accentColor }]}
                      onPress={() => Linking.openURL(interview.content.url)}
                    >
                      <Text style={[styles.watchButtonText, { color: buttonTextColor }]}>Watch</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.bodyMd,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.navbarBg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: fontWeights.bold,
    color: colors.navbarText,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.sectionGap,
  },
  imageWrap: {
    width: screenWidth,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.muted,
    overflow: 'hidden',
  },
  programImage: {
    width: screenWidth,
    height: IMAGE_HEIGHT,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  description: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardLabel: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondary,
    color: colors.navbarBg,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  cardText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    lineHeight: 22,
  },
  interviewSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.h4,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    paddingRight: 8,
  },
  searchClear: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navbarBg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  calendarIcon: {
    marginRight: 8,
  },
  calendarButtonText: {
    fontSize: fontSizes.bodySm,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.secondary,
    color: colors.navbarText,
  },
  clearDateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  clearDateButtonText: {
    fontSize: fontSizes.bodySm,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.secondary,
    color: colors.muted,
  },
  selectedDateChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  selectedDateLabel: {
    fontSize: fontSizes.bodySm,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.secondary,
    color: colors.text,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerModal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 34,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  datePickerCancel: {
    fontSize: fontSizes.bodyMd,
    color: colors.muted,
  },
  datePickerDone: {
    fontSize: fontSizes.bodyMd,
    fontWeight: fontWeights.semibold,
    color: colors.navbarBg,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  noInterviews: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  interviewCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  interviewCardContent: {},
  interviewTitle: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  interviewDescription: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  interviewDate: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.navbarBg,
    marginBottom: spacing.sm,
  },
  watchButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navbarBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  watchButtonText: {
    fontSize: fontSizes.bodySm,
    fontWeight: fontWeights.bold,
    color: colors.navbarText,
  },
});
