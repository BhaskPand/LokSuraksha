import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, SafeAreaView, Dimensions, Linking, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import IconGridButton from '../components/IconGridButton';
import FooterBanner from '../components/FooterBanner';

const { width } = Dimensions.get('window');
const CARD_PADDING = 20;
const CARD_SPACING = 16;

/**
 * HomeScreen - Main screen with 3x3 grid of action buttons
 * Beautiful LokSuraksha design with red header, grid layout, and SOS button
 */
export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors } = useTheme();

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
                (navigation as any).navigate('MainTabs', { screen: 'SOS' });
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
        (navigation as any).navigate('MainTabs', { screen: 'WomenSafety' });
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
        (navigation as any).navigate('MainTabs', { screen: 'Contact' });
        break;
      default:
        console.log(`Action for ${key} not implemented`);
    }
  };


  const getCurrentDate = () => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: colors.text }]}>{getGreeting()},</Text>
              <Text style={[styles.userName, { color: colors.primary }]}>{user?.name?.split(' ')[0] || 'User'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.profileButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
              onPress={() => (navigation as any).navigate('Profile')}
            >
              <MaterialCommunityIcons name="account-circle" size={40} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.date, { color: colors.textSecondary }]}>Today {getCurrentDate()}</Text>
        </View>

        {/* Hero Section Card - Daily Challenge style */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Stay Safe Today</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>Report issues and get help quickly</Text>
            </View>
            <View style={[styles.heroIllustration, { backgroundColor: colors.accent + '20' }]}>
              <MaterialCommunityIcons name="shield-check" size={48} color={colors.accent} />
            </View>
          </View>
        </View>

        {/* Section Title */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

        {/* Grid of action cards */}
        <View style={styles.gridContainer}>
          {gridItems.map((item, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const isCenter = row === 1 && col === 1; // Middle center position (SOS)
            
            // Assign pastel colors based on position
            const cardColors = [
              '#E9D5FF', // Pastel purple
              '#FDE68A', // Pastel yellow
              '#FECACA', // Pastel coral
            ];
            const cardColor = cardColors[index % 3];
            
            return (
              <View
                key={item.key}
                style={[
                  styles.gridItem,
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: CARD_PADDING,
    paddingBottom: 120, // Extra padding for floating tab bar (72px height + 16px margin + 32px extra)
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 32,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  heroIllustration: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - CARD_PADDING * 2 - CARD_SPACING * 2) / 3,
    marginBottom: CARD_SPACING,
    alignItems: 'center',
  },
  centerItem: {
    // Center item (SOS) styling handled in IconGridButton
  },
});
