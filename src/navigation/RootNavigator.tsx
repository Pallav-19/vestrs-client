import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore, OnboardingStep } from '../store/authStore';
import { OnboardingNavigator } from './OnboardingNavigator';
import { DashboardNavigator } from './DashboardNavigator';
import { KycScreen } from '../screens/onboarding/KycScreen';
import { AccreditationScreen } from '../screens/onboarding/AccreditationScreen';
import { BankLinkScreen } from '../screens/onboarding/BankLinkScreen';

export type RootStackParamList = {
  Auth: undefined;
  KYC: undefined;
  Accreditation: undefined;
  BankLink: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const KYC_STEPS: OnboardingStep[] = ['REGISTERED', 'KYC_INITIATED', 'KYC_FAILED'];

const ACCRED_STEPS: OnboardingStep[] = [
  'KYC_SUCCESS',
  'ACCRED_INITIATED',
  'ACCRED_FAILED',
];

export const RootNavigator: React.FC = () => {
  const { user } = useAuthStore();
  const step = user?.onboardingStep;

  if (!user || !step) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Auth" component={OnboardingNavigator} />
      </Stack.Navigator>
    );
  }

  if (KYC_STEPS.includes(step)) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="KYC" component={KycScreen} />
      </Stack.Navigator>
    );
  }

  if (ACCRED_STEPS.includes(step)) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Accreditation" component={AccreditationScreen} />
      </Stack.Navigator>
    );
  }

  if (step === 'ACCRED_SUCCESS') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="BankLink" component={BankLinkScreen} />
      </Stack.Navigator>
    );
  }

  if (step === 'COMPLETE') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      </Stack.Navigator>
    );
  }

  // Default fallback to auth
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Auth" component={OnboardingNavigator} />
    </Stack.Navigator>
  );
};
