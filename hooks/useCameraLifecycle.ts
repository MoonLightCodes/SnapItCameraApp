import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { AppState } from 'react-native';

export const useCameraLifecycle = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [key, setKey] = useState(0);
  const appState = useRef(AppState.currentState);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        console.log('App came to foreground, resetting camera');
        setKey(prev => prev + 1);
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App going to background
        setIsCameraActive(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle screen focus/unfocus using Expo Router's useFocusEffect
  useFocusEffect(
    useCallback(() => {
      console.log('Camera screen focused, activating camera');
      setIsCameraActive(true);
      setKey(prev => prev + 1); // Force remount

      return () => {
        console.log('Camera screen unfocused, deactivating camera');
        setIsCameraActive(false);
      };
    }, [])
  );

  return { isCameraActive, key };
};