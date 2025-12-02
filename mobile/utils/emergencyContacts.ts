import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
}

const CONTACTS_KEY = '@loksuraksha:emergency_contacts';

/**
 * Get all emergency contacts
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const data = await AsyncStorage.getItem(CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting emergency contacts:', error);
    return [];
  }
}

/**
 * Add a new emergency contact
 */
export async function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
  try {
    const contacts = await getEmergencyContacts();
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    contacts.push(newContact);
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    return newContact;
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    throw error;
  }
}

/**
 * Update an emergency contact
 */
export async function updateEmergencyContact(id: string, updates: Partial<EmergencyContact>): Promise<void> {
  try {
    const contacts = await getEmergencyContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index !== -1) {
      contacts[index] = { ...contacts[index], ...updates };
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    }
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw error;
  }
}

/**
 * Delete an emergency contact
 */
export async function deleteEmergencyContact(id: string): Promise<void> {
  try {
    const contacts = await getEmergencyContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting emergency contact:', error);
    throw error;
  }
}

/**
 * Get primary emergency contacts (for SOS)
 */
export async function getPrimaryContacts(): Promise<EmergencyContact[]> {
  const contacts = await getEmergencyContacts();
  return contacts.filter((c) => c.isPrimary !== false);
}

