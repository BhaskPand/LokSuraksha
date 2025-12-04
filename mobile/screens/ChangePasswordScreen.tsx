import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await fetch(`${apiBaseUrl}/api/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to change password' }));
        throw new Error(errorData.error || 'Failed to change password');
      }

      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Clear password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Current Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your current password"
              placeholderTextColor="#94a3b8"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>New Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password (min 6 characters)"
              placeholderTextColor="#94a3b8"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            <Text style={styles.hint}>Password must be at least 6 characters</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Confirm New Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your new password"
              placeholderTextColor="#94a3b8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0d9488',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

