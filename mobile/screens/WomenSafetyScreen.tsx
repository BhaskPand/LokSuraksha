import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  EmergencyContact,
} from '../utils/emergencyContacts';
import ContactForm from '../components/ContactForm';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { shareLocationWithContacts, sendSOSAlert } from '../utils/emergencyActions';

export default function WomenSafetyScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [sendingSOS, setSendingSOS] = useState(false);

  const loadContacts = async () => {
    try {
      const data = await getEmergencyContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  const handleAddContact = () => {
    setEditingContact(null);
    setFormVisible(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormVisible(true);
  };

  const handleSaveContact = async (contactData: Omit<EmergencyContact, 'id'>) => {
    try {
      if (editingContact) {
        await updateEmergencyContact(editingContact.id, contactData);
      } else {
        await addEmergencyContact(contactData);
      }
      await loadContacts();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteContact = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmergencyContact(contact.id);
              await loadContacts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  const handleShareLocation = async () => {
    const primaryContacts = contacts.filter((c) => c.isPrimary !== false);
    if (primaryContacts.length === 0) {
      Alert.alert('No Contacts', 'Please add at least one primary emergency contact first.');
      return;
    }

    setSharingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to share your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await shareLocationWithContacts(primaryContacts, location);
      Alert.alert('Success', 'Your location has been shared with your emergency contacts.');
    } catch (error) {
      Alert.alert('Error', 'Failed to share location. Please try again.');
    } finally {
      setSharingLocation(false);
    }
  };

  const handleSOS = async () => {
    const primaryContacts = contacts.filter((c) => c.isPrimary !== false);
    if (primaryContacts.length === 0) {
      Alert.alert('No Contacts', 'Please add at least one primary emergency contact first.');
      return;
    }

    Alert.alert(
      'Emergency SOS',
      'This will send an SOS alert with your location to all your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: async () => {
            setSendingSOS(true);
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required for SOS.');
                return;
              }

              const location = await Location.getCurrentPositionAsync({});
              await sendSOSAlert(primaryContacts, location);
              Alert.alert('SOS Sent', 'Your SOS alert has been sent to your emergency contacts.');
            } catch (error) {
              Alert.alert('Error', 'Failed to send SOS. Please try again.');
            } finally {
              setSendingSOS(false);
            }
          },
        },
      ]
    );
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactHeader}>
        <View style={styles.contactInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={24} color="#0d9488" />
          </View>
          <View style={styles.contactDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.contactName}>{item.name}</Text>
              {item.isPrimary !== false && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
            <Text style={styles.contactPhone}>{item.phone}</Text>
            {item.relationship && (
              <Text style={styles.contactRelationship}>{item.relationship}</Text>
            )}
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditContact(item)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteContact(item)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Women Safety</Text>
          <Text style={styles.headerSubtitle}>
            Manage emergency contacts and safety features
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionCard, styles.shareLocationCard]}
            onPress={handleShareLocation}
            disabled={sharingLocation}
          >
            <MaterialCommunityIcons name="map-marker" size={32} color="#0d9488" />
            <Text style={styles.actionTitle}>Share Live Location</Text>
            <Text style={styles.actionDescription}>
              Share your current location with emergency contacts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.sosCard]}
            onPress={handleSOS}
            disabled={sendingSOS}
          >
            <MaterialCommunityIcons name="alert-circle" size={32} color="#dc2626" />
            <Text style={[styles.actionTitle, styles.sosTitle]}>Emergency SOS</Text>
            <Text style={styles.actionDescription}>
              Send SOS alert with location to all contacts
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {contacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="account-plus" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                Add emergency contacts to use safety features
              </Text>
            </View>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContact}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddContact}>
        <MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
      </TouchableOpacity>

      <ContactForm
        visible={formVisible}
        contact={editingContact}
        onClose={() => {
          setFormVisible(false);
          setEditingContact(null);
        }}
        onSave={handleSaveContact}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  quickActions: {
    padding: 16,
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareLocationCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0d9488',
  },
  sosCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  sosTitle: {
    color: '#dc2626',
  },
  actionDescription: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  primaryBadge: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  contactPhone: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#64748b',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
