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
  Linking,
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

export default function ContactScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

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

  const handleCall = (phone: string) => {
    Alert.alert('Call', `Call ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Call', 
        onPress: () => {
          Linking.openURL(`tel:${phone}`).catch((err) => {
            Alert.alert('Error', 'Unable to make call. Please dial the number manually.');
          });
        }
      },
    ]);
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
            onPress={() => handleCall(item.phone)}
          >
            <MaterialCommunityIcons name="phone" size={20} color="#0d9488" />
          </TouchableOpacity>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading contacts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <Text style={styles.headerSubtitle}>
          Manage your emergency contacts for SOS and location sharing
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-plus" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
          <Text style={styles.emptyText}>
            Add emergency contacts to receive SOS alerts and share your location
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadContacts} />
          }
        />
      )}

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
  listContent: {
    padding: 16,
    paddingBottom: 120, // Extra padding for floating tab bar
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
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
