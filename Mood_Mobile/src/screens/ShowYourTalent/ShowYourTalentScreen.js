import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import Navbar from '../../components/Navbar';
import { API_CONFIG, MOOD_FM_CHANNEL_ID } from '../../config/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email || '');
}

function validatePhone(phone) {
  const cleaned = (phone || '').replace(/[\s\-\(\)\.]/g, '');
  if (!cleaned.startsWith('+')) return false;
  const digits = cleaned.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function validateUrl(url) {
  if (!(url || '').trim()) return true;
  try {
    new URL(url.trim());
    return true;
  } catch {
    return false;
  }
}

export default function ShowYourTalentScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [topic, setTopic] = useState('');
  const [ig, setIg] = useState('');
  const [fb, setFb] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    setError('');
    const n = name.trim();
    const e = email.trim();
    const p = phoneNumber.trim();
    const t = topic.trim();
    if (!n) {
      setError('Name is required.');
      return false;
    }
    if (n.length < 2) {
      setError('Name must be at least 2 characters.');
      return false;
    }
    if (!e) {
      setError('Email is required.');
      return false;
    }
    if (!validateEmail(e)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!p) {
      setError('Phone number is required.');
      return false;
    }
    if (!validatePhone(p)) {
      setError('Please enter a valid international phone number starting with + (e.g. +1234567890).');
      return false;
    }
    if (!t) {
      setError('Topic is required.');
      return false;
    }
    if (t.length < 5) {
      setError('Topic must be at least 5 characters.');
      return false;
    }
    if (ig.trim() && !validateUrl(ig)) {
      setError('Please enter a valid Instagram URL.');
      return false;
    }
    if (fb.trim() && !validateUrl(fb)) {
      setError('Please enter a valid Facebook URL.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const body = {
        channelId: MOOD_FM_CHANNEL_ID,
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        topic: topic.trim(),
      };
      const socialLinks = {};
      if (ig.trim()) socialLinks.ig = ig.trim();
      if (fb.trim()) socialLinks.fb = fb.trim();
      if (Object.keys(socialLinks).length > 0) body.socialLinks = socialLinks;

      const response = await fetch(`${API_CONFIG.baseURL}/interview-applicant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || data?.error || 'Submission failed');
        return;
      }
      if (data.success) {
        setSuccess('Thank you for your application! We will get back to you soon.');
        setName('');
        setEmail('');
        setPhoneNumber('');
        setTopic('');
        setIg('');
        setFb('');
      } else {
        setError(data?.message || data?.error || 'Submission failed');
      }
    } catch (err) {
      setError(err?.message === 'Network request failed' ? 'Network error. Check your connection.' : (err?.message || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.bgWrap}>
        <ImageBackground
          source={require('./assets/show-your-talent.png')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content} pointerEvents="box-none">
              <Text style={styles.title}>Are You Talented</Text>
              <Text style={styles.subtitle}>
                Do you have something interesting to talk about
              </Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="e.g. +962791234567"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Topic</Text>
              <TextInput
                style={styles.input}
                value={topic}
                onChangeText={setTopic}
                placeholder="Enter interview topic"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Instagram (optional)</Text>
              <TextInput
                style={styles.input}
                value={ig}
                onChangeText={setIg}
                placeholder="https://instagram.com/username"
                placeholderTextColor={colors.muted}
                keyboardType="url"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Facebook (optional)</Text>
              <TextInput
                style={styles.input}
                value={fb}
                onChangeText={setFb}
                placeholder="https://facebook.com/username"
                placeholderTextColor={colors.muted}
                keyboardType="url"
                autoCapitalize="none"
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? <Text style={styles.successText}>{success}</Text> : null}

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.navbarText} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgWrap: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.sectionTitle,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  label: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSizes.bodyMd,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: fontSizes.bodySm,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: fontSizes.bodySm,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.navbarBg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: fontWeights.bold,
    color: colors.navbarText,
  },
});
