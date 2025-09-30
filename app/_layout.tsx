import { Stack } from "expo-router";
import { SettingsProvider } from "../contexts/SettingsContex";
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

// Theme wrapper component
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initializeLinking = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('App opened with URL:', initialUrl);
        }
      } catch (error) {
        console.log('Linking initialization error:', error);
      }
    };

    initializeLinking();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ThemeWrapper>
        <Stack screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="settings" options={{ 
            headerShown: true, 
            title: "Settings",
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} />
          <Stack.Screen name="videos" options={{ 
            headerShown: false, 
            title: "My Videos",
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} />
        </Stack>
      </ThemeWrapper>
    </SettingsProvider>
  );
}