import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../App';
import { Issue, UpdateIssueRequest } from '@citizen-safety/shared';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pickImage, takePhoto } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'EditIssue'>;
type RouteProp = RouteProp<MainStackParamList, 'EditIssue'>;

const CATEGORIES = ['Roads', 'Infrastructure', 'Safety', 'Environment', 'Other'];

export default function EditIssueScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { user } = useAuth();
  const { issue } = route.params;
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [category, setCategory] = useState(issue.category);
  const [images, setImages] = useState<string[]>(issue.images || []);
  const [contactName, setContactName] = useState(issue.contact_name || '');
  const [contactPhone, setContactPhone] = useState(issue.contact_phone || '');
  const [loading, setLoading] = useState(false);

  const handleAddImage = async (source: 'camera' | 'gallery') => {
    try {
      if (images.length >= 3) {
        Alert.alert('Limit Reached', 'You can only add up to 3 images.');
        return;
      }

      const image = source === 'camera' ? await takePhoto() : await pickImage();
      if (image) {
        setImages([...images, image]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add image');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const token = await AsyncStorage.getItem('auth_token');
      
      const updateData: any = {
        userId: user?.id, // Send userId to verify ownership
        title: title.trim(),
        description: description.trim(),
        category: category,
        images: images.length > 0 ? images : undefined,
        contact_name: contactName.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
      };

      const response = await fetch(`${apiBaseUrl}/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update issue' }));
        throw new Error(errorData.error || 'Failed to update issue');
      }

      Alert.alert('Success', 'Issue updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            (navigation as any).navigate('IssueDetail', { issueId: issue.id });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error updating issue:', error);
      Alert.alert('Error', error.message || 'Failed to update issue. Please try again.');
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter issue title"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Images (Max 3)</Text>
        <View style={styles.imageButtons}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleAddImage('camera')}
            disabled={images.length >= 3}
          >
            <Text style={styles.imageButtonText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleAddImage('gallery')}
            disabled={images.length >= 3}
          >
            <Text style={styles.imageButtonText}>🖼️ Gallery</Text>
          </TouchableOpacity>
        </View>
        {images.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Contact Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="Your name"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Contact Phone (Optional)</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="Your phone number"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Update Issue</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    marginHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  categoryButtonActive: {
    backgroundColor: '#0ea5a4',
    borderColor: '#0ea5a4',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  submitButton: {
    backgroundColor: '#0ea5a4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

