import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, Dimensions, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import HeaderBar from '../components/HeaderBar';
import IconGridButton from '../components/IconGridButton';
import FooterBanner from '../components/FooterBanner';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const ITEM_WIDTH = (width - GRID_PADDING * 4) / 3; // 3 columns with padding

/**
 * HomeScreen - Main screen with 3x3 grid of action buttons
 * Beautiful LokSuraksha design with red header, grid layout, and SOS button
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Grid items configuration
  const gridItems = [
    { key: 'report', icon: 'cellphone', label: 'Report an Incident', isSOS: false },
    { key: 'call-police', icon: 'shield-police', label: 'Call Police', isSOS: false },
    { key: 'call-admin', icon: 'account-tie', label: 'Call Administration', isSOS: false },
    { key: 'safe-zone', icon: 'map-marker-radius', label: 'My Safe Zone', isSOS: false },
    { key: 'sos', icon: 'alert-circle', label: 'Help Me !!', isSOS: true },
    { key: 'travel-safe', icon: 'bus', label: 'Travel Safe', isSOS: false },
    { key: 'lost-article', icon: 'file-find', label: 'Report Lost Article', isSOS: false },
    { key: 'vehicle-search', icon: 'magnify', label: 'Vehicle Search', isSOS: false },
    { key: 'emergency-calls', icon: 'phone-android', label: 'Emergency Calls', isSOS: false },
  ];

  const handleButtonPress = (key: string) => {
    console.log(`pressed ${key}`);
    
    switch (key) {
      case 'report':
        // Navigate to report screen
        (navigation as any).navigate('MainTabs', { screen: 'Issues' });
        break;
      case 'sos':
        console.log('SOS pressed');
        Alert.alert(
          'Emergency SOS',
          'This will send your location to emergency services. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send SOS',
              style: 'destructive',
              onPress: () => {
                (navigation as any).navigate('SOS');
              },
            },
          ]
        );
        break;
      case 'call-police':
        Alert.alert(
          'Call Police',
          'Do you want to call the police emergency number (100)?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call',
              onPress: () => {
                Linking.openURL('tel:100').catch((err) => {
                  Alert.alert('Error', 'Unable to make call. Please dial 100 manually.');
                });
              },
            },
          ]
        );
        break;
      case 'call-admin':
        Alert.alert(
          'Call Administration',
          'Do you want to call the administration helpline?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call',
              onPress: () => {
                // Using general helpline number - you can customize this
                Linking.openURL('tel:100').catch((err) => {
                  Alert.alert('Error', 'Unable to make call. Please dial the number manually.');
                });
              },
            },
          ]
        );
        break;
      case 'safe-zone':
        (navigation as any).navigate('WomenSafety');
        break;
      case 'travel-safe':
        Alert.alert('Travel Safe', 'Feature coming soon');
        break;
      case 'lost-article':
        Alert.alert('Report Lost Article', 'Feature coming soon');
        break;
      case 'vehicle-search':
        Alert.alert('Vehicle Search', 'Feature coming soon');
        break;
      case 'emergency-calls':
        (navigation as any).navigate('Contact');
        break;
      default:
        console.log(`Action for ${key} not implemented`);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <HeaderBar title="LokSuraksha" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {gridItems.map((item, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const isCenter = row === 1 && col === 1; // Middle center position
            
            return (
              <View
                key={item.key}
                style={[
                  styles.gridItem,
                  { width: ITEM_WIDTH },
                  isCenter && styles.centerItem,
                ]}
              >
                <IconGridButton
                  icon={item.icon}
                  label={item.label}
                  onPress={() => handleButtonPress(item.key)}
                  isSOS={item.isSOS}
                  accessibilityLabel={item.label}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
      
      <FooterBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: GRID_PADDING,
    paddingBottom: 24,
    paddingTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 20,
    alignItems: 'center',
  },
  centerItem: {
    // Center item (SOS) can have special styling if needed
  },
});
