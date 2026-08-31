import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import { API_CONFIG } from '../../config/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';

const PHASE_EMAIL = 1;
const PHASE_OTP = 2;
const PHASE_RESET = 3;

function getErrorMessages(data) {
  const messages = [];
  if (data?.message && typeof data.message === 'string') {
    messages.push(data.message);
  }
  if (data?.error && typeof data.error === 'string' && data.error !== data.message) {
    messages.push(data.error);
  }
  if (Array.isArray(data?.errors)) {
    data.errors.forEach((item) => {
      if (typeof item === 'string') {
        messages.push(item);
      } else if (item && (item.message || item.msg)) {
        const msg = item.message || item.msg;
        const field = item.field || item.path ? `${item.field || item.path}: ` : '';
        messages.push(field ? `${field}${msg}` : msg);
      }
    });
  }
  return messages.length ? messages : ['Something went wrong. Please try again.'];
}

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [phase, setPhase] = useState(PHASE_EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);
  const otpInputRef = useRef(null);

  const clearErrors = () => {
    setError('');
    setErrors([]);
  };

  const handleSendOtp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/send-otp`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        const msgs = getErrorMessages(data);
        if (msgs.length === 1) setError(msgs[0]);
        else setErrors(msgs);
        return;
      }
      if (data.success !== false) {
        setPhase(PHASE_OTP);
        setOtp('');
        return;
      }
      const msgs = getErrorMessages(data);
      if (msgs.length === 1) setError(msgs[0]);
      else setErrors(msgs);
    } catch (err) {
      setError(
        err?.message === 'Network request failed'
          ? 'Network error. Check your connection.'
          : err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    clearErrors();
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.replace(/\D/g, '').trim();
    if (trimmedOtp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/verify-otp`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, otp: trimmedOtp }),
      });
      const data = await response.json();

      if (!response.ok) {
        const msgs = getErrorMessages(data);
        if (msgs.length === 1) setError(msgs[0]);
        else setErrors(msgs);
        return;
      }
      if (data.success !== false) {
        setPhase(PHASE_RESET);
        setNewPassword('');
        setConfirmNewPassword('');
        return;
      }
      const msgs = getErrorMessages(data);
      if (msgs.length === 1) setError(msgs[0]);
      else setErrors(msgs);
    } catch (err) {
      setError(
        err?.message === 'Network request failed'
          ? 'Network error. Check your connection.'
          : err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!newPassword) {
      setError('Please enter your new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('New password and Confirm password do not match.');
      return;
    }
    clearErrors();
    setLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/reset-password`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          newPassword,
          confirmNewPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        const msgs = getErrorMessages(data);
        if (msgs.length === 1) setError(msgs[0]);
        else setErrors(msgs);
        return;
      }
      if (data.success !== false) {
        navigation.replace('Login');
        return;
      }
      const msgs = getErrorMessages(data);
      if (msgs.length === 1) setError(msgs[0]);
      else setErrors(msgs);
    } catch (err) {
      setError(
        err?.message === 'Network request failed'
          ? 'Network error. Check your connection.'
          : err?.message || 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  };

  const goBackPhase = () => {
    clearErrors();
    if (phase === PHASE_OTP) setPhase(PHASE_EMAIL);
    else if (phase === PHASE_RESET) setPhase(PHASE_OTP);
  };

  const hasError = error || errors.length > 0;

  return (
    <View style={styles.container}>
      <Navbar />
      <ImageBackground
        source={require('../Login/assets/bg.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Forgot Password</Text>

              {/* Phase 1: Email only */}
              {phase === PHASE_EMAIL && (
                <>
                  <Text style={styles.subtitle}>
                    Enter your email and we'll send you a one-time code to reset your password.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      clearErrors();
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {hasError ? (
                    <View style={styles.errorBox}>
                      {error ? <Text style={styles.errorText}>{error}</Text> : null}
                      {errors.map((msg, i) => (
                        <Text key={i} style={styles.errorText}>• {msg}</Text>
                      ))}
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                    onPress={handleSendOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.navbarText} size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Phase 2: OTP – 6 squares, no email */}
              {phase === PHASE_OTP && (
                <>
                  <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to your email.
                  </Text>
                  <Text style={styles.otpLabel}>Enter code</Text>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.otpRow}
                    onPress={() => otpInputRef.current?.focus()}
                  >
                    <TextInput
                      ref={otpInputRef}
                      style={styles.otpInputHidden}
                      value={otp}
                      onChangeText={handleOtpChange}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus={phase === PHASE_OTP}
                    />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.otpBox,
                          otp.length === i && styles.otpBoxActive,
                        ]}
                      >
                        <Text style={styles.otpBoxText}>
                          {otp[i] ?? ''}
                        </Text>
                      </View>
                    ))}
                  </TouchableOpacity>
                  {hasError ? (
                    <View style={styles.errorBox}>
                      {error ? <Text style={styles.errorText}>{error}</Text> : null}
                      {errors.map((msg, i) => (
                        <Text key={i} style={styles.errorText}>• {msg}</Text>
                      ))}
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.navbarText} size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton} onPress={goBackPhase}>
                    <Text style={styles.secondaryButtonText}>Change email</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Phase 3: New password only, no email */}
              {phase === PHASE_RESET && (
                <>
                  <Text style={styles.subtitle}>
                    Enter your new password below.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor={colors.muted}
                    value={newPassword}
                    onChangeText={(t) => {
                      setNewPassword(t);
                      clearErrors();
                    }}
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm New Password"
                    placeholderTextColor={colors.muted}
                    value={confirmNewPassword}
                    onChangeText={(t) => {
                      setConfirmNewPassword(t);
                      clearErrors();
                    }}
                    secureTextEntry
                  />
                  {hasError ? (
                    <View style={styles.errorBox}>
                      {error ? <Text style={styles.errorText}>{error}</Text> : null}
                      {errors.map((msg, i) => (
                        <Text key={i} style={styles.errorText}>• {msg}</Text>
                      ))}
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.navbarText} size="small" />
                    ) : (
                      <Text style={styles.submitButtonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryButton} onPress={goBackPhase}>
                    <Text style={styles.secondaryButtonText}>Back to OTP</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => (phase === PHASE_EMAIL ? navigation.goBack() : goBackPhase())}
              >
                <Text style={styles.backLinkText}>
                  {phase === PHASE_EMAIL ? 'Back to Sign In' : 'Back'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgImage: {
    flex: 1,
    width: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(44, 44, 44, 0.92)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  title: {
    fontSize: fontSizes.h2,
    fontWeight: '900',
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    marginBottom: spacing.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  otpLabel: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  otpRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  otpInputHidden: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    fontSize: 1,
  },
  otpBox: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    maxWidth: 48,
    marginHorizontal: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxActive: {
    borderColor: colors.navbarBg,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 222, 0, 0.2)',
  },
  otpBoxText: {
    fontSize: fontSizes.h3,
    fontWeight: '900',
    fontFamily: fonts.primaryBold,
    color: colors.text,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.bodyMd,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  errorBox: {
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.4)',
  },
  errorText: {
    fontSize: fontSizes.bodySm,
    color: colors.error,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  submitButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: '900',
    fontFamily: fonts.secondaryBold,
    color: colors.navbarText,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.accentCyan,
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backLinkText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.accentCyan,
  },
});
