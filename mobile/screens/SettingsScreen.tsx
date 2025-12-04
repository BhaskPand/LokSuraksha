import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { registerForPushNotifications } from '../utils/notifications';

const SETTINGS_KEYS = {
  SOS_AUTO_SEND: '@loksuraksha:sos_auto_send',
  SHARE_LOCATION: '@loksuraksha:share_location',
  NOTIFICATIONS: '@loksuraksha:notifications',
  LOCATION_ACCURACY: '@loksuraksha:location_accuracy',
};

export default function SettingsScreen() {
  const { deleteAccount } = useAuth();
  const { colors, isDark, setThemeMode, theme } = useTheme();
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
    if (value) {
      // Register for push notifications when enabled
      await registerForPushNotifications();
    }
  };

  const handleThemeModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete:\n\n• Your account and profile\n• All your reported issues\n• All your settings and data\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              // Navigation will be handled by App.tsx after account deletion
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    // Register for notifications on mount if enabled
    if (notifications) {
      registerForPushNotifications();
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  {theme.mode === 'auto' ? 'Auto (System)' : theme.mode === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </View>
            </View>
            <View style={styles.themeButtons}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: theme.mode === 'light' ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleThemeModeChange('light')}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: theme.mode === 'light' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: theme.mode === 'dark' ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleThemeModeChange('dark')}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: theme.mode === 'dark' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  {
                    backgroundColor: theme.mode === 'auto' ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleThemeModeChange('auto')}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    { color: theme.mode === 'auto' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Emergency Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="alert-circle" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Auto-send SOS</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically send SOS alerts to emergency contacts
                </Text>
              </View>
            </View>
            <Switch
              value={sosAutoSend}
              onValueChange={handleSosToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="map-marker" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Share Live Location</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Allow emergency contacts to see your live location
                </Text>
              </View>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={handleShareLocationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="bell" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive notifications about your reports and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Location</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Location Accuracy</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>High (GPS)</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="delete" size={24} color={colors.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Clear All Data</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Delete all app data and settings
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Account</Text>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="account-remove" size={24} color={colors.error} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.error }]}>Delete Account</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Permanently delete your account and all data
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.border} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>LokSuraksha v1.0.0</Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>© 2024 All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  section: {
    borderRadius: 28,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});




