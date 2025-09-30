import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContex';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Theme, VideoResolution, TimestampFormat, CameraMode } from '../types';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { settings, updateSettings, isDark } = useSettings();
  const router = useRouter();

  const [localSettings, setLocalSettings] = useState(settings);

  const saveSettings = () => {
    updateSettings(localSettings);
    Alert.alert('Success', 'Settings saved successfully!');
    router.back();
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setLocalSettings({
              theme: 'system',
              defaultMode: 'video',
              videoResolution: '1080p',
              timestampFormat: '24h',
              timezone: 'device',
              locationTagging: true,
              autoDeleteDays: 0,
            });
          }
        },
      ]
    );
  };

  const themeColors = {
    light: {
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#333333',
      secondaryText: '#666666',
      border: '#e0e0e0',
      primary: '#007AFF',
      danger: '#ff3b30',
    },
    dark: {
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      secondaryText: '#aaaaaa',
      border: '#333333',
      primary: '#0A84FF',
      danger: '#ff453a',
    }
  };

  const colors = isDark ? themeColors.dark : themeColors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 16,
      lineHeight: 20,
    },
    optionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    option: {
      flex: 1,
      minWidth: (width - 72) / 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#2c2c2e' : '#f8f9fa',
      borderWidth: 2,
      borderColor: 'transparent',
      gap: 8,
    },
    optionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '600',
    },
    optionTextSelected: {
      color: 'white',
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    toggleTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    toggleText: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '600',
    },
    toggleTrack: {
      width: 60,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      padding: 2,
    },
    toggleTrackOn: {
      backgroundColor: colors.primary,
    },
    toggleTrackOff: {
      backgroundColor: isDark ? '#48484a' : '#ccc',
    },
    toggleThumb: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'white',
    },
    toggleThumbOn: {
      alignSelf: 'flex-end',
    },
    toggleThumbOff: {
      alignSelf: 'flex-start',
    },
    actions: {
      gap: 16,
      marginTop: 24,
      marginBottom: 40,
    },
    saveButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 18,
      borderRadius: 16,
      gap: 12,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    resetButton: {
      backgroundColor: 'transparent',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 18,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.danger,
      gap: 12,
    },
    resetButtonText: {
      color: colors.danger,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Theme Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.optionGroup}>
            {(['system', 'light', 'dark'] as Theme[]).map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.option,
                  localSettings.theme === theme && styles.optionSelected
                ]}
                onPress={() => setLocalSettings({ ...localSettings, theme })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={theme === 'dark' ? 'moon' : theme === 'light' ? 'sunny' : 'phone-portrait'} 
                  size={20} 
                  color={localSettings.theme === theme ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.optionText,
                  localSettings.theme === theme && styles.optionTextSelected
                ]}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Default Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Mode</Text>
          <View style={styles.optionGroup}>
            {(['video', 'photo'] as CameraMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.option,
                  localSettings.defaultMode === mode && styles.optionSelected
                ]}
                onPress={() => setLocalSettings({ ...localSettings, defaultMode: mode })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={mode === 'video' ? "videocam" : "camera"} 
                  size={20} 
                  color={localSettings.defaultMode === mode ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.optionText,
                  localSettings.defaultMode === mode && styles.optionTextSelected
                ]}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Video Resolution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Resolution</Text>
          <View style={styles.optionGroup}>
            {(['720p', '1080p', '4K', 'auto'] as VideoResolution[]).map((resolution) => (
              <TouchableOpacity
                key={resolution}
                style={[
                  styles.option,
                  localSettings.videoResolution === resolution && styles.optionSelected
                ]}
                onPress={() => setLocalSettings({ ...localSettings, videoResolution: resolution })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="tv" 
                  size={20} 
                  color={localSettings.videoResolution === resolution ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.optionText,
                  localSettings.videoResolution === resolution && styles.optionTextSelected
                ]}>
                  {resolution === 'auto' ? 'Auto (Best)' : resolution}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Timestamp Format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timestamp Format</Text>
          <View style={styles.optionGroup}>
            {(['12h', '24h'] as TimestampFormat[]).map((format) => (
              <TouchableOpacity
                key={format}
                style={[
                  styles.option,
                  localSettings.timestampFormat === format && styles.optionSelected
                ]}
                onPress={() => setLocalSettings({ ...localSettings, timestampFormat: format })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="time" 
                  size={20} 
                  color={localSettings.timestampFormat === format ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.optionText,
                  localSettings.timestampFormat === format && styles.optionTextSelected
                ]}>
                  {format === '12h' ? '12-hour' : '24-hour'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location Tagging */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Tagging</Text>
          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setLocalSettings({ 
              ...localSettings, 
              locationTagging: !localSettings.locationTagging 
            })}
            activeOpacity={0.7}
          >
            <View style={styles.toggleTextContainer}>
              <Ionicons 
                name={localSettings.locationTagging ? "location" : "lock-closed"} 
                size={24} 
                color={localSettings.locationTagging ? colors.primary : colors.secondaryText} 
              />
              <Text style={styles.toggleText}>
                {localSettings.locationTagging ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={[
              styles.toggleTrack,
              localSettings.locationTagging ? styles.toggleTrackOn : styles.toggleTrackOff
            ]}>
              <View style={[
                styles.toggleThumb,
                localSettings.locationTagging ? styles.toggleThumbOn : styles.toggleThumbOff
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Auto Delete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto Delete Videos</Text>
          <Text style={styles.sectionSubtitle}>Delete videos after N days (0 = never delete)</Text>
          <View style={styles.optionGroup}>
            {[0, 7, 30, 90].map((days) => (
              <TouchableOpacity
                key={days}
                style={[
                  styles.option,
                  localSettings.autoDeleteDays === days && styles.optionSelected
                ]}
                onPress={() => setLocalSettings({ ...localSettings, autoDeleteDays: days })}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={days === 0 ? "infinite" : "calendar"} 
                  size={20} 
                  color={localSettings.autoDeleteDays === days ? 'white' : colors.text} 
                />
                <Text style={[
                  styles.optionText,
                  localSettings.autoDeleteDays === days && styles.optionTextSelected
                ]}>
                  {days === 0 ? 'Never' : `${days} days`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={20} color={colors.danger} />
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}