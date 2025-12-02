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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { MainStackParamList } from '../App';
import { apiClient } from '../api/api';
import { CreateIssueRequest } from '@citizen-safety/shared';
import { pickImage, takePhoto } from '../utils/imageUtils';
import { queueIssue, isOnline } from '../utils/offlineQueue';
import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Report'>;

const CATEGORIES = ['Roads', 'Infrastructure', 'Safety', 'Environment', 'Other'];

export default function ReportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to submit reports.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddImage = async (source: 'camera' | 'gallery') => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'You can add a maximum of 3 images.');
      return;
    }

    const image = source === 'camera' ? await takePhoto() : await pickImage();
    if (image) {
      setImages([...images, image]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category || !location) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    const issueData: CreateIssueRequest = {
      title: title.trim(),
      description: description.trim(),
      category,
      location_lat: location.lat,
      location_lng: location.lng,
      images: images.length > 0 ? images : undefined,
      contact_name: contactName.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
    };

    try {
      const online = await isOnline();

      if (online) {
        try {
          // Add userId to issue data if user is authenticated
          const issueDataWithUser = user?.id ? { ...issueData, userId: user.id } : issueData;
          // Use fetch directly to include userId
          const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
          const token = await AsyncStorage.getItem('auth_token');
          const response = await fetch(`${apiBaseUrl}/api/issues`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(issueDataWithUser),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to create issue' }));
            throw new Error(errorData.error || 'Failed to create issue');
          }
          
          const issue = await response.json();
          (navigation as any).navigate('Success', {
            issueId: issue.id,
            createdAt: issue.created_at,
          });
        } catch (error: any) {
          // If online but API fails, queue it
          console.error('API error, queueing:', error);
          const queueId = await queueIssue(issueData);
          Alert.alert(
            'Queued',
            'Your report has been saved and will be submitted when connection is restored.',
            [
              {
                text: 'OK',
                onPress: () =>
                  (navigation as any).navigate('Success', {
                    issueId: parseInt(queueId.split('_')[1], 10),
                    createdAt: new Date().toISOString(),
                  }),
              },
            ]
          );
        }
      } else {
        // Offline - queue it
        const queueId = await queueIssue(issueData);
        Alert.alert(
          'Offline Mode',
          'Your report has been saved and will be submitted when you have internet connection.',
          [
            {
              text: 'OK',
              onPress: () =>
                (navigation as any).navigate('Success', {
                  issueId: parseInt(queueId.split('_')[1], 10),
                  createdAt: new Date().toISOString(),
                }),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Brief description of the issue"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed description of the issue"
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
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
        <Text style={styles.label}>Images (up to 3)</Text>
        <View style={styles.imageButtons}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleAddImage('camera')}
            disabled={images.length >= 3}
          >
            <Text style={styles.imageButtonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => handleAddImage('gallery')}
            disabled={images.length >= 3}
          >
            <Text style={styles.imageButtonText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            {images.map((img, index) => (
              <View key={index} style={styles.imagePreview}>
                <Image source={{ uri: img }} style={styles.image} />
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
        <Text style={styles.label}>Location</Text>
        {locationLoading ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : location ? (
          <Text style={styles.locationText}>
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </Text>
        ) : (
          <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
            <Text style={styles.locationButtonText}>Get Location</Text>
          </TouchableOpacity>
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

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    backgroundColor: '#0d9488', // Muted teal
    borderColor: '#0d9488',
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
    gap: 8,
    marginBottom: 12,
  },
  imageButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'monospace',
  },
  locationButton: {
    padding: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0d9488', // Muted teal
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

