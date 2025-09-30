import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Text,
  ScrollView
} from 'react-native';
import { Camera as ExpoCamera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Storage } from '../utils/storage';
import { AppSettings, LocationData } from '../types';
import { useFocusEffect } from 'expo-router';

interface CameraViewProps {
  settings: AppSettings;
}

const CameraView: React.FC<CameraViewProps> = ({ settings }) => {
  const [facing, setFacing] = useState<CameraType>(CameraType.back);
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [cameraKey, setCameraKey] = useState<number>(0);

  const cameraRef = useRef<ExpoCamera>(null);
  const recordingStartTime = useRef<number>(0);
  const timeIntervalRef = useRef<NodeJS.Timeout>();
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const locationWatchRef = useRef<Location.LocationSubscription>();
  const isMountedRef = useRef<boolean>(true);

  // Update date and time
  const updateDateTime = useCallback(() => {
    if (!isMountedRef.current) return;
    
    const now = new Date();
    
    // Format time based on settings
    const timeString = settings.timestampFormat === '12h' 
      ? now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })
      : now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Format date
    const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    setCurrentTime(timeString);
    setCurrentDate(dateString);
  }, [settings.timestampFormat]);

  // Format recording duration
  const formatRecordingDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get address from coordinates
  const getAddressFromCoords = async (location: LocationData): Promise<string> => {
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (address.length > 0) {
        const addr = address[0];
        const parts = [];
        if (addr.street) parts.push(addr.street);
        if (addr.city) parts.push(addr.city);
        if (addr.region) parts.push(addr.region);
        if (addr.country) parts.push(addr.country);
        return parts.join(', ');
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unable to get address';
    }
  };

  // Initialize permissions and location
  const initializeCamera = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    console.log('Initializing camera...');
    
    try {
      // Reset camera state
      setCameraReady(false);
      setIsRecording(false);
      setRecordingDuration(0);

      // Request camera permissions
      const { status: cameraStatus } = await ExpoCamera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
      console.log('Camera permission:', cameraStatus);

      // Request microphone permissions
      const { status: audioStatus } = await ExpoCamera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus === 'granted');
      console.log('Audio permission:', audioStatus);

      // Request location permissions if enabled in settings
      if (settings.locationTagging) {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus === 'granted');
        console.log('Location permission:', locationStatus);

        if (locationStatus === 'granted') {
          // Get current location
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setCurrentLocation(location.coords);
            
            // Get address
            const address = await getAddressFromCoords(location.coords);
            setCurrentAddress(address);
          } catch (locationError) {
            console.error('Error getting location:', locationError);
          }

          // Watch location updates
          if (locationWatchRef.current) {
            locationWatchRef.current.remove();
          }
          
          locationWatchRef.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 30000,
              distanceInterval: 10,
            },
            (newLocation) => {
              if (isMountedRef.current) {
                setCurrentLocation(newLocation.coords);
                getAddressFromCoords(newLocation.coords).then(setCurrentAddress);
              }
            }
          );
        }
      }

      // Start time updates
      updateDateTime();
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      timeIntervalRef.current = setInterval(updateDateTime, 1000);

      // Force camera remount by changing key
      setCameraKey(prev => prev + 1);

    } catch (error) {
      console.error('Error initializing camera:', error);
    }
  }, [settings.locationTagging, updateDateTime]);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up camera...');
    
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = undefined;
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = undefined;
    }
    
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = undefined;
    }
    
    setCameraReady(false);
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  // Handle focus effect for navigation
  useFocusEffect(
    useCallback(() => {
      console.log('Camera screen focused - initializing camera');
      isMountedRef.current = true;
      initializeCamera();

      return () => {
        console.log('Camera screen unfocused - cleaning up');
        isMountedRef.current = false;
        cleanup();
      };
    }, [initializeCamera, cleanup])
  );

  const toggleCameraFacing = () => {
    setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const takePicture = async () => {
    if (cameraRef.current && cameraReady && isMountedRef.current) {
      try {
        console.log('Taking picture...');
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          exif: true,
        });

        if (photo && photo.uri) {
          await Storage.saveMedia({
            uri: photo.uri,
            type: 'image',
            duration: 0,
            location: currentLocation,
            address: currentAddress,
            timestamp: new Date().toISOString(),
            resolution: settings.videoResolution,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
          });

          Alert.alert('Success', 'Photo saved!', [{ text: 'OK' }]);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    } else {
      Alert.alert('Error', 'Camera is not ready');
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording && cameraReady && isMountedRef.current) {
      // Check if we have both camera and audio permissions
      if (!hasAudioPermission) {
        Alert.alert(
          'Microphone Permission Required',
          'This app needs microphone access to record video with audio. Please grant microphone permission in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        console.log('Starting recording...');
        setIsRecording(true);
        setRecordingDuration(0);
        recordingStartTime.current = Date.now();
        
        // Start recording duration timer
        recordingIntervalRef.current = setInterval(() => {
          if (isMountedRef.current) {
            setRecordingDuration(prev => prev + 1);
          }
        }, 1000);
        
        const video = await cameraRef.current.recordAsync({
          quality: ExpoCamera.Constants.VideoQuality['1080p'],
        });

        if (video && video.uri && isMountedRef.current) {
          const duration = Math.floor((Date.now() - recordingStartTime.current) / 1000);
          
          await Storage.saveMedia({
            uri: video.uri,
            type: 'video',
            duration: duration,
            location: currentLocation,
            address: currentAddress,
            timestamp: new Date().toISOString(),
            resolution: settings.videoResolution,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
          });

          Alert.alert('Success', 'Video saved!', [{ text: 'OK' }]);
        }
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video. Please check if microphone permission is granted.');
      } finally {
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = undefined;
        }
        if (isMountedRef.current) {
          setIsRecording(false);
          setRecordingDuration(0);
        }
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      console.log('Stopping recording...');
      cameraRef.current.stopRecording();
      setIsRecording(false);
      setRecordingDuration(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = undefined;
      }
    }
  };

  const handleCameraReady = () => {
    console.log('Camera is ready and running');
    setCameraReady(true);
  };

  // Check permissions
  if (hasCameraPermission === null || hasAudioPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting permissions...</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={initializeCamera}>
          <Text style={styles.permissionButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={initializeCamera}>
          <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasAudioPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need microphone access to record videos with audio</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={initializeCamera}>
          <Text style={styles.permissionButtonText}>Grant Microphone Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ExpoCamera 
        key={cameraKey}
        ref={cameraRef}
        style={styles.camera}
        type={facing}
        onCameraReady={handleCameraReady}
      >
        {/* Top Overlay with Date, Time, and Recording Indicator */}
        <View style={styles.topOverlay}>
          <View style={styles.datetimeContainer}>
            <Text style={styles.dateText}>{currentDate}</Text>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
          
          {/* Recording Duration */}
          {isRecording && (
            <View style={styles.recordingContainer}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>REC</Text>
              </View>
              <Text style={styles.durationText}>
                {formatRecordingDuration(recordingDuration)}
              </Text>
            </View>
          )}
        </View>

        {/* Location Overlay */}
        {settings.locationTagging && currentLocation && (
          <View style={styles.locationOverlay}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.locationScrollContent}
            >
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="white" />
                <Text style={styles.locationText}>
                  {currentAddress || `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.controlsContainer}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.captureContainer}>
              {settings.defaultMode === 'video' ? (
                <TouchableOpacity
                  style={[styles.videoButton, isRecording && styles.recordingButton]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={!cameraReady}
                >
                  <View style={[styles.videoButtonInner, isRecording && styles.recordingButtonInner]} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.photoButton} 
                  onPress={takePicture}
                  disabled={!cameraReady}
                >
                  <View style={styles.photoButtonInner} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ExpoCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  datetimeContainer: {
    flex: 1,
  },
  dateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 2,
  },
  timeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  recordingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
    marginRight: 4,
  },
  recordingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  durationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationOverlay: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  locationScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: '100%',
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
    flexShrink: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // alignItems: 'flex-end',
    padding: 20,
    paddingTop: 550,
    
  },
  bottomControls: {
    bottom: "10%",
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
    marginBottom: 10,
  },
  captureContainer: {
    alignItems: 'center',
  },
  iconButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 50,
  },
  videoButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordingButton: {
    backgroundColor: 'rgba(255,0,0,0.3)',
    borderColor: '#ff3b30',
  },
  videoButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff3b30',
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#ff3b30',
  },
  photoButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  photoButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
  },
});

export default CameraView;