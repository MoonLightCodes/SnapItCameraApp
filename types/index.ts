export type VideoResolution = '720p' | '1080p' | '4K' | 'auto';
export type Theme = 'system' | 'light' | 'dark';
export type TimestampFormat = '12h' | '24h';
export type CameraMode = 'video' | 'photo';

export interface AppSettings {
  theme: Theme;
  defaultMode: CameraMode;
  videoResolution: VideoResolution;
  timestampFormat: TimestampFormat;
  timezone: string;
  locationTagging: boolean;
  autoDeleteDays: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface VideoMetadata {
  date: string;
  time: string;
  location: string | null;
  address: string | null;
  duration: string;
  resolution: string;
}

export interface SavedVideo {
  id: string;
  uri: string;
  type: 'video' | 'image';
  duration: number;
  location: LocationData | null;
  address: string | null;
  timestamp: string;
  resolution: string;
  date: string;
  time: string;
  createdAt: string;
  metadata?: VideoMetadata;
}

export interface PhotoMetadata {
  uri: string;
  location: string | null;
  address: string | null;
  timestamp: string;
  date: string;
  time: string;
}