import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  color?: string;
}

export default function MenuScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Home',
      color: '#8B5CF6',
      onPress: () => {
        (navigation as any).navigate('MainTabs', { screen: 'Home' });
      },
    },
    {
      icon: 'file-document-multiple',
      label: 'My Issues',
      color: '#F59E0B',
      onPress: () => {
        (navigation as any).navigate('ViewIssues');
      },
    },
    {
      icon: 'alert-circle',
      label: 'SOS',
      color: '#F87171',
      onPress: () => {
        (navigation as any).navigate('MainTabs', { screen: 'SOS' });
      },
    },
    {
      icon: 'shield-account',
      label: 'Women Safety',
      color: '#E9D5FF',
      onPress: () => {
        (navigation as any).navigate('MainTabs', { screen: 'WomenSafety' });
      },
    },
    {
      icon: 'phone',
      label: 'Contact',
      color: '#FDE68A',
      onPress: () => {
        (navigation as any).navigate('MainTabs', { screen: 'Contact' });
      },
    },
    {
      icon: 'account-circle',
      label: 'Profile',
      color: '#FECACA',
      onPress: () => {
        (navigation as any).navigate('Profile');
      },
    },
    {
      icon: 'cog',
      label: 'Settings',
      color: '#A5B4FC',
      onPress: () => {
        (navigation as any).navigate('Settings');
      },
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={48} color="#8B5CF6" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Menu Items Grid */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color || '#E9D5FF' }]}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={28}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, styles.logoutIconContainer]}>
            <MaterialCommunityIcons name="logout" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF', // Soft light lavender background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E9D5FF',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    marginTop: 8,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  logoutIconContainer: {
    backgroundColor: '#F87171',
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  logoutLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
});

