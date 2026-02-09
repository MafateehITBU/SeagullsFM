import React, { useState } from 'react';
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
import { API_CONFIG, MOOD_FM_CHANNEL_ID } from '../../config/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

/**
 * Normalize API error response into an array of user-facing messages.
 * Handles: message, error, errors[] (strings or { message/msg/field })
 */
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

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState([]);

  const clearErrors = () => {
    setError('');
    setErrors([]);
  };

  const handleSignUp = async () => {
    clearErrors();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!trimmedPhone) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/register`;
      const body = {
        name: trimmedName,
        email: trimmedEmail,
        password,
        phoneNumber: trimmedPhone,
        channelId: MOOD_FM_CHANNEL_ID,
      };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        const msgs = getErrorMessages(data);
        if (msgs.length === 1) {
          setError(msgs[0]);
        } else {
          setErrors(msgs);
        }
        return;
      }

      if (data.success) {
        navigation.replace('Login');
        return;
      }
      const msgs = getErrorMessages(data);
      if (msgs.length === 1) {
        setError(msgs[0]);
      } else {
        setErrors(msgs);
      }
    } catch (err) {
      const msg =
        err?.message === 'Network request failed'
          ? 'Network error. Check your connection.'
          : err?.message || 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasError = error || errors.length > 0;

  return (
    <View style={styles.container}>
      <Navbar />
      <ImageBackground
        source={require('./assets/bg.png')}
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
              <Text style={styles.title}>Sign Up</Text>
              <Text style={styles.subtitle}>Create your Mood FM account</Text>

              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  clearErrors();
                }}
                autoCapitalize="words"
              />
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
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.muted}
                value={phoneNumber}
                onChangeText={(t) => {
                  setPhoneNumber(t);
                  clearErrors();
                }}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  clearErrors();
                }}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  clearErrors();
                }}
                secureTextEntry
              />

              {hasError ? (
                <View style={styles.errorBox}>
                  {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                  ) : null}
                  {errors.map((msg, i) => (
                    <Text key={i} style={styles.errorText}>
                      • {msg}
                    </Text>
                  ))}
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.navbarText} size="small" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signInRow}>
                <Text style={styles.signInPrompt}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.signInLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: 'rgba(44, 44, 44, 0.92)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fonts.secondary,
    color: colors.muted,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 16,
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
    fontSize: 14,
    color: colors.error,
    marginBottom: 4,
  },
  signUpButton: {
    backgroundColor: colors.navbarBg,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Gobold-Bold',
    color: colors.navbarText,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signInPrompt: {
    fontSize: 14,
    fontFamily: fonts.secondary,
    color: colors.muted,
  },
  signInLink: {
    fontSize: 14,
    fontFamily: 'Gobold-Bold',
    color: colors.navbarBg,
    fontWeight: '700',
  },
});
