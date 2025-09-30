import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, SavedVideo, LocationData } from '../types';

const SETTINGS_KEY = 'app_settings';
const MEDIA_KEY = 'saved_media';

const defaultSettings: AppSettings = {
  theme: 'system',
  defaultMode: 'video',
  videoResolution: '1080p',
  timestampFormat: '24h',
  timezone: 'device',
  locationTagging: false,
  autoDeleteDays: 0,
};

export const Storage = {
  // Settings functions
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      return settings ? JSON.parse(settings) : defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return defaultSettings;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  // Media functions
  async getVideos(): Promise<SavedVideo[]> {
    try {
      const media = await AsyncStorage.getItem(MEDIA_KEY);
      const allMedia = media ? JSON.parse(media) : [];
      // Return only videos with proper typing
      return allMedia
        .filter((item: any) => item.type === 'video')
        .map((item: any) => ({
          ...item,
          date: item.date || new Date(item.timestamp).toLocaleDateString(),
          time: item.time || new Date(item.timestamp).toLocaleTimeString(),
          // Ensure location is properly typed
          location: item.location ? (item.location as LocationData) : null,
        }));
    } catch (error) {
      console.error('Error getting videos:', error);
      return [];
    }
  },

  async saveMedia(mediaData: Omit<SavedVideo, 'id' | 'createdAt'>): Promise<void> {
    try {
      const allMediaJson = await AsyncStorage.getItem(MEDIA_KEY);
      const allMedia = allMediaJson ? JSON.parse(allMediaJson) : [];
      
      const newMedia: SavedVideo = {
        ...mediaData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      allMedia.push(newMedia);
      await AsyncStorage.setItem(MEDIA_KEY, JSON.stringify(allMedia));
      console.log('Media saved successfully:', newMedia.id);
    } catch (error) {
      console.error('Error saving media:', error);
    }
  },

  async deleteVideo(id: string): Promise<void> {
    try {
      const allMediaJson = await AsyncStorage.getItem(MEDIA_KEY);
      if (allMediaJson) {
        const allMedia = JSON.parse(allMediaJson);
        const filtered = allMedia.filter((item: SavedVideo) => item.id !== id);
        await AsyncStorage.setItem(MEDIA_KEY, JSON.stringify(filtered));
        console.log('Video deleted:', id);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  },
};