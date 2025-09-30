import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, BackHandler, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../contexts/SettingsContex';
import CameraView from '../components/CameraView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

export default function CameraScreen() {
  const { settings } = useSettings();
  const router = useRouter();
  const [isCameraActive, setIsCameraActive] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      console.log('Camera screen focused - activating camera');
      setIsCameraActive(true);

      return () => {
        console.log('Camera screen unfocused - deactivating camera');
        setIsCameraActive(false);
      };
    }, [])
  );

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) {
        router.back();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      {isCameraActive && <CameraView settings={settings} />}
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => {
            setIsCameraActive(false);
            router.push('/videos');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="play-circle-outline" size={28} color="white" />
          <Text style={styles.navText}>Videos</Text>
        </TouchableOpacity>
        
        <View style={styles.navSpacer} />
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => {
            setIsCameraActive(false);
            router.push('/settings');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={28} color="white" />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 100,
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  navSpacer: {
    width: 40,
  },
});