import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

// Set to true to show News and Events in the drawer (screens must be enabled in RootNavigator)
const SHOW_NEWS_AND_EVENTS_IN_NAV = false;

export default function CustomDrawer(props) {
  const navigation = useNavigation();

  const allMenuItems = [
    { name: 'Home', screen: 'Home' },
    { name: 'About us', screen: 'About' },
    ...(SHOW_NEWS_AND_EVENTS_IN_NAV ? [{ name: 'News', screen: 'News' }, { name: 'Events', screen: 'Events' }] : []),
    { name: 'Presenters', screen: 'Presenters' },
    { name: 'Login', screen: 'Login' },
  ];
  const menuItems = allMenuItems;

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    navigation.closeDrawer();
  };

  return (
    <View style={styles.drawerContainer}>
      <ScrollView style={styles.drawerContent}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerHeaderText}>Menu</Text>
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

        {/* AD WITH US Button */}
        <TouchableOpacity
          style={styles.adButton}
          onPress={() => {
            // Handle AD WITH US navigation
            navigation.closeDrawer();
            // Add your navigation logic here
          }}
        >
          <Text style={styles.adButtonText}>AD WITH US</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.navbarText,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.navbarText,
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
  },
});
