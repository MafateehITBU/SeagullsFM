import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Navbar from '../../components/Navbar';
import { colors } from '../../theme/colors';

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Events</Text>
        <Text style={styles.text}>
          Upcoming events and partnerships.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
});
