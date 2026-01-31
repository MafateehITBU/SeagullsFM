import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerModal from './CustomDrawerModal';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export default function Navbar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, user, logout } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userDropdownVisible, setUserDropdownVisible] = useState(false);

  const userImageUri = user?.image?.url || user?.avatar || user?.profileImage || user?.photo;
  const userInitial = (user?.name || user?.email || '?')[0].toUpperCase();

  const openProfile = () => {
    setUserDropdownVisible(false);
    navigation.navigate('Profile');
  };

  const handleSignOut = () => {
    setUserDropdownVisible(false);
    logout();
    navigation.navigate('Home');
  };

  return (
    <>
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        {/* Logo on the left */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/img/Logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/img/Frequency.png')}
            style={styles.frequencyImage}
            resizeMode="contain"
          />
        </View>

        {/* Right side: Login (when not logged in) / user avatar (when logged in) + burger menu */}
        <View style={styles.rightRow}>
          {!isLoggedIn && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
          {isLoggedIn && (
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setUserDropdownVisible(true)}
              activeOpacity={0.8}
            >
              {userImageUri ? (
                <Image
                  source={{ uri: typeof userImageUri === 'string' ? userImageUri : userImageUri?.url }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{userInitial}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerVisible(true)}
          >
            <View style={styles.burgerIcon}>
              <View style={styles.burgerLine} />
              <View style={styles.burgerLine} />
              <View style={styles.burgerLine} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* User dropdown: Profile, Sign Out */}
      <Modal
        visible={userDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserDropdownVisible(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setUserDropdownVisible(false)}
        >
          <Pressable style={[styles.dropdownBox, { top: insets.top + 56 }]} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.dropdownItem} onPress={openProfile}>
              <Ionicons name="person-outline" size={20} color={colors.text} />
              <Text style={styles.dropdownItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={colors.text} />
              <Text style={styles.dropdownItemText}>Sign Out</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <CustomDrawerModal visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.navbarBg,
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 60,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    height: 50,
    width: 120,
  },
  frequencyImage: {
    height: 50,
    width: 120,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: fonts.secondary,
    color: colors.text,
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.navbarText,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: fonts.secondary,
    color: colors.navbarBg,
  },
  menuButton: {
    padding: 8,
  },
  burgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  burgerLine: {
    width: 24,
    height: 3,
    backgroundColor: colors.navbarText,
    borderRadius: 2,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dropdownBox: {
    position: 'absolute',
    right: 16,
    minWidth: 160,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#404040',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
  },
});
