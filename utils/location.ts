import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string|null;
}

export const LocationService = {
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      // Check if location services are enabled
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for location tagging');
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? 
          `${address[0].name || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() 
          : null,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  formatLocation(location: LocationData): string {
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  },
};