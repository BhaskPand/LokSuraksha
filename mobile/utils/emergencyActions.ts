import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import * as SMS from 'expo-sms';
import { EmergencyContact } from './emergencyContacts';

/**
 * Share live location with emergency contacts via SMS
 */
export async function shareLocationWithContacts(
  contacts: EmergencyContact[],
  location: Location.LocationObject
): Promise<void> {
  const lat = location.coords.latitude;
  const lng = location.coords.longitude;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const message = `🚨 LokSuraksha - Live Location\n\nI'm sharing my current location:\n\n📍 Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n🗺️ Map: ${googleMapsUrl}\n\nTime: ${new Date().toLocaleString()}`;

  // Open SMS app with pre-filled message
  const phoneNumbers = contacts.map((c) => c.phone).join(',');
  const smsUrl = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(smsUrl);
  } catch (error) {
    console.error('Error opening SMS:', error);
    // Fallback: try individual SMS links
    for (const contact of contacts) {
      const individualSmsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      try {
        await Linking.openURL(individualSmsUrl);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between opens
      } catch (err) {
        console.error(`Error opening SMS for ${contact.name}:`, err);
      }
    }
  }
}

/**
 * Send SOS alert with location to emergency contacts
 */
export async function sendSOSAlert(
  contacts: EmergencyContact[],
  location: Location.LocationObject
): Promise<void> {
  const lat = location.coords.latitude;
  const lng = location.coords.longitude;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const message = `🚨 EMERGENCY SOS ALERT 🚨\n\nI need immediate help!\n\n📍 My Location:\nCoordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}\nMap: ${googleMapsUrl}\n\n⏰ Time: ${new Date().toLocaleString()}\n\nPlease help me immediately!`;

  // Open SMS app with pre-filled SOS message
  const phoneNumbers = contacts.map((c) => c.phone).join(',');
  const smsUrl = `sms:${phoneNumbers}?body=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(smsUrl);
  } catch (error) {
    console.error('Error opening SOS SMS:', error);
    // Fallback: try individual SMS links
    for (const contact of contacts) {
      const individualSmsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      try {
        await Linking.openURL(individualSmsUrl);
        await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between opens
      } catch (err) {
        console.error(`Error opening SOS SMS for ${contact.name}:`, err);
      }
    }
  }
}

