import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Animated,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useStaticInfo } from '../context/StaticInfoContext';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerModal({ visible, onClose }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { socialMediaLinks } = useStaticInfo();
  const { isLoggedIn } = useAuth();
  const slideAnim = useRef(new Animated.Value(320)).current;
  const [getInvolvedExpanded, setGetInvolvedExpanded] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { name: 'Home', screen: 'Home' },
    { name: 'About Us', screen: 'About' },
    { name: 'News', screen: 'News' },
    { name: 'Presenters', screen: 'Presenters' },
    { name: 'Events', screen: 'Events' },
    // { name: 'Broadcaster', screen: 'Broadcaster' }, // hidden for now — may re-enable later
  ];

  const getInvolvedItems = [
    { name: 'Get Discovered', screen: 'GetDiscovered' },
    { name: 'Show your talent', screen: 'ShowYourTalent' },
  ];

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 320,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: getInvolvedExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [getInvolvedExpanded]);

  const handleNavigation = (screen) => {
    if (screen) navigation.navigate(screen);
    onClose();
  };

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 104],
  });

  const openUrl = (url) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <Pressable style={{ flex: 1 }} onPress={(e) => e.stopPropagation()}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top }}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Menu</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.screen}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <Text style={styles.menuText}>{item.name}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.menuItem} onPress={() => setGetInvolvedExpanded((v) => !v)}>
                <Text style={styles.menuText}>Get Involved</Text>
                <Ionicons
                  name={getInvolvedExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              <Animated.View style={{ height: dropdownHeight, overflow: 'hidden' }}>
                {getInvolvedItems.map((item) => (
                  <TouchableOpacity
                    key={item.screen}
                    style={styles.subMenuItem}
                    onPress={() => handleNavigation(item.screen)}
                  >
                    <Text style={styles.subMenuText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>

              {!isLoggedIn && (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigation('Login')}
                >
                  <Text style={styles.menuText}>Login</Text>
                </TouchableOpacity>
              )}

              <View style={styles.socialRow}>
                {socialMediaLinks?.facebook ? (
                  <TouchableOpacity onPress={() => openUrl(socialMediaLinks.facebook)}>
                    <Ionicons name="logo-facebook" size={22} color={colors.text} />
                  </TouchableOpacity>
                ) : null}
                {socialMediaLinks?.instagram ? (
                  <TouchableOpacity onPress={() => openUrl(socialMediaLinks.instagram)}>
                    <Ionicons name="logo-instagram" size={22} color={colors.text} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Image
                source={require('../../assets/img/Frequency.png')}
                style={styles.frequency}
                resizeMode="contain"
              />
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawer: {
    width: '78%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: colors.background,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontFamily: fonts.gothamBold,
    fontSize: 18,
    color: colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  menuText: {
    fontFamily: fonts.gotham,
    fontSize: 17,
    color: colors.text,
  },
  subMenuItem: {
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  subMenuText: {
    fontFamily: fonts.gotham,
    fontSize: 15,
    color: colors.textMuted,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
  },
  frequency: {
    width: '80%',
    height: 80,
    alignSelf: 'center',
    marginBottom: 24,
    opacity: 0.95,
  },
});
