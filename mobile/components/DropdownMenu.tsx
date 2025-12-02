import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}

/**
 * DropdownMenu - Animated dropdown menu with smooth slide-down effect
 */
export default function DropdownMenu() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const menuItems: MenuItem[] = [
    {
      icon: 'home',
      label: 'Home',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('MainTabs', { screen: 'Home' });
      },
    },
    {
      icon: 'file-document-multiple',
      label: 'My Issues',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('ViewIssues');
      },
    },
    {
      icon: 'alert-circle',
      label: 'SOS',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('MainTabs', { screen: 'SOS' });
      },
    },
    {
      icon: 'shield-account',
      label: 'Women Safety',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('MainTabs', { screen: 'WomenSafety' });
      },
    },
    {
      icon: 'phone',
      label: 'Contact',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('MainTabs', { screen: 'Contact' });
      },
    },
    {
      icon: 'account-circle',
      label: 'Profile',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('Profile');
      },
    },
    {
      icon: 'cog',
      label: 'Settings',
      onPress: () => {
        closeMenu();
        (navigation as any).navigate('Settings');
      },
    },
    {
      icon: 'logout',
      label: 'Logout',
      onPress: async () => {
        closeMenu();
        await logout();
      },
      danger: true,
    },
  ];

  const closeMenu = () => {
    setVisible(false);
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  return (
    <>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => setVisible(true)}
        accessibilityLabel="Open menu"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons name="menu" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.menuContainer,
                {
                  opacity: opacityAnim,
                  transform: [{ translateY }],
                },
              ]}
            >
              <View style={styles.menuHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <MaterialCommunityIcons name="account" size={32} color="#0ea5a4" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || ''}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuItems}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.menuItem,
                      item.danger && styles.dangerItem,
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={22}
                      color={item.danger ? '#dc2626' : '#475569'}
                      style={styles.menuIcon}
                    />
                    <Text
                      style={[
                        styles.menuLabel,
                        item.danger && styles.dangerLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuHeader: {
    backgroundColor: '#c62828',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dangerItem: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 4,
  },
  menuIcon: {
    marginRight: 16,
    width: 22,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  dangerLabel: {
    color: '#dc2626',
    fontWeight: '600',
  },
});

