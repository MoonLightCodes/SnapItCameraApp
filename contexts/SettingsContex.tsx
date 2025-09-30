import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Storage } from '../utils/storage';
import { AppSettings, Theme } from '../types';
import { useColorScheme } from 'react-native';

const defaultSettings: AppSettings = {
  theme: 'system',
  defaultMode: 'video',
  videoResolution: '1080p',
  timestampFormat: '24h',
  timezone: 'device',
  locationTagging: false,
  autoDeleteDays: 0,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  isDark: boolean;
  currentTheme: Theme;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await Storage.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await Storage.saveSettings(updatedSettings);
  };

  const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemColorScheme === 'dark');
  const currentTheme = settings.theme;

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      isDark, 
      currentTheme 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};