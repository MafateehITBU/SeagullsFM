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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG } from '../../config/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || data?.error || `Sign in failed (${response.status})`);
        return;
      }
      if (data.success && (data.token || data.data?.token)) {
        const authToken = data.token || data.data?.token;
        const userData = data.user || data.data?.user || { email: trimmedEmail };
        login(authToken, userData);
        navigation.replace('Home');
      } else {
        setError(data?.message || data?.error || 'Sign in failed.');
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
              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Welcome back to Beat FM</Text>

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.forgotLink}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotLinkText}>Forgot password?</Text>
              </TouchableOpacity>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.signInButton, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.navbarText} size="small" />
                ) : (
                  <Text style={styles.signInButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signUpRow}>
                <Text style={styles.signUpPrompt}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.signUpLink}>Sign up</Text>
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
    fontSize: fontSizes.h2,
    fontWeight: fontWeights.black,
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.bodySm,
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
    fontSize: fontSizes.bodyMd,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotLinkText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.accentCyan,
  },
  errorText: {
    fontSize: fontSizes.bodySm,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  signInButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: fontWeights.black,
    fontFamily: fonts.secondaryBold,
    color: colors.navbarText,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  signUpPrompt: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.muted,
  },
  signUpLink: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondaryBold,
    color: colors.accentCyan,
    fontWeight: fontWeights.bold,
  },
});
