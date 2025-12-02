import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, DrawerActions } from '@react-navigation/native';

/**
 * DrawerContent - Animated drawer menu with user info and navigation options
 */
export default function DrawerContent() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const menuItems = [
    {
      icon: 'home',
      label: 'Home',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        (navigation as any).navigate('MainTabs', { screen: 'Home' });
      },
    },
    {
      icon: 'file-document-multiple',
      label: 'My Issues',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        (navigation as any).navigate('ViewIssues');
      },
    },
    {
      icon: 'alert-circle',
      label: 'SOS',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        (navigation as any).navigate('MainTabs', { screen: 'SOS' });
      },
    },
    {
      icon: 'shield-account',
      label: 'Women Safety',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        (navigation as any).navigate('MainTabs', { screen: 'WomenSafety' });
      },
    },
    {
      icon: 'phone',
      label: 'Contact',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        (navigation as any).navigate('MainTabs', { screen: 'Contact' });
      },
    },
    {
      icon: 'account-circle',
      label: 'Profile',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        // TODO: Navigate to profile
      },
    },
    {
      icon: 'cog',
      label: 'Settings',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
        // TODO: Navigate to settings
      },
    },
  ];

  const handleLogout = async () => {
    navigation.dispatch(DrawerActions.closeDrawer());
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={40} color="#0ea5a4" />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color="#475569"
              style={styles.menuIcon}
            />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#cbd5e1"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#c62828',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
    marginLeft: 12,
  },
});

