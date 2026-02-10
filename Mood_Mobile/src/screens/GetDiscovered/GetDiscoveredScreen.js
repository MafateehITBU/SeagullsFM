import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { API_CONFIG, MOOD_FM_CHANNEL_ID } from '../../config/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const GENRE_OPTIONS = [
  'Pop', 'Rock', 'Hip Hop', 'Rap', 'R&B', 'Country', 'Jazz', 'Classical',
  'Electronic', 'Dance', 'Reggae', 'Blues', 'Folk', 'Metal', 'Punk',
  'Alternative', 'Indie', 'Latin', 'World', 'Gospel', 'Soul', 'Funk',
  'Other',
];

export default function GetDiscoveredScreen() {
  const navigation = useNavigation();
  const { token, isLoggedIn } = useAuth();
  const [songName, setSongName] = useState('');
  const [genre, setGenre] = useState('');
  const [pickedFile, setPickedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGenrePicker, setShowGenrePicker] = useState(false);

  // If not signed in, redirect to Login
  useFocusEffect(
    React.useCallback(() => {
      if (!isLoggedIn || !token) {
        navigation.replace('Login');
      }
    }, [isLoggedIn, token, navigation])
  );

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const file = res.assets[0];
      setPickedFile({ uri: file.uri, name: file.name, mimeType: file.mimeType });
      setError('');
    } catch (err) {
      setError(err?.message || 'Failed to pick file');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    const trimmedName = songName.trim();
    if (!trimmedName) {
      setError('Please enter the song name.');
      return;
    }
    if (!genre) {
      setError('Please select a genre.');
      return;
    }
    if (!pickedFile) {
      setError('Please select a song file.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('channelId', MOOD_FM_CHANNEL_ID);
      formData.append('songName', trimmedName);
      formData.append('genre', genre);
      formData.append('songFile', {
        uri: pickedFile.uri,
        type: pickedFile.mimeType || 'audio/mpeg',
        name: pickedFile.name,
      });

      const response = await fetch(`${API_CONFIG.baseURL}/uploadtrack`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || data?.error || 'Upload failed');
        return;
      }
      if (data.success) {
        setSuccess('Track submitted successfully. Our team will review it.');
        setSongName('');
        setGenre('');
        setPickedFile(null);
      } else {
        setError(data?.message || data?.error || 'Upload failed');
      }
    } catch (err) {
      setError(err?.message === 'Network request failed' ? 'Network error. Check your connection.' : (err?.message || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.bgWrap}>
        <ImageBackground
          source={require('./assets/get-discovered.png')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.content} pointerEvents="box-none">
            <Text style={styles.title}>Get Discovered</Text>
            <Text style={styles.subtitle}>
              Share your original music with Mood FM and get discovered by our team.
            </Text>

            <Text style={styles.label}>Song name</Text>
            <TextInput
              style={styles.input}
              value={songName}
              onChangeText={setSongName}
              placeholder="Enter song name"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Genre</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowGenrePicker(!showGenrePicker)}
            >
              <Text style={[styles.inputText, !genre && styles.placeholder]}>
                {genre || 'Select genre'}
              </Text>
            </TouchableOpacity>
            {showGenrePicker && (
              <View style={styles.genreList}>
                {GENRE_OPTIONS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genreChip, genre === g && styles.genreChipSelected]}
                    onPress={() => {
                      setGenre(g);
                      setShowGenrePicker(false);
                    }}
                  >
                    <Text style={[styles.genreChipText, genre === g && styles.genreChipTextSelected]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Song file</Text>
            <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
              <Text style={styles.fileButtonText}>
                {pickedFile ? pickedFile.name : 'Tap to choose audio file'}
              </Text>
            </TouchableOpacity>

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
                <Text style={styles.submitButtonText}>Submit track</Text>
              )}
            </TouchableOpacity>
          </View>
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
  content: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'Fractul-Bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.secondary,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
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
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    color: colors.muted,
  },
  genreList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  genreChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.muted,
    opacity: 0.8,
  },
  genreChipSelected: {
    backgroundColor: colors.navbarBg,
    opacity: 1,
  },
  genreChipText: {
    fontSize: 13,
    color: colors.text,
  },
  genreChipTextSelected: {
    color: colors.navbarText,
    fontWeight: '700',
  },
  fileButton: {
    borderWidth: 2,
    borderColor: colors.navbarBg,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  fileButtonText: {
    fontSize: 14,
    color: colors.navbarBg,
    fontFamily: fonts.secondary,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  successText: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '700',
    color: colors.navbarText,
  },
});
