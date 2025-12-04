import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const navigation = useNavigation();

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  const handleLogout = async () => {
    await logout();
  };

  // Mock stats - in production, fetch from API
  const stats = {
    reportsSubmitted: 12,
    issuesResolved: 8,
    avgResponseTime: '2.5h',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="account" size={64} color="#8B5CF6" />
            </View>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.location}>
            {user?.email || ''}
            {user?.phone && ` • ${user.phone}`}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#E9D5FF' }]}>
            <Text style={styles.statValue}>{stats.reportsSubmitted}</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FDE68A' }]}>
            <Text style={styles.statValue}>{stats.issuesResolved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FECACA' }]}>
            <Text style={styles.statValue}>{stats.avgResponseTime}</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => (navigation as any).navigate('EditProfile')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="account-edit" size={24} color="#8B5CF6" />
            <Text style={styles.menuText}>Edit Profile</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => (navigation as any).navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="lock" size={24} color="#8B5CF6" />
            <Text style={styles.menuText}>Change Password</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ViewIssues' as any)}
          >
            <MaterialCommunityIcons name="file-document-multiple" size={24} color="#8B5CF6" />
            <Text style={styles.menuText}>My Reports</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings' as any)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="shield-account" size={24} color="#8B5CF6" />
            <Text style={styles.menuText}>Privacy & Security</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert(
              'Help & Support',
              'For assistance, please contact:\n\nEmail: support@loksuraksha.com\nPhone: 100\n\nWe are here to help you 24/7!'
            )}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="help-circle" size={24} color="#8B5CF6" />
            <Text style={styles.menuText}>Help & Support</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert(
              'About LokSuraksha',
              'LokSuraksha v1.0.0\n\nA citizen safety app designed to help you report issues, contact emergency services, and stay safe.\n\n© 2024 All rights reserved'
            )}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="information" size={24} color="#8B5CF6" />
            <Text style={styles.menuText}>About</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
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
  content: {
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
    width: 120,
    height: 120,
    borderRadius: 60,
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
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  location: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 28,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '700',
    marginLeft: 12,
  },
});


