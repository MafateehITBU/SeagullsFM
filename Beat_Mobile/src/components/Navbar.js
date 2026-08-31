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

  const userImageUri = user?.image?.url || user?.avatar;
  const userInitial = (user?.name || user?.email || '?')[0].toUpperCase();

  return (
    <>
      <View style={[styles.navbar, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.logoContainer}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/img/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/img/Frequency.png')}
            style={styles.frequency}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.rightRow}>
          {!isLoggedIn && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          )}
          {isLoggedIn && (
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => setUserDropdownVisible(true)}
            >
              {userImageUri ? (
                <Image source={{ uri: userImageUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{userInitial}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuButton} onPress={() => setDrawerVisible(true)}>
            <View style={styles.burger}>
              <View style={styles.burgerLine} />
              <View style={styles.burgerLine} />
              <View style={styles.burgerLine} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={userDropdownVisible} transparent animationType="fade">
        <Pressable style={styles.dropdownOverlay} onPress={() => setUserDropdownVisible(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setUserDropdownVisible(false);
                navigation.navigate('Profile');
              }}
            >
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setUserDropdownVisible(false);
                logout();
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.dropdownText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <CustomDrawerModal visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navbarBg,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  logo: {
    height: 40,
    width: 100,
  },
  frequency: {
    height: 50,
    width: 100,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  loginText: {
    fontFamily: fonts.gothamBold,
    color: colors.text,
    fontSize: 14,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.listenPink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: fonts.gothamBold,
    color: '#000',
  },
  menuButton: {
    padding: 8,
  },
  burger: {
    gap: 5,
  },
  burgerLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.text,
    borderRadius: 1,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 16,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 160,
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 14,
  },
  dropdownText: {
    fontFamily: fonts.gotham,
    color: colors.text,
    fontSize: 15,
  },
});
