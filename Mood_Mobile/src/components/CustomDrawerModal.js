import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Pressable, Animated, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useStaticInfo } from '../context/StaticInfoContext';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerModal({ visible, onClose }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { socialMediaLinks } = useStaticInfo();
  const { isLoggedIn } = useAuth();
  const slideAnim = useRef(new Animated.Value(300)).current; // Start off-screen to the right
  const [getInvolvedExpanded, setGetInvolvedExpanded] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const menuItems = [
    { name: 'Home', screen: 'Home' },
    { name: 'About us', screen: 'About' },
    { name: 'News', screen: 'News' },
    { name: 'Events', screen: 'Events' },
    { name: 'Presenters', screen: 'Presenters' },
  ];
  // When not logged in, show Login in drawer; when logged in, Profile/Sign Out are in navbar dropdown
  const showLoginInDrawer = !isLoggedIn;

  const handleNavigation = (screen) => {
    if (screen) {
      navigation.navigate(screen);
    }
    onClose();
  };

  useEffect(() => {
    if (visible) {
      // Slide in from right
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide out to right
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: getInvolvedExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [getInvolvedExpanded]);

  const toggleGetInvolved = () => {
    setGetInvolvedExpanded(!getInvolvedExpanded);
  };

  const openUrl = (url) => {
    if (url && typeof url === 'string') {
      Linking.openURL(url).catch(() => {});
    }
  };

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 104], // Height for 2 sub-items (52px each)
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          style={[
            styles.drawerContainer, 
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
          <ScrollView style={styles.drawerContent} contentContainerStyle={{ paddingTop: insets.top }}>
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerHeaderText}>Menu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.navbarText} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigation(item.screen)}
              >
                <Text style={styles.menuItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}

            {/* Get Involved Dropdown */}
            <View>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleGetInvolved}
              >
                <View style={styles.dropdownHeader}>
                  <Text style={styles.menuItemText}>Get Involved</Text>
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: dropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                    }}
                  >
                    <MaterialCommunityIcons name="chevron-down" size={20} color={colors.text} />
                  </Animated.View>
                </View>
              </TouchableOpacity>
              
              <Animated.View
                style={[
                  styles.dropdownContent,
                  {
                    maxHeight: dropdownHeight,
                    opacity: dropdownAnim,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.subMenuItem}
                  onPress={() => {
                    handleNavigation('GetDiscovered');
                    setGetInvolvedExpanded(false);
                  }}
                >
                  <Text style={styles.subMenuItemText}>Get Discovered</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.subMenuItem}
                  onPress={() => {
                    handleNavigation('ShowYourTalent');
                    setGetInvolvedExpanded(false);
                  }}
                >
                  <Text style={styles.subMenuItemText}>Show Your Talent</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Login (only when not logged in; when logged in use navbar avatar dropdown) */}
            {showLoginInDrawer && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleNavigation('Login')}
              >
                <Text style={styles.menuItemText}>Login</Text>
              </TouchableOpacity>
            )}

            {/* AD WITH US Button */}
            <TouchableOpacity
              style={styles.adButton}
              onPress={() => handleNavigation('AdWithUs')}
            >
              <Text style={styles.adButtonText}>AD WITH US</Text>
            </TouchableOpacity>

            {/* Social Media Icons - URLs from static info (MoodFM) */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialIcon}
                onPress={() => openUrl(socialMediaLinks?.facebook)}
              >
                <FontAwesome5 name="facebook-f" size={20} color={colors.navbarText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialIcon}
                onPress={() => openUrl(socialMediaLinks?.instagram)}
              >
                <FontAwesome5 name="instagram" size={20} color={colors.navbarText} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialIcon}
                onPress={() => openUrl(socialMediaLinks?.twitter)}
              >
                <MaterialCommunityIcons name="twitter" size={20} color={colors.navbarText} />
              </TouchableOpacity>
            </View>

            {/* White Logo and Frequency at bottom */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/img/Logowhite.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Image 
                source={require('../../assets/img/Frequencywhite.png')} 
                style={styles.frequencyImage}
                resizeMode="contain"
              />
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.background,
    alignSelf: 'flex-end',
    paddingTop: 0,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: fonts.primary,
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: fonts.secondary,
    color: colors.text,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  dropdownContent: {
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  subMenuItem: {
    padding: 16,
    paddingLeft: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  subMenuItemText: {
    fontSize: 15,
    fontFamily: fonts.secondary,
    color: colors.text,
    opacity: 0.9,
  },
  adButton: {
    margin: 16,
    marginTop: 20,
    backgroundColor: colors.buttonBg,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  adButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.secondary,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 20,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navbarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 30,
    paddingBottom: 40,
  },
  logoImage: {
    height: 100,
    width: 150,
  },
  frequencyImage: {
    height: 100,
    width: 150,
  },
});
