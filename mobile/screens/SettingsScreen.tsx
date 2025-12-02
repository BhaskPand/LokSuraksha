import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEYS = {
  SOS_AUTO_SEND: '@loksuraksha:sos_auto_send',
  SHARE_LOCATION: '@loksuraksha:share_location',
  NOTIFICATIONS: '@loksuraksha:notifications',
  LOCATION_ACCURACY: '@loksuraksha:location_accuracy',
};

export default function SettingsScreen() {
  const [sosAutoSend, setSosAutoSend] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [locationAccuracy, setLocationAccuracy] = useState('high');

  const handleSosToggle = async (value: boolean) => {
    setSosAutoSend(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.SOS_AUTO_SEND, JSON.stringify(value));
  };

  const handleShareLocationToggle = async (value: boolean) => {
    setShareLocation(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.SHARE_LOCATION, JSON.stringify(value));
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem(SETTINGS_KEYS.NOTIFICATIONS, JSON.stringify(value));
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your reports, contacts, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear all AsyncStorage data
            await AsyncStorage.clear();
            Alert.alert('Success', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#475569" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto-send SOS</Text>
                <Text style={styles.settingDescription}>
                  Automatically send SOS alerts to emergency contacts
                </Text>
              </View>
            </View>
            <Switch
              value={sosAutoSend}
              onValueChange={handleSosToggle}
              trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#475569" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Share Live Location</Text>
                <Text style={styles.settingDescription}>
                  Allow emergency contacts to see your live location
                </Text>
              </View>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={handleShareLocationToggle}
              trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="bell" size={24} color="#475569" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications about your reports and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#cbd5e1', true: '#0d9488' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#475569" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Accuracy</Text>
                <Text style={styles.settingDescription}>High (GPS)</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="delete" size={24} color="#dc2626" />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: '#dc2626' }]}>Clear All Data</Text>
                <Text style={styles.settingDescription}>
                  Delete all app data and settings
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>LokSuraksha v1.0.0</Text>
          <Text style={styles.footerText}>© 2024 All rights reserved</Text>
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
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
});

