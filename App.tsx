import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { useAuthStore } from './src/store/authStore';
import { initApiClient } from './src/api/client';
import { authApi } from './src/api/auth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
    mutations: { retry: 0 },
  },
});

function SplashScreen() {
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 180 }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1.15, useNativeDriver: true, damping: 10, stiffness: 120 }),
        Animated.timing(ringOpacity, { toValue: 0.25, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={ss.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {/* Outer pulse ring */}
      <Animated.View style={[ss.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      {/* Logo mark */}
      <Animated.View style={[ss.logoWrap, { transform: [{ scale }], opacity }]}>
        <View style={ss.logoInner}>
          <Text style={ss.logoLetter}>V</Text>
        </View>
      </Animated.View>
      {/* Brand text */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={ss.brandName}>Vestrs</Text>
        <Text style={ss.tagline}>Invest globally, simply.</Text>
      </Animated.View>
    </View>
  );
}

function AppContent() {
  const { loadFromStorage } = useAuthStore();
  const [appReady, setAppReady] = useState(false);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initApiClient(
      () => useAuthStore.getState().accessToken,
      () => useAuthStore.getState().refreshToken,
      (access, refresh) => useAuthStore.getState().setTokens(access, refresh),
      () => useAuthStore.getState().logout()
    );

    const init = async () => {
      await loadFromStorage();
      const state = useAuthStore.getState();
      if (state.accessToken) {
        try {
          const user = await authApi.getMe();
          useAuthStore.getState().setUser(user);
        } catch {
          useAuthStore.getState().logout();
        }
      }
      // Keep splash visible for at least 1.4s
      await new Promise((r) => setTimeout(r, 1400));
      setAppReady(true);
    };

    init();
  }, []);

  useEffect(() => {
    if (appReady) {
      Animated.timing(contentOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [appReady]);

  if (!appReady) return <SplashScreen />;

  return (
    <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
      <ExpoStatusBar style="dark" />
      <RootNavigator />
    </Animated.View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const ss = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#fff',
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: colors.primaryMuted,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
