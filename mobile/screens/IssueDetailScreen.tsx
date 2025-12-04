import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../App';
import { Issue } from '@citizen-safety/shared';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'IssueDetail'>;
type RouteProp = RouteProp<MainStackParamList, 'IssueDetail'>;

const statusColors: Record<string, string> = {
  open: '#2563eb',
  in_progress: '#ca8a04',
  resolved: '#16a34a',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

export default function IssueDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { user } = useAuth();
  const { issueId } = route.params;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssue();
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await fetch(`${apiBaseUrl}/api/issues/${issueId}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setIssue(data);
    } catch (error) {
      console.error('Error fetching issue:', error);
      Alert.alert('Error', 'Failed to load issue details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (issue) {
      (navigation as any).navigate('EditIssue', { issue });
    }
  };

  const openMap = () => {
    if (issue) {
      const url = `https://www.google.com/maps?q=${issue.location_lat},${issue.location_lng}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open maps');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5a4" />
        <Text style={styles.loadingText}>Loading issue details...</Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Issue not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user && issue.user_id === user.id;

  const primaryImage = issue.images && issue.images.length > 0 ? issue.images[0] : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image Section */}
      <View style={styles.heroSection}>
        {primaryImage ? (
          <Image
            source={{ uri: primaryImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <MaterialCommunityIcons name="image-off" size={64} color="#D1D5DB" />
          </View>
        )}
        <View style={styles.heroOverlay}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{issue.category}</Text>
          </View>
          {isOwner && (
            <TouchableOpacity style={styles.editButtonFloating} onPress={handleEdit}>
              <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{issue.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[issue.status] || '#9CA3AF' },
            ]}
          >
            <Text style={styles.statusText}>
              {statusLabels[issue.status] || issue.status}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionContent}>{issue.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.sectionContent}>
            {issue.location_lat.toFixed(6)}, {issue.location_lng.toFixed(6)}
          </Text>
          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#FFFFFF" />
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>

        {issue.images && issue.images.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>More Images ({issue.images.length - 1})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
              {issue.images.slice(1).map((image, index) => (
                <Image
                  key={index + 1}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {(issue.contact_name || issue.contact_phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            {issue.contact_name && (
              <Text style={styles.sectionContent}>Name: {issue.contact_name}</Text>
            )}
            {issue.contact_phone && (
              <Text style={styles.sectionContent}>Phone: {issue.contact_phone}</Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submitted</Text>
          <Text style={styles.sectionContent}>
            {new Date(issue.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {issue.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <Text style={styles.sectionContent}>{issue.notes}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF', // Soft light lavender background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
    fontWeight: '600',
  },
  heroSection: {
    width: width,
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  editButtonFloating: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 12,
    lineHeight: 36,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  imageContainer: {
    marginTop: 12,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginRight: 12,
  },
  mapButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
    alignSelf: 'flex-start',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});


