import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { API_CONFIG } from '../../config/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { fontSizes, fontWeights } from '../../theme/typography';

const DEFAULT_AVATAR = require('../../../assets/img/Logo.png');

function getErrorMessages(data) {
  const messages = [];
  if (data?.message && typeof data.message === 'string') messages.push(data.message);
  if (data?.error && typeof data.error === 'string' && data.error !== data?.message) messages.push(data.error);
  if (Array.isArray(data?.errors)) {
    data.errors.forEach((item) => {
      if (typeof item === 'string') messages.push(item);
      else if (item?.message || item?.msg) messages.push(item.message || item.msg);
    });
  }
  return messages.length ? messages : ['Something went wrong.'];
}

export default function ProfileScreen() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [profileFetchLoading, setProfileFetchLoading] = useState(true);

  const imageUri = profileImageUri ?? user?.image?.url ?? user?.avatar ?? user?.profileImage ?? user?.photo;

  // Fetch full profile from /api/user/me so name, phoneNumber, image are available
  useEffect(() => {
    if (!token) {
      setProfileFetchLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchMe() {
      try {
        const url = `${API_CONFIG.baseURL}/user/me`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (cancelled) return;
        if (response.ok && data.success && data.data) {
          updateUser(data.data);
          setName(data.data.name || '');
          setEmail(data.data.email || '');
          setPhoneNumber(data.data.phoneNumber || '');
        } else if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhoneNumber(user.phoneNumber || '');
        }
      } catch (e) {
        if (!cancelled && user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setPhoneNumber(user.phoneNumber || '');
        }
      } finally {
        if (!cancelled) setProfileFetchLoading(false);
      }
    }
    fetchMe();
    return () => { cancelled = true; };
  }, [token]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to change profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setProfileImageUri(result.assets[0].uri);
      setProfileError('');
    }
  };

  const handleUpdateProfile = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();
    if (!trimmedName) {
      setProfileError('Name is required.');
      return;
    }
    if (!trimmedEmail) {
      setProfileError('Email is required.');
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/profile`;
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('email', trimmedEmail);
      if (trimmedPhone) formData.append('phoneNumber', trimmedPhone);
      if (profileImageUri) {
        formData.append('image', {
          uri: profileImageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        });
      }
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        const msgs = getErrorMessages(data);
        setProfileError(msgs[0] || 'Update failed.');
        return;
      }
      if (data.success && data.data) {
        updateUser(data.data);
        setProfileImageUri(null);
        setProfileSuccess(data.message || 'Profile updated.');
      } else {
        setProfileError(getErrorMessages(data)[0] || 'Update failed.');
      }
    } catch (err) {
      setProfileError(err?.message === 'Network request failed' ? 'Network error.' : (err?.message || 'Update failed.'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Enter a new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirm do not match.');
      return;
    }
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);
    try {
      const url = `${API_CONFIG.baseURL}/user/change-password`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        const msgs = getErrorMessages(data);
        setPasswordError(msgs[0] || 'Password change failed.');
        return;
      }
      if (data.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordSuccess(data.message || 'Password updated.');
      } else {
        setPasswordError(getErrorMessages(data)[0] || 'Password change failed.');
      }
    } catch (err) {
      setPasswordError(err?.message === 'Network request failed' ? 'Network error.' : (err?.message || 'Password change failed.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {profileFetchLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.navbarBg} />
              <Text style={styles.loadingText}>Loading profile…</Text>
            </View>
          ) : (
          <View style={styles.card}>
            <Text style={styles.title}>Profile</Text>

            {/* Avatar */}
            <TouchableOpacity style={styles.avatarWrap} onPress={pickImage} activeOpacity={0.8}>
              {imageUri ? (
                <Image
                  source={{ uri: typeof imageUri === 'string' ? imageUri : imageUri?.url }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <Image source={DEFAULT_AVATAR} style={styles.avatar} resizeMode="contain" />
              )}
              <Text style={styles.changePhotoText}>Change photo</Text>
            </TouchableOpacity>

            {/* Profile form */}
            <Text style={styles.sectionLabel}>Your details</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(t) => { setName(t); setProfileError(''); }}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={(t) => { setEmail(t); setProfileError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor={colors.muted}
              value={phoneNumber}
              onChangeText={(t) => { setPhoneNumber(t); setProfileError(''); }}
              keyboardType="phone-pad"
            />
            {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}
            {profileSuccess ? <Text style={styles.successText}>{profileSuccess}</Text> : null}
            <TouchableOpacity
              style={[styles.primaryButton, profileLoading && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={profileLoading}
            >
              {profileLoading ? (
                <ActivityIndicator color={colors.navbarText} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Update profile</Text>
              )}
            </TouchableOpacity>

            {/* Change password */}
            <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>Change password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor={colors.muted}
              value={currentPassword}
              onChangeText={(t) => { setCurrentPassword(t); setPasswordError(''); }}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={colors.muted}
              value={newPassword}
              onChangeText={(t) => { setNewPassword(t); setPasswordError(''); }}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={colors.muted}
              value={confirmNewPassword}
              onChangeText={(t) => { setConfirmNewPassword(t); setPasswordError(''); }}
              secureTextEntry
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            {passwordSuccess ? <Text style={styles.successText}>{passwordSuccess}</Text> : null}
            <TouchableOpacity
              style={[styles.secondaryButton, passwordLoading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={styles.secondaryButtonText}>Change password</Text>
              )}
            </TouchableOpacity>
          </View>
          )}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sectionGap,
    alignItems: 'center',
  },
  loadingWrap: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.bodyMd,
    fontFamily: fonts.secondary,
    color: colors.muted,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: fontSizes.h2,
    fontWeight: '900',
    fontFamily: fonts.primaryBold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.muted,
  },
  changePhotoText: {
    fontSize: fontSizes.bodySm,
    fontFamily: fonts.secondary,
    color: colors.navbarBg,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: fontSizes.bodyMd,
    fontWeight: '700',
    fontFamily: fonts.secondaryBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionLabelTop: {
    marginTop: spacing.lg,
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
  errorText: {
    fontSize: fontSizes.bodySm,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: fontSizes.bodySm,
    color: colors.success,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.navbarBg,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: '900',
    fontFamily: fonts.secondaryBold,
    color: colors.navbarText,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.navbarBg,
  },
  secondaryButtonText: {
    fontSize: fontSizes.bodyMd,
    fontWeight: '700',
    fontFamily: fonts.secondaryBold,
    color: colors.navbarBg,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
