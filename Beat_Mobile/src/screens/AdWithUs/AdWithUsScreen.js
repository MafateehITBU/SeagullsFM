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
import { API_CONFIG } from '../../config/api';
import { useStaticInfo } from '../../context/StaticInfoContext';
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

export default function AdWithUsScreen() {
  const { channelId } = useStaticInfo();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    setError('');
    const n = name.trim();
    const e = email.trim();
    const c = companyName.trim();
    const p = phoneNumber.trim();
    const m = message.trim();
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
    if (!c) {
      setError('Company name is required.');
      return false;
    }
    if (c.length < 2) {
      setError('Company name must be at least 2 characters.');
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
    if (!m) {
      setError('Message is required.');
      return false;
    }
    if (m.length < 10) {
      setError('Message must be at least 10 characters.');
      return false;
    }
    if (m.length > 500) {
      setError('Message cannot exceed 500 characters.');
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
        channelId: channelId,
        name: name.trim(),
        email: email.trim(),
        companyName: companyName.trim(),
        phoneNumber: phoneNumber.trim(),
        message: message.trim(),
      };

      const response = await fetch(`${API_CONFIG.baseURL}/ad`, {
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
        setSuccess('Thank you for your inquiry! We will get back to you soon.');
        setName('');
        setEmail('');
        setCompanyName('');
        setPhoneNumber('');
        setMessage('');
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
          source={require('./assets/ad-bg.png')}
          style={styles.bgImage}
          resizeMode="contain"
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
              <Text style={styles.title}>Put Your Brand On Air</Text>
              <Text style={styles.subtitle}>
                Promote your brand on Beat FM and connect with an engaged audience through on-air spots, sponsored programs, and digital campaigns.
              </Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Company Name</Text>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Company Name"
                placeholderTextColor={colors.muted}
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

              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Message"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
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
  },
  bgImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85%',
    justifyContent: 'flex-end',
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
    fontWeight: '900',
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
    backgroundColor: colors.buttonBg,
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
    fontWeight: '700',
    color: colors.navbarText,
  },
});
