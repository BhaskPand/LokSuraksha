import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getPrimaryContacts } from '../utils/emergencyContacts';
import { sendSOSAlert, shareLocationWithContacts } from '../utils/emergencyActions';

interface EmergencyNumber {
  name: string;
  number: string;
  icon: string;
  color: string;
  description: string;
}

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    name: 'Police',
    number: '100',
    icon: 'shield-alert',
    color: '#2563eb',
    description: 'Emergency police services',
  },
  {
    name: 'Ambulance',
    number: '102',
    icon: 'ambulance',
    color: '#dc2626',
    description: 'Medical emergency services',
  },
  {
    name: 'Fire',
    number: '101',
    icon: 'fire-truck',
    color: '#ea580c',
    description: 'Fire and rescue services',
  },
  {
    name: 'Women Helpline',
    number: '1091',
    icon: 'account-alert',
    color: '#c026d3',
    description: 'Women safety helpline',
  },
  {
    name: 'Child Helpline',
    number: '1098',
    icon: 'baby-face-outline',
    color: '#16a34a',
    description: 'Child protection services',
  },
  {
    name: 'Domestic Violence',
    number: '181',
    icon: 'home-alert',
    color: '#dc2626',
    description: 'Domestic violence helpline',
  },
  {
    name: 'Disaster Management',
    number: '108',
    icon: 'alert-octagon',
    color: '#ea580c',
    description: 'Disaster emergency services',
  },
  {
    name: 'Traffic Police',
    number: '103',
    icon: 'car-multiple',
    color: '#2563eb',
    description: 'Traffic emergency services',
  },
];

export default function SOSScreen() {
  const [sendingSOS, setSendingSOS] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);

  const handleSOS = async () => {
    try {
      const contacts = await getPrimaryContacts();
      if (contacts.length === 0) {
        Alert.alert(
          'No Emergency Contacts',
          'Please add emergency contacts in the Contact or Women Safety section first.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Emergency SOS',
        `This will send an SOS alert with your location to ${contacts.length} emergency contact(s). Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send SOS',
            style: 'destructive',
            onPress: async () => {
              setSendingSOS(true);
              try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Location permission is required for SOS.');
                  return;
                }

                const location = await Location.getCurrentPositionAsync({});
                await sendSOSAlert(contacts, location);
                Alert.alert('SOS Sent', 'Your SOS alert has been sent to your emergency contacts.');
              } catch (error) {
                Alert.alert('Error', 'Failed to send SOS. Please try again.');
              } finally {
                setSendingSOS(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to load emergency contacts.');
    }
  };

  const handleShareLocation = async () => {
    try {
      const contacts = await getPrimaryContacts();
      if (contacts.length === 0) {
        Alert.alert(
          'No Emergency Contacts',
          'Please add emergency contacts in the Contact or Women Safety section first.',
          [{ text: 'OK' }]
        );
        return;
      }

      setSharingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to share your location.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        await shareLocationWithContacts(contacts, location);
        Alert.alert('Success', 'Your location has been shared with your emergency contacts.');
      } catch (error) {
        Alert.alert('Error', 'Failed to share location. Please try again.');
      } finally {
        setSharingLocation(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load emergency contacts.');
    }
  };

  const handleCallEmergency = (emergency: EmergencyNumber) => {
    Alert.alert(
      `Call ${emergency.name}`,
      `Do you want to call ${emergency.name} at ${emergency.number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${emergency.number}`).catch((err) => {
              Alert.alert('Error', `Unable to make call. Please dial ${emergency.number} manually.`);
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="alert-circle" size={64} color="#dc2626" />
          </View>
          <Text style={styles.title}>Emergency SOS</Text>
          <Text style={styles.subtitle}>
            Get immediate help by sending your location to emergency contacts
          </Text>
        </View>

        {/* Main SOS Button */}
        <TouchableOpacity
          style={[styles.sosButton, sendingSOS && styles.buttonDisabled]}
          onPress={handleSOS}
          disabled={sendingSOS}
          activeOpacity={0.8}
        >
          <View style={styles.sosButtonInner}>
            <MaterialCommunityIcons name="alert-circle" size={56} color="#fff" />
            <Text style={styles.sosButtonText}>
              {sendingSOS ? 'Sending SOS...' : 'SEND SOS'}
            </Text>
            <Text style={styles.sosButtonSubtext}>
              Tap to send emergency alert with your location
            </Text>
          </View>
        </TouchableOpacity>

        {/* Share Location Button */}
        <TouchableOpacity
          style={[styles.shareButton, sharingLocation && styles.buttonDisabled]}
          onPress={handleShareLocation}
          disabled={sharingLocation}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="map-marker" size={28} color="#0d9488" />
          <Text style={styles.shareButtonText}>
            {sharingLocation ? 'Sharing...' : 'Share Live Location'}
          </Text>
        </TouchableOpacity>

        {/* Emergency Numbers Section */}
        <View style={styles.emergencySection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="phone-alert" size={24} color="#1e293b" />
            <Text style={styles.sectionTitle}>Emergency Numbers</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Quick access to public emergency services
          </Text>

          <View style={styles.emergencyGrid}>
            {EMERGENCY_NUMBERS.map((emergency, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.emergencyCard, { borderLeftColor: emergency.color }]}
                onPress={() => handleCallEmergency(emergency)}
                activeOpacity={0.7}
              >
                <View style={[styles.emergencyIconContainer, { backgroundColor: `${emergency.color}15` }]}>
                  <MaterialCommunityIcons
                    name={emergency.icon as any}
                    size={28}
                    color={emergency.color}
                  />
                </View>
                <View style={styles.emergencyInfo}>
                  <Text style={styles.emergencyName}>{emergency.name}</Text>
                  <Text style={styles.emergencyNumber}>{emergency.number}</Text>
                  <Text style={styles.emergencyDescription} numberOfLines={1}>
                    {emergency.description}
                  </Text>
                </View>
                <MaterialCommunityIcons name="phone" size={20} color={emergency.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={24} color="#0d9488" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoDescription}>
              • SOS sends an emergency alert with your location to all primary contacts{'\n'}
              • Share Location sends your current location without an emergency alert{'\n'}
              • Emergency Numbers provide quick access to public services{'\n'}
              • Make sure you have added emergency contacts in the Contact section
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 20,
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 10,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  sosButton: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  sosButtonInner: {
    alignItems: 'center',
  },
  sosButtonText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  sosButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0d9488',
    marginBottom: 32,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0d9488',
    marginLeft: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emergencySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    marginLeft: 34,
  },
  emergencyGrid: {
    gap: 12,
  },
  emergencyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderLeftWidth: 4,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emergencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    letterSpacing: 1,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 22,
  },
});
