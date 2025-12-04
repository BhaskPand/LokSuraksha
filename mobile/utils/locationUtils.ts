import * as Location from 'expo-location';

/**
 * Get city name from current location using reverse geocoding
 */
export async function getCityName(): Promise<string> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return 'Location not available';
    }

    const location = await Location.getCurrentPositionAsync({});
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (reverseGeocode && reverseGeocode.length > 0) {
      const address = reverseGeocode[0];
      // Try to get city, subAdministrativeArea, or locality
      return (
        address.city ||
        address.subAdministrativeArea ||
        address.locality ||
        address.region ||
        'Unknown Location'
      );
    }

    return 'Unknown Location';
  } catch (error) {
    console.error('Error getting city name:', error);
    return 'Location unavailable';
  }
}




