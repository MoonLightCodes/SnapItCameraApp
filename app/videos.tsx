import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Dimensions,
  Animated,
  PanResponder,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Storage } from '../utils/storage';
import * as MediaLibrary from 'expo-media-library';
import { Video, ResizeMode } from 'expo-av';
import { SavedVideo, LocationData } from '../types';
import { useSettings } from '../contexts/SettingsContex';

const { width, height } = Dimensions.get('window');

export default function VideosScreen() {
  const [videos, setVideos] = useState<SavedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null);
  const router = useRouter();
  const { isDark, currentTheme } = useSettings();
  
  // Animation values for bottom sheet
  const translateY = useRef(new Animated.Value(height * 0.8)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(0, gestureState.dy);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = height * 0.3;
        
        if (gestureState.dy < -threshold) {
          openSheet();
        } else if (gestureState.dy > threshold) {
          closeSheet();
        } else {
          if (gestureState.dy < 0) {
            openSheet();
          } else {
            closeSheet();
          }
        }
      },
    })
  ).current;

  const openSheet = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const closeSheet = () => {
    Animated.spring(translateY, {
      toValue: height * 0.8,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const savedVideos = await Storage.getVideos();
      setVideos(savedVideos);
    } catch (error) {
      console.error('Error loading videos:', error);
      Alert.alert('Error', 'Failed to load videos');
    }
  };

  const deleteVideo = async (video: SavedVideo) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await Storage.deleteVideo(video.id);
              try {
                await MediaLibrary.deleteAssetsAsync([video.uri]);
              } catch (e) {
                console.log('Could not delete from media library:', e);
              }
              
              setVideos(prev => prev.filter(v => v.id !== video.id));
              if (selectedVideo?.id === video.id) {
                setSelectedVideo(null);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete video');
            }
          }
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLocation = (location: LocationData | null) => {
    if (!location) return 'No location data';
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const openInMaps = async (location: LocationData) => {
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open maps app');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open maps');
    }
  };

  // Theme colors
  const themeColors = {
    light: {
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#333333',
      secondaryText: '#666666',
      border: '#e0e0e0',
      primary: '#007AFF',
      danger: '#ff3b30',
      card: '#ffffff',
      header: '#ffffff',
    },
    dark: {
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
      secondaryText: '#aaaaaa',
      border: '#333333',
      primary: '#0A84FF',
      danger: '#ff453a',
      card: '#1e1e1e',
      header: '#1e1e1e',
    }
  };

  const colors = isDark ? themeColors.dark : themeColors.light;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    videoDetailContainer: {
      flex: 1,
      backgroundColor: 'black',
    },
    videoPlayerContainer: {
      height: height * 0.8,
      backgroundColor: 'black',
      position: 'relative',
    },
    videoPlayer: {
      flex: 1,
      width: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 8,
      zIndex: 10,
    },
    bottomSheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: height,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: isDark ? 0.5 : 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dragHandle: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 12,
    },
    dragHandleBar: {
      width: 40,
      height: 4,
      backgroundColor: isDark ? '#555555' : '#cccccc',
      borderRadius: 2,
    },
    bottomSheetContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.header,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.secondaryText,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 8,
      textAlign: 'center',
      marginBottom: 24,
    },
    recordButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    recordButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    videoCard: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    videoThumbnail: {
      width: 80,
      height: 60,
      backgroundColor: isDark ? '#333333' : '#444444',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      position: 'relative',
    },
    durationBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    durationText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
    },
    videoDetails: {
      flex: 1,
    },
    videoDate: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    videoTime: {
      fontSize: 14,
      color: colors.secondaryText,
      marginTop: 2,
    },
    videoResolution: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 4,
      fontWeight: '600',
    },
    locationIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    locationIndicatorText: {
      fontSize: 11,
      color: colors.primary,
      marginLeft: 4,
    },
    deleteIcon: {
      padding: 8,
    },
    infoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      color: colors.text,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: 16,
      color: colors.secondaryText,
      fontWeight: '500',
      flex: 1,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text,
      flex: 2,
      textAlign: 'right',
    },
    locationButton: {
      flex: 2,
    },
    locationContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    locationText: {
      fontSize: 16,
      color: colors.primary,
      marginHorizontal: 6,
      textAlign: 'right',
    },
    deleteButton: {
      flexDirection: 'row',
      backgroundColor: colors.danger,
      marginVertical: 20,
      paddingVertical: 16,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      shadowColor: colors.danger,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    deleteButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  if (selectedVideo) {
    return (
      <View style={styles.videoDetailContainer}>
        {/* Video Player - Takes 80% of screen */}
        <View style={styles.videoPlayerContainer}>
          <Video
            source={{ uri: selectedVideo.uri }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedVideo(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bottom Sheet */}
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle}>
            <View style={styles.dragHandleBar} />
          </View>

          <ScrollView 
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.infoTitle}>Video Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>{formatDuration(selectedVideo.duration)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Resolution:</Text>
              <Text style={styles.infoValue}>{selectedVideo.resolution}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recorded:</Text>
              <Text style={styles.infoValue}>
                {selectedVideo.date} {selectedVideo.time}
              </Text>
            </View>

            {/* Location Information */}
            {selectedVideo.location && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location:</Text>
                  <TouchableOpacity 
                    onPress={() => openInMaps(selectedVideo.location!)}
                    style={styles.locationButton}
                  >
                    <View style={styles.locationContent}>
                      <Ionicons name="location" size={16} color={colors.primary} />
                      <Text style={styles.locationText}>
                        {formatLocation(selectedVideo.location)}
                      </Text>
                      <Ionicons name="open-outline" size={16} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                </View>

                {selectedVideo.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{selectedVideo.address}</Text>
                  </View>
                )}
              </>
            )}

            {/* Delete Button */}
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteVideo(selectedVideo)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.deleteButtonText}>Delete Video</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Videos</Text>
        <TouchableOpacity 
          onPress={loadVideos}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {videos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-off-outline" size={64} color={colors.secondaryText} />
            <Text style={styles.emptyText}>No videos yet</Text>
            <Text style={styles.emptySubtext}>Record some videos to see them here</Text>
            <TouchableOpacity 
              style={styles.recordButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.recordButtonText}>Start Recording</Text>
            </TouchableOpacity>
          </View>
        ) : (
          videos.map((video) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              onPress={() => setSelectedVideo(video)}
              activeOpacity={0.7}
            >
              <View style={styles.videoThumbnail}>
                <Ionicons name="play-circle" size={40} color="white" />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {formatDuration(video.duration)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.videoDetails}>
                <Text style={styles.videoDate}>
                  {video.date}
                </Text>
                <Text style={styles.videoTime}>
                  {video.time}
                </Text>
                <Text style={styles.videoResolution}>
                  {video.resolution}
                </Text>
                {video.location && (
                  <View style={styles.locationIndicator}>
                    <Ionicons name="location" size={12} color={colors.primary} />
                    <Text style={styles.locationIndicatorText}>
                      Location tagged
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.deleteIcon}
                onPress={() => deleteVideo(video)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}